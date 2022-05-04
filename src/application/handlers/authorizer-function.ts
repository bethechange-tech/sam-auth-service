import IamService from '../services/IamService'
import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda'
import { AppError } from '../../utils/appError'
// import { promisify } from 'util'
// import jwt from 'jsonwebtoken'
import { HTTP_STATUS_CODE } from '../../utils/HttpClient/http-status-codes'
import { getUserById } from '../infrastructure/database/pg/query-helpers'
import { pick } from 'lodash'
import { redactCustomerDetails } from '../../utils/RedactCustomerDetails'
import AuthService from '../services/auth-service'
import logger from '../services/logging'

export const lambdaHandler = async function (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  const pickedEvent = pick(event, ['type', 'methodArn', 'path'])
  logger.info('authorizer request handler', redactCustomerDetails(pickedEvent))

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
      logger.info(message)
      throw new AppError(message, HTTP_STATUS_CODE.UNAUTHORIZED)
    }

    logger.info('decoding in process....')

    // 2) Verification token
    const authService = new AuthService()
    const decoded = await authService.verifyAccessToken(token)

    logger.info('token has been decoded...')

    // 2) Check if user exists && password is correct
    const user = await getUserById(decoded.id)
    logger.info('user from database', redactCustomerDetails(user))

    if (!user) {
      const message = 'The user belonging to this token does no longer exist.'
      logger.info(message + ' user no longer exist')

      throw new AppError(message, HTTP_STATUS_CODE.UNAUTHORIZED)
    }

    logger.info('attemting to grant access....')
    return iamService.generateAuthResponse('user', 'Allow', methodArn, {
      user,
    })
  } catch (err) {
    const error = err as AppError

    const context = {
      user: null,
      message: error.message,
      statuscode: error.statusCode,
      isOperational: error?.isOperational,
    }

    logger.error('Error while trying to grant access', context)

    return iamService.generateAuthResponse('user', 'Deny', methodArn, context)
  }
}
