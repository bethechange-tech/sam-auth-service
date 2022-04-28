import IamService from '../services/IamService'
import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda'
import { AppError } from '../../utils/appError'
import { promisify } from 'util'
import jwt  from 'jsonwebtoken'
import { HTTP_STATUS_CODE } from '../../utils/HttpClient/http-status-codes'

export const lambdaHandler = async function (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  console.info('authorizer request handler')
  const generateTokenService = new IamService()
  const methodArn = event.methodArn
  try {
    let token = null

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
    //@ts-ignore
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET as string)

    console.log('----00----');
    console.log(JSON.stringify(decoded));
    console.log('====00====');

    return generateTokenService.generateAuthResponse('user', 'Allow', methodArn)
  } catch (error) {
    console.error('Error authorising token', JSON.stringify(error))
    return generateTokenService.generateAuthResponse('user', 'Deny', methodArn)
  }
}
