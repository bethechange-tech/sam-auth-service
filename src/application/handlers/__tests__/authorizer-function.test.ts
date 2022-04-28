import { lambdaHandler } from '../authorizer-function'
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda'
import authEvent from '../../../../events/authorizerRequestEvent.json'
import { HTTP_STATUS_CODE } from '../../../utils/HttpClient/http-status-codes'

jest.mock('data-api-client', () => {
  const promise = {
    query: jest
      .fn()
      .mockResolvedValueOnce({
        records: [
          {
            name: 'danile baker',
            age: 24,
            email: 'fakeemail@fakeemail.com',
            role: 'admin',
          },
        ],
      })
      .mockResolvedValueOnce({
        records: [],
      }),
  }

  return jest.fn(() => promise)
})

describe('authorizer-function Handler', () => {
  beforeEach(async () => {
    process.env.JWT_SECRET = 'somesecretpossiblyssl'
    process.env.JWT_EXPIRES_IN = '30d'
  })

  afterEach(() => jest.clearAllMocks())

  describe('Happy path :)', () => {
    it('should return response successfully and grant acces if user is found', async () => {
      const response = await lambdaHandler(
        authEvent as unknown as APIGatewayRequestAuthorizerEvent
      )

      expect(response).toEqual({
        context: {
          user: {
            name: 'danile baker',
            age: 24,
            email: 'fakeemail@fakeemail.com',
            role: 'admin',
          },
        },
        principalId: 'user',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource:
                'arn:aws:execute-api:us-east-1:1234857789012:s4x3opwd6i/test/GET/request',
            },
          ],
        },
      })
    })

    it('should return response successfully and should deny access if user is not found', async () => {
      const response = await lambdaHandler(
        authEvent as unknown as APIGatewayRequestAuthorizerEvent
      )

      const message = 'The user belonging to this token does no longer exist.'

      expect(response).toEqual({
        context: {
          user: null,
          message,
          statuscode: HTTP_STATUS_CODE.UNAUTHORIZED,
          isOperational: true,
        },
        principalId: 'user',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Deny',
              Resource:
                'arn:aws:execute-api:us-east-1:1234857789012:s4x3opwd6i/test/GET/request',
            },
          ],
        },
      })
    })
  })
})
