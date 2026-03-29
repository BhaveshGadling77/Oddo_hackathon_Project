import { useEffect, useState } from 'react'

/**
 * Fetches country list from restcountries API.
 * Returns { countries, isLoading, error }
 * Each country: { name: string, code: string, currency: string }
 */
export function useCountries() {
  const [countries, setCountries]   = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCountries() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,currencies,cca2'
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const raw = await res.json()

        const list = raw
          .map((c) => {
            const currencyCodes = Object.keys(c.currencies ?? {})
            const firstCurrency = currencyCodes[0]
            const currencyName  = firstCurrency
              ? c.currencies[firstCurrency]?.name
              : 'N/A'

            return {
              name:     c.name?.common ?? 'Unknown',
              code:     c.cca2 ?? '',
              currency: firstCurrency
                ? `${firstCurrency} — ${currencyName}`
                : 'N/A',
            }
          })
          .sort((a, b) => a.name.localeCompare(b.name))

        if (!cancelled) setCountries(list)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load countries')
          // Provide fallback list
          setCountries(FALLBACK_COUNTRIES)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCountries()
    return () => { cancelled = true }
  }, [])

  return { countries, isLoading, error }
}

const FALLBACK_COUNTRIES = [
  { name: 'India',          code: 'IN', currency: 'INR — Indian Rupee' },
  { name: 'United States',  code: 'US', currency: 'USD — US Dollar' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP — Pound Sterling' },
  { name: 'Germany',        code: 'DE', currency: 'EUR — Euro' },
  { name: 'France',         code: 'FR', currency: 'EUR — Euro' },
  { name: 'Japan',          code: 'JP', currency: 'JPY — Japanese Yen' },
  { name: 'Canada',         code: 'CA', currency: 'CAD — Canadian Dollar' },
  { name: 'Australia',      code: 'AU', currency: 'AUD — Australian Dollar' },
  { name: 'Singapore',      code: 'SG', currency: 'SGD — Singapore Dollar' },
  { name: 'UAE',            code: 'AE', currency: 'AED — UAE Dirham' },
].sort((a, b) => a.name.localeCompare(b.name))
