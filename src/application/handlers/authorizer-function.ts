import IamService from '../services/IamService'
import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda'
import { AppError } from '../../utils/appError'
import { HTTP_STATUS_CODE } from '../../utils/HttpClient/http-status-codes'
import { getUserById } from '../infrastructure/database/pg/query-helpers'
import { pick } from 'lodash'
import { redactCustomerDetails } from '../../utils/RedactCustomerDetails'
import AuthService from '../services/auth-service'
import logger from '../services/logging'

export const mainFunction = async function (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  console.log('----99----')
  console.log(JSON.stringify(event))
  console.log('====99====')
  const iamService = new IamService()
  const methodArn = event.methodArn

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
      logger.info(message)

      throw new AppError(message, HTTP_STATUS_CODE.UNAUTHORIZED)
    }

    logger.info('attemting to grant access....')
    return iamService.generateResponse('user', 'Allow', methodArn, {
      user,
    })
  } catch (err) {
    const error = err as AppError

    const errorContext = {
      user: null,
      message: error.message,
      statuscode: error.statusCode,
      isOperational: error?.isOperational,
    }

    logger.error('Error while trying to grant access', errorContext)

    return iamService.generateResponse('user', 'Deny', methodArn, errorContext)
  }
}

import { HookContext, hooks, NextFunction } from '@feathersjs/hooks'

const logRuntime = async (context: any, next: NextFunction) => {
  const start = new Date().getTime()

  await next()

  const end = new Date().getTime()

  console.log(
    `Function '${context?.method || '[no name]'}' returned '${
      context.result
    }' after ${end - start}ms`
  )
}

const logEvent = async (
  context: HookContext<APIGatewayRequestAuthorizerEvent>,
  next: NextFunction
) => {
  const { 0: event } = context.arguments

  event.user = {
    name: 'slsl',
    sll: '',
  }

  const pickedEvent = pick(event, ['type', 'methodArn', 'path', 'headers'])
  logger.info('authorizer request handler', redactCustomerDetails(pickedEvent))

  // Always has to be called
  return next()
}

export const lambdaHandler = hooks(mainFunction, [logRuntime, logEvent])
