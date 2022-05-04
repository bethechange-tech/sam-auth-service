import db from '../infrastructure/database/pg/postgres-connection'
import logger from './logging'

export default class RDSService {
  public async create(params: Record<string, any>) {
    const obj = Object.keys(params)
    const lastKey = obj.length - 1

    const VALUES = obj
      .map(
        (key, idx) =>
          `${idx === 0 ? `:${key}` : key}${idx === lastKey ? '' : ','}`
      )
      .join(':')

    const KEYS = Object.keys(params).join(',')

    logger.info(
      `INSERT INTO user (${JSON.stringify(params)}) VALUES(${VALUES})`
    )

    return db.query<{ email: string; password: string; id: string }>(
      `INSERT INTO user (${KEYS}) VALUES(${VALUES})`,
      params
    )
  }

  public async query(sql: string, params?: Record<string, any>) {
    await db.query(sql, params)
    return params
  }
}
