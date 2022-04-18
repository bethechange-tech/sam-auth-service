import { CustomAuthorizerResult } from 'aws-lambda';

export enum Permission {
  Allow = 'Allow',
  Deny = 'Deny',
}

export default class CustomAuthorizerResponse {
  public static allow(principalId?: string): CustomAuthorizerResult {
    return CustomAuthorizerResponse.createResponse(Permission.Allow, principalId);
  }

  public static deny(): CustomAuthorizerResult {
    return CustomAuthorizerResponse.createResponse(Permission.Deny);
  }

  private static createResponse(
    permission: Permission,
    principalId = 'anonymous',
  ): CustomAuthorizerResult {
    return {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: permission,
            Resource: '*',
          },
        ],
      },
    };
  }
}
