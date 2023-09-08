import { Context } from '../types/context'

const map = new WeakMap<XMLHttpRequest, string[]>()

/**
 * Overwatch
 * @param [context] Context
 * @param [callback] Callback
 */
function overwatch(context: Context, callback: (type: 'exception' | 'request', event: any) => void) {
  let _callback = callback
  callback = (type: 'exception' | 'request', event: any) => {
    try {
      _callback(type, event)
    } catch (er) {
      console.error(er)
    }
  }

  window.addEventListener(
    'error',
    ev => {
      callback('exception', ev)
    },
    true
  )
  window.addEventListener(
    'unhandledrejection',
    ev => {
      callback('exception', ev)
    },
    true
  )

  XMLHttpRequest.prototype.open = new Proxy(XMLHttpRequest.prototype.open, {
    apply: (target: typeof XMLHttpRequest.prototype.open, that: XMLHttpRequest, args: [string, string]) => {
      map.set(that, args)

      return Reflect.apply(target, that, args)
    }
  })
  XMLHttpRequest.prototype.send = new Proxy(XMLHttpRequest.prototype.send, {
    apply: (target: typeof XMLHttpRequest.prototype.send, that: XMLHttpRequest, args: [any]) => {
      if (map.has(that)) {
        that.addEventListener('timeout', () => {
          let request = map.get(that)
          if (request) {
            let [method, url] = request
            callback('request', {
              method,
              url,
              status: that.status,
              body: args[0]
            })

            map.delete(that)
          }
        })

        that.addEventListener('readystatechange', () => {
          if (that.readyState === XMLHttpRequest.DONE) {
            let request = map.get(that)
            if (request) {
              let [method, url] = request
              let status = that.status
              if (status >= 300) {
                callback('request', {
                  method,
                  url,
                  status,
                  body: args[0],
                  data: that.response
                })
              }

              map.delete(that)
            }
          }
        })
      }

      return Reflect.apply(target, that, args)
    }
  })
  window.fetch = new Proxy(window.fetch, {
    apply: (target: typeof window.fetch, that: undefined, args: [RequestInfo | URL, RequestInit]) => {
      let url = args[0] instanceof URL ? args[0].href : args[0]
      let { method = 'GET', body } = args[1] ?? {}

      return Reflect.apply(target, that, args)
        .then((res: Response) => {
          res.text().then(data => {
            let status = res.status
            if (status >= 400) {
              callback('request', {
                method,
                url,
                status,
                body,
                data
              })
            }
          })

          return res
        })
        .catch(er => {
          callback('request', {
            method,
            url,
            status: 0,
            body
          })

          throw er
        })
    }
  })
}

export { overwatch }
