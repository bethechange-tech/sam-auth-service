import { APIGatewayAuthorizerResult } from 'aws-lambda'

/**
 * @class IamService used for authenticating users
 */
export default class IamService {
  generateAuthResponse(
    principalId: string,
    effect: string,
    methodArn: string,
    permissionData = { authorizer: true }
  ): APIGatewayAuthorizerResult {
    const policyDocument = this.generatePolicyDocument(effect, methodArn)

    return {
      context: permissionData,
      principalId,
      policyDocument,
    }
  }

  private generatePolicyDocument(
    effect: string,
    methodArn: string
  ): APIGatewayAuthorizerResult['policyDocument'] {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn,
        },
      ],
    }

    return policyDocument
  }
};
