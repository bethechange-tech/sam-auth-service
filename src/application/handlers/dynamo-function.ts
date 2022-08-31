import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AWS from 'aws-sdk'
import { HTTP_STATUS_CODE } from '../../utils/HttpClient/http-status-codes'

const configUpdate: { region: string; endpoint: string } = {
  region: 'eu-west-1',
  endpoint: 'http://172.17.0.1:8000',
}

const DynamoClient = new AWS.DynamoDB.DocumentClient(configUpdate)

export const lambdaHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) throw new Error('error')

  const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.DYNAMODB_TABLE as string,
    Key: {
      consignmentId: 'consignmentNo',
    },
  }

  const getConsignment = await DynamoClient.get(params).promise()

  return {
    statusCode: HTTP_STATUS_CODE.OK,
    body: JSON.stringify({}),
  }
}
