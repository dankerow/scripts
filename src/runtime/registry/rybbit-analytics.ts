import { useRegistryScript } from '../utils'
import { array, boolean, number, object, optional, string } from '#nuxt-scripts-validator'
import type { RegistryScriptInput } from '#nuxt-scripts/types'

export const RybbitAnalyticsOptions = object({
  siteId: string(), // required
  trackSpa: optional(boolean()),
  trackQuery: optional(boolean()),
  skipPatterns: optional(array(string())),
  maskPatterns: optional(array(string())),
  debounce: optional(number()),
})

export type RybbitAnalyticsInput = RegistryScriptInput<typeof RybbitAnalyticsOptions, false>

export interface RybbitAnalyticsApi {
  pageview: () => void
  event: (eventName: string, properties?: Record<string, any>) => void
}

declare global {
  interface Window {
    rybbit: RybbitAnalyticsApi
  }
}

export function useScriptRybbitAnalytics<T extends RybbitAnalyticsApi>(_options?: RybbitAnalyticsInput) {
  return useRegistryScript<T, typeof RybbitAnalyticsOptions>('rybbitAnalytics', (options) => {
    return {
      scriptInput: {
        'src': 'https://app.rybbit.io/api/script.js',
        'data-site-id': options?.siteId,
        'data-track-spa': options?.trackSpa,
        'data-track-query': options?.trackQuery,
        'data-skip-patterns': options?.skipPatterns ? JSON.stringify(options.skipPatterns) : undefined,
        'data-mask-patterns': options?.maskPatterns ? JSON.stringify(options.maskPatterns) : undefined,
        'data-debounce': options?.debounce ? options.debounce.toString() : undefined,
      },
      schema: import.meta.dev ? RybbitAnalyticsOptions : undefined,
      scriptOptions: {
        use() {
          return { rybbit: window.rybbit }
        },
      },
    }
  }, _options)
}
