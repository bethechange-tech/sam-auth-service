import IamService from '../services/IamService'
import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda'
import { AppError } from '../../utils/appError'
import { promisify } from 'util'
import jwt from 'jsonwebtoken'
import { HTTP_STATUS_CODE } from '../../utils/HttpClient/http-status-codes'
import { getUserById } from '../infrastructure/database/query-helpers'
import { pick } from 'lodash'
import { redactCustomerDetails } from '../../utils/RedactCustomerDetails'
export const lambdaHandler = async function (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  const pickedEvent = pick(event, ['type', 'methodArn', 'path'])
  console.info(
    JSON.stringify(redactCustomerDetails(pickedEvent)),
    'authorizer request handler'
  )

  const iamService = new IamService()
  const methodArn = pickedEvent.methodArn

  try {
    let token: string | null = null

    if (
      event.headers?.authorizationToken &&
      event.headers?.authorizationToken.startsWith('Bearer')
    ) {
      token = event.headers?.authorizationToken.split(' ')[1]
    }

    if (!token) {
      const message = 'You are not logged in! Please log in to get access.'
      console.info(message, 'token failed')

      throw new AppError(message, HTTP_STATUS_CODE.UNAUTHORIZED)
    }

    console.info('decoding in process....')

    // 2) Verification token
    const decoded = (await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET as string
    )) as unknown as { id: string }

    console.info('token has been decoded...')

    // 2) Check if user exists && password is correct
    const user = await getUserById(decoded.id)

    if (!user) {
      const message = 'The user belonging to this token does no longer exist.'
      console.info(message, 'user no longer exist')

      throw new AppError(message, HTTP_STATUS_CODE.UNAUTHORIZED)
    }

    console.info('attemting to grant access....')
    return iamService.generateAuthResponse('user', 'Allow', methodArn, {
      user,
    })
  } catch (err) {
    const error = err as AppError

    const context = {
      user: null,
      message: error.message,
      statuscode: error.statusCode,
      isOperational: error.isOperational,
    }

    console.error('Error while trying to grant access', JSON.stringify(context))

    return iamService.generateAuthResponse('user', 'Deny', methodArn, context)
  }
}
