const coreBrands = ['netflix', 'disney', 'max', 'hbo', 'paramount', 'apple', 'amazon'];

export function extractRegionalData(data, countryCode = 'US', type = 'movie') {
  let certification = null;
  let regionalReleaseDate = null;

  if (type === 'movie') {
    // Movie: extract from release_dates
    if (data?.release_dates?.results) {
      const countryData = data.release_dates.results.find(
        (r) => r.iso_3166_1 === countryCode
      );
      if (countryData && countryData.release_dates) {
        const release = countryData.release_dates.find((r) => r.type === 3);
        if (release) {
          if (release.certification) {
            certification = release.certification;
          }
          if (release.release_date) {
            regionalReleaseDate = release.release_date.slice(0, 10);
          }
        }
      }
    }
  } else {
    // TV: extract from content_ratings
    if (data?.content_ratings?.results) {
      const countryData = data.content_ratings.results.find(
        (r) => r.iso_3166_1 === countryCode
      );
      if (countryData) {
        certification = countryData.rating || null;
      }
    }
  }

  let providers = [];
  const flatrate = data?.['watch/providers']?.results?.[countryCode]?.flatrate;

  if (Array.isArray(flatrate)) {
    const seen = new Map();

    for (const provider of flatrate) {
      if (!provider?.provider_name) continue;

      const name = provider.provider_name.toLowerCase();
      const coreKey = coreBrands.find((brand) => name.includes(brand)) || name;
      const entry = {
        id: provider.provider_id,
        name: provider.provider_name,
        priority: provider.display_priority ?? 0,
        logoPath: provider.logo_path ?? null,
      };

      if (!seen.has(coreKey)) {
        seen.set(coreKey, entry);
      } else {
        // Keep the entry with the lower display_priority
        const existing = seen.get(coreKey);
        if (entry.priority < existing.priority) {
          seen.set(coreKey, entry);
        }
      }
    }

    providers = Array.from(seen.values())
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 4);
  }

  return { certification, regionalReleaseDate, providers };
}
