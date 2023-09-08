import { Context } from '../types/context'
import { Message } from '../types/message'

const fetch = window.fetch // Preserve original fetch
const queue: Message[] = []

/**
 * Send
 * @param [context] Context
 * @param [message] Message
 * @return Response
 */
async function send(context: Context, message: Message) {
  queue.push(message)

  return new Promise((resolve, reject) => {
    window.requestIdleCallback(async () => {
      try {
        if (queue.length) {
          let body = JSON.stringify(queue)
          queue.length = 0
          let res = await fetch(context.server, {
            method: 'POST',
            headers: Object.assign({ 'content-type': 'application/json' }, context.headers),
            body
          })
          resolve(res)
        }
      } catch (er) {
        console.error(er)
        console.log(message)
      }
    })
  })
}

export { send }
