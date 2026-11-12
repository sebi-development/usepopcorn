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

  return { certification, regionalReleaseDate };
}
