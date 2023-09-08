import { CLSMetric, FIDMetric, LCPMetric, Metric } from 'web-vitals'

/**
 * Message
 */
class Message {
  category: 'exception' | 'request' | 'analysis' | '' = ''
  application: string = ''
  url: string = window.location.href
  time: number = Date.now()
  meta: any

  /**
   * Constructor
   * @param [category] Category
   */
  constructor(category: Message['category']) {
    this.category = category
  }
}

/**l
 * Exception Message
 */
class ExceptionMessage extends Message {
  /**
   * Resolve from data
   * @param [event] Event
   * @return instance
   */
  static from(event: ErrorEvent | PromiseRejectionEvent | Event | any) {
    let payload: ExceptionMessage['payload']

    if (event instanceof ErrorEvent) {
      payload = {
        type: 'error',
        message: event.message ?? event.error?.toString(),
        stack: event.error?.stack,
        filename: event.filename,
        line: event.error?.lineNo,
        column: event.error?.colNo,
        name: event.error?.name
      }
    } else if (event instanceof PromiseRejectionEvent) {
      payload = {
        type: 'promise',
        message: event.reason?.message ?? event.reason?.toString(),
        stack: event.reason?.stack,
        line: event.reason?.lineNo,
        column: event.reason?.colNo,
        name: event.reason?.name
      }
    } else if (event instanceof Event) {
      payload = {
        type: 'event',
        message: event.type,
        stack: (event.target as Element).outerHTML
      }
    } else {
      payload = {
        type: '',
        message: event.message,
        stack: event.stack,
        name: event.name
      }
    }

    return new ExceptionMessage(payload)
  }

  payload: {
    type: 'error' | 'promise' | 'event' | ''
    message: string
    stack: string
    filename?: string
    line?: number
    column?: number
    name?: string
  }

  /**
   * Constructor
   * @param [payload] Payload
   */
  constructor(payload: ExceptionMessage['payload']) {
    super('exception')

    this.payload = payload
  }
}
/**
 * Request Message
 */
class RequestMessage extends Message {
  /**
   * Resolve from data
   * @param [request] Event
   * @return instance
   */
  static from(request: { method?: string; url?: string; body?: any; status?: number; data?: any }) {
    let payload = {
      method: request['method'] ?? '',
      url: request['url'] ?? '',
      body: request['body'],
      status: request['status'] ?? 0,
      data: request['data']
    }

    return new RequestMessage(payload)
  }

  payload: {
    method: string
    url: string
    body?: any
    status: number
    data?: any
  }

  /**
   * Constructor
   * @param [payload] Payload
   */
  constructor(payload: RequestMessage['payload']) {
    super('request')

    this.payload = payload
  }
}
/**
 * Analysis Message
 */
class AnalysisMessage extends Message {
  /**
   * Resolve from data
   * @param [metric] Metric
   * @return instance
   */
  static from(metric: LCPMetric | FIDMetric | CLSMetric) {
    let payload = {
      type: metric.name,
      value: metric.value
    }

    return new AnalysisMessage(payload)
  }

  payload: {
    type: Metric['name']
    value: number
  }

  /**
   * Constructor
   * @param [payload] Payload
   */
  constructor(payload: AnalysisMessage['payload']) {
    super('analysis')

    this.payload = payload
  }
}

export { AnalysisMessage, ExceptionMessage, Message, RequestMessage }
