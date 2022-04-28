import db from './postgres-connection'

export async function getUserById(id: string) {
  // 2) Check if user exists && password is correct
  const resultParams = await db.query<{ password: string }>(
    `SELECT * FROM user8 WHERE id = :id`,
    { id }
  )

  console.info(resultParams, 'resultParams')
  return resultParams.records[0]
}
