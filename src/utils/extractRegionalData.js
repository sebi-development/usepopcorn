export function extractRegionalData(data, countryCode = 'US') {
  let certification = null;
  
  if (data?.release_dates?.results) {
    const countryData = data.release_dates.results.find(
      (r) => r.iso_3166_1 === countryCode
    );
    if (countryData && countryData.release_dates) {
      const release = countryData.release_dates.find((r) => r.type === 3);
      if (release && release.certification) {
        certification = release.certification;
      }
    }
  }

  let providers = [];
  const flatrate = data?.['watch/providers']?.results?.[countryCode]?.flatrate;

  if (Array.isArray(flatrate)) {
    const targetSubstrings = ['netflix', 'disney', 'max', 'paramount', 'apple tv'];
    const seenPlatforms = new Set();
    const filteredProviders = [];

    for (const provider of flatrate) {
      if (!provider?.provider_name) continue;
      
      const name = provider.provider_name.toLowerCase();
      const matchedSubstring = targetSubstrings.find((sub) => name.includes(sub));

      if (matchedSubstring) {
        if (!seenPlatforms.has(matchedSubstring)) {
          seenPlatforms.add(matchedSubstring);
          filteredProviders.push({
            id: provider.provider_id,
            name: provider.provider_name,
            priority: provider.display_priority ?? 0,
          });
        }
      }
    }

    providers = filteredProviders.sort((a, b) => a.priority - b.priority);
  }

  return { certification, providers };
}
