import { isFunction, isNil, merge } from 'lodash-es'
import { analyze } from './modules/analyze'
import { overwatch } from './modules/overwatch'
import { send } from './modules/send'
import { Context } from './types/context'
import { AnalysisMessage, ExceptionMessage, Message, RequestMessage } from './types/message'

/**
 * Monitor
 */
class Monitor {
  context: Context

  /**
   * Constructor
   * @param [context] Context
   */
  constructor(context: Partial<Context>) {
    this.context = merge({ application: '', server: '', headers: {} }, context)

    analyze(this.context, res => {
      let message = AnalysisMessage.from(res)
      send(this.context, message)
    })
    overwatch(this.context, (type, res) => {
      let message: Message | undefined
      if (type === 'exception') {
        message = ExceptionMessage.from(res)
      } else if (type === 'request') {
        message = RequestMessage.from(res)
      }
      if (message) {
        message.application = this.context.application
        if (!isNil(this.context.meta)) {
          if (isFunction(this.context.meta)) {
            message.meta = this.context.meta()
          } else {
            message.meta = this.context.meta
          }
        }

        if (this.context.server) {
          send(this.context, message)
        } else {
          console.log(message)
        }
      }
    })
  }
}

/**
 * Initiate
 * @param [server] The receive server address
 * @param [context] Context
 */
function initiate(server: string, context: Partial<Context> = {}) {
  let monitor = new Monitor({ server, ...context })

  return monitor
}

export { initiate }
