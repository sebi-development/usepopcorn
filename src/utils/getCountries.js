const FREQUENT_COUNTRY_CODES = [
  'US', 'CA', 'MX',
  'GB', 'IE', 'FR', 
  'DE', 'NL', 'BE', 
  'CH', 'AT','SE', 
  'NO', 'DK', 'FI',
  'IT', 'ES', 'PT',
  'GR','SK', 'CZ', 
  'PL', 'HU', 'RO',
  'AU', 'NZ','JP', 
  'KR', 'SG', 'TW', 'IN',
  'BR', 'AR', 'CL'
]

// Instantiate the Intl API once outside the function to prevent memory reallocation
const regionNames = new Intl.DisplayNames(['en'], {type: 'region'})
const COUNTRY_OPTIONS = FREQUENT_COUNTRY_CODES
  .map((code) => ({ code, name: regionNames.of(code) }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getCountryOptions() {
  return COUNTRY_OPTIONS
}