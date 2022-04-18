import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
import IamService from '../services/AuthService'

// https://github.com/adnanrahic/building-a-serverless-api-with-nodejs-and-aws-aurora-serverless/blob/master/serverless.yml
// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbcluster.html

export const lambdaHandler = async function (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult[]> {
  const generateTokenService = new IamService()
  const methodArn = event.methodArn

  // write logic to verify user access

  try {
    return generateTokenService.generateAuthResponse('user', 'Allow', methodArn)
  } catch (error) {
    console.error('Error authorising token', JSON.stringify(error))
    return generateTokenService.generateAuthResponse('user', 'Deny', methodArn)
  }
}
