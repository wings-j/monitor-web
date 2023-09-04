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
}

export { overwatch }
