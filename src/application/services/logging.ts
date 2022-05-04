import winston, { format } from 'winston'

class Logger {
  private logger: winston.Logger
  public meta: Record<string, any>
  constructor(meta: Record<string, any>) {
    this.logger = winston.createLogger({
      level: 'info',
      format: format.combine(format.splat(), format.json()),
      defaultMeta: { service: 'auth-service' },
      transports: new winston.transports.Console({}),
    })
    
    this.meta = meta
  }

  error(message: string, meta?: Record<string, any>) {
    console.log('that should be logging the errors')
    this.logger.error(message, this._merged(meta))
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, this._merged(meta))
  }

  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, this._merged(meta))
  }

  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, this._merged(meta))
  }

  _merged(extra: Record<string, any> | undefined) {
    if (extra == undefined) {
      return this.meta
    } else {
      return Object.assign(this.meta, extra)
    }
  }
}

const logger = new Logger({})

export default logger
