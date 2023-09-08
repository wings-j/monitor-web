import { CLSMetric, FIDMetric, LCPMetric, onCLS, onFID, onLCP } from 'web-vitals'
import { Context } from '../types/context'

/**
 * Analyze
 * @param [context] Context
 * @param [callback] Callback
 */
function analyze(context: Context, callback: (res: LCPMetric | FIDMetric | CLSMetric) => void) {
  onLCP(callback)
  onFID(callback)
  onCLS(callback)
}

export { analyze }
