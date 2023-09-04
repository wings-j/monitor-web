import { overwatch } from './modules/overwatch'
import { ExceptionMessage, Message } from './types/message'

/**
 * Monitor Options
 */
interface MonitorOptions {
  server: string
}

/**
 * Monitor
 */
class Monitor {
  options: MonitorOptions

  /**
   * Constructor
   * @param options Options
   */
  constructor(options: Partial<MonitorOptions>) {
    this.options = Object.assign({ server: '' }, options)

    overwatch((type, ev) => {
      let message: Message | undefined
      if (type === 'exception') {
        message = ExceptionMessage.from(ev)
      } else if (type === 'request') {
        // TODO
      }

      if (message) {
        if (this.options.server) {
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
 */
function initiate(server: string) {
  let monitor = new Monitor({ server })

  return monitor
}

export { initiate }
