import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { redactCustomerDetails } from '../../utils/RedactCustomerDetails'
import { AppError } from '../../utils/appError'
import { HTTP_STATUS_CODE } from '../../utils/HttpClient/http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import AuthService from '../services/auth-service'
import logger from '../services/logging'
import RDSService from '../services/rds-service'
// const validator = require('validator');

export const lambdaHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) throw new Error('Invalid request payload')

  const registerParsedBody = (JSON.parse(event.body) || {}) as {
    email: string
    password: string
  }

  logger.info('register request', {
    request: redactCustomerDetails(registerParsedBody),
  })

  const { email, password } = registerParsedBody

  try {
    // 1) Check if email and password exist in request body
    if (!email || !password) {
      throw new AppError(
        'Please provide email and password!',
        HTTP_STATUS_CODE.BAD_REQUEST
      )
    }

    const createUserRequest = { email, password, id: uuidv4() }

    // 2) create user / insert new user to database

    const rdsService = new RDSService()

    await rdsService.create(createUserRequest)

    const authService = new AuthService()

    // 3) If everything ok, send token to client
    const responseBody = authService.createAccessToken(createUserRequest)

    return {
      statusCode: HTTP_STATUS_CODE.CREATED,
      body: JSON.stringify(responseBody),
    }
  } catch (err) {
    const error = err as AppError
    logger.error('register', error)

    error.statusCode =
      error.statusCode || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR
    error.status = error.status || 'error'

    if (error?.isOperational) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          status: error.status,
          message: error.message,
        }),
      }
    }

    return {
      statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        status: 'error',
        message: 'Something went very wrong!',
      }),
    }
  }
}
