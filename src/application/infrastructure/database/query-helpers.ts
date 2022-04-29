import { redactCustomerDetails } from '../../../utils/RedactCustomerDetails'
import db from './postgres-connection'

export async function getUserById(id: string) {
  const resultParams = await db.query<{ password: string }>(
    `SELECT * FROM user WHERE id = :id`,
    { id }
  )

  console.info(redactCustomerDetails(resultParams), 'resultParams')
  return resultParams.records[0]
}
