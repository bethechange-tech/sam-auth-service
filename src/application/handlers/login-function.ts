import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { redactCustomerDetails } from '../../utils/RedactCustomerDetails'
import { AppError } from '../../utils/appError'
import { HTTP_STATUS_CODE } from '../../utils/HttpClient/http-status-codes'
import AuthService from '../services/auth-service'
import { getUserByEmail } from '../infrastructure/database/pg/query-helpers'
import logger from '../services/logging'

export const lambdaHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) throw new Error('Invalid request payload')

  const loginParsedBody = JSON.parse(event.body) as {
    email: string
    password: string
  }

  const authService = new AuthService()

  logger.info('login request', {
    request: redactCustomerDetails(loginParsedBody),
  })

  const { email, password } = loginParsedBody

  try {
    // 1) Check if email and password exist
    if (!email || !password) {
      throw new AppError(
        'Please provide email and password!',
        HTTP_STATUS_CODE.BAD_REQUEST
      )
    }

    // 2) Check if user exists && password is correct
    const user = await getUserByEmail(email)

    if (
      !user ||
      !(await authService.isCorrectPassword(password, user.password))
    ) {
      throw new AppError('Incorrect email or password', 401)
    }

    // 3) If everything ok, send token to client
    const responseBody = authService.createAccessToken(user)

    return {
      statusCode: HTTP_STATUS_CODE.OK,
      body: JSON.stringify(responseBody),
    }
  } catch (err) {
    const error = err as AppError
    logger.error('login error', error)

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
