import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const lambdaHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) throw new Error('Invalid request payload')

  const loginParsedBody = JSON.parse(event.body) as any
  console.info('login request', { request: loginParsedBody })
  return {
    statusCode: 200,
    body: JSON.stringify({}),
  }
}
