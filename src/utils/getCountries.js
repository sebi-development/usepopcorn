const FREQUENT_COUNTRY_CODES = [
  // North America
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


// Returns an alphabetically sorted array of country objects: { code: 'US', name: 'United States' }
export function getCountryOptions() {
  return FREQUENT_COUNTRY_CODES.map((code) => {
    return {
      code,
      name: regionNames.of(code) 
    };
  }).sort((a, b) => a.name.localeCompare(b.name)); 
}