const temp = new WeakMap<XMLHttpRequest, string[]>()

/**
 * Overwatch
 * @param [callback] Callback
 */
function overwatch(callback: (type: 'exception' | 'request', ev: any) => void) {
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
      temp.set(that, args)

      return Reflect.apply(target, that, args)
    }
  })
  XMLHttpRequest.prototype.send = new Proxy(XMLHttpRequest.prototype.send, {
    apply: (target: typeof XMLHttpRequest.prototype.send, that: XMLHttpRequest, args: [any]) => {
      try {
        if (temp.has(that)) {
          that.addEventListener('timeout', () => {
            let [method, url] = temp.get(that)!
            callback('request', {
              method,
              url,
              status: that.status,
              body: args[0]
            })

            temp.delete(that)
          })

          that.addEventListener('readystatechange', () => {
            if (that.readyState === XMLHttpRequest.DONE) {
              let [method, url] = temp.get(that)!
              callback('request', {
                method,
                url,
                status: that.status,
                body: args[0],
                data: that.response
              })

              temp.delete(that)
            }
          })
        }
      } catch (er) {
        console.error(er)
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
            callback('request', {
              method,
              url,
              status: res.status,
              body,
              data
            })
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
