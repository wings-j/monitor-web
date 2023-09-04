/**
 * Message
 */
interface Message {}

/**l
 * Exception Message
 */
class ExceptionMessage implements Message {
  type: 'error' | 'promise' | 'event' | '' = ''
  message: string = ''
  stack: string = ''
  filename?: string
  line?: number
  column?: number
  name?: string

  /**
   * Resolve from data
   * @param [ev] Event
   * @return instance
   */
  static from(ev: ErrorEvent | PromiseRejectionEvent | Event | any) {
    let value = new ExceptionMessage()
    if (ev instanceof ErrorEvent) {
      Object.assign(value, {
        type: 'error',
        message: ev.message ?? ev.error?.toString(),
        stack: ev.error?.stack,
        filename: ev.filename,
        line: ev.error?.lineNo,
        column: ev.error?.colNo,
        name: ev.error?.name
      })
    } else if (ev instanceof PromiseRejectionEvent) {
      Object.assign(value, {
        type: 'promise',
        message: ev.reason?.message ?? ev.reason?.toString(),
        stack: ev.reason?.stack,
        line: ev.reason?.lineNo,
        column: ev.reason?.colNo,
        name: ev.reason?.name
      })
    } else if (ev instanceof Event) {
      Object.assign(value, {
        type: 'event',
        message: ev.type,
        stack: (ev.target as Element).outerHTML
      })
    } else {
      Object.assign(value, {
        type: '',
        message: ev.message,
        stack: ev.stack,
        name: ev.name
      })
    }

    return value
  }
}
/**
 * Request Message
 */
class RequestMessage implements Message {
  method: string = ''
  url: string = ''
  body?: any
  status: number = 0
  data?: any

  /**
   * Resolve from data
   * @param [ev] Event
   * @return instance
   */
  static from(ev: { method?: string; url?: string; body?: any; status?: number; data?: any }) {
    let value = new RequestMessage()
    Object.assign(value, {
      method: ev['method'] ?? '',
      url: ev['url'] ?? '',
      body: ev['body'],
      status: ev['status'] ?? 0,
      data: ev['data']
    })

    return value
  }
}

export { ExceptionMessage, Message, RequestMessage }
