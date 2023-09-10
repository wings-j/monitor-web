/**
 * Context
 */
interface Context {
  server: string
  application: string
  headers: { [key: string]: string }
  meta?: () => any | any
}

export { Context }
