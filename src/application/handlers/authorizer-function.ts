import IamService from '../services/IamService';
import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

export const lambdaHandler = async function (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  console.info('authorizer request handler');
  const generateTokenService = new IamService()
  const methodArn = event.methodArn
  try {
    return generateTokenService.generateAuthResponse('user', 'Allow', methodArn);
  } catch (error) {
    console.error('Error authorising token', JSON.stringify(error))
    return generateTokenService.generateAuthResponse('user', 'Deny', methodArn);
  }
}
