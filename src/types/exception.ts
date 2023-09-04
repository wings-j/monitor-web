/**
 * Exception
 */
interface Exception {
  type: 'error' | 'promise' | 'event' | 'unknown'
  message: string
  stack: string
  filename?: string
  line?: number
  column?: number
  name?: string
}

export { Exception }
