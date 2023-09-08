/**
 * Context
 */
interface Context {
  application: string
  server: string
  headers: { [key: string]: string }
  meta?: () => any | any
}

export { Context }
