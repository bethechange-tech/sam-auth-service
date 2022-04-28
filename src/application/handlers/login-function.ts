import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { redactCustomerDetails } from '../../utils/RedactCustomerDetails'
import { AppError } from '../../utils/appError'
import db from '../infrastructure/database/postgres-connection'
import bcrypt from 'bcryptjs';

const correctPassword = async function(
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


export const lambdaHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) throw new Error('Invalid request payload')

  const loginParsedBody = JSON.parse(event.body) as any
  console.info('login request', {
    request: redactCustomerDetails(loginParsedBody),
  })

  const { email, password } = loginParsedBody

  try {
    // 1) Check if email and password exist
    if (!email || !password) {
      throw new AppError('Please provide email and password!', 400)
    }


    // 2) Check if user exists && password is correct
    const resultParams = await db.query<{ password: string }>(
      `SELECT * FROM user8 WHERE email = :email`,
      { email }
    )

    const user = resultParams.records[0]

    if (!user || !(await correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 3) If everything ok, send token to client
    // createSendToken(user, 200, req, res);
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    }
  } catch (err) {
    const error = err as AppError
    console.error(error)

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if(error.isOperational) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          status: error.status,
          message: error.message
        }),
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: 'Something went very wrong!'
      }),
    }
  }
}
