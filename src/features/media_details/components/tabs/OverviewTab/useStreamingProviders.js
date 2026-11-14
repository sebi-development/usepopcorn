import useUserProfile from '@/features/profile/hooks/useUserProfile'
import { useStreamingIds, useWatchProviders } from '@/features/media_details/hooks/useWatchProviders'
import { regionName } from '@/features/media_details/components/tabs/OverviewTab/overviewFacts'
import { streamingLink } from '@/features/media_details/components/tabs/OverviewTab/streamingLinks'

// The services that stream a title in the profile's country (US when none is set), each with its link.
// A query waiting for the country is disabled, not loading, so `isLoading` covers that wait too.
export default function useStreamingProviders(media) {
  const { profileData, isLoading: isLoadingProfile } = useUserProfile()
  const country = isLoadingProfile ? null : (profileData?.country || 'US')
  const { data, isLoading, error } = useWatchProviders(media.id, media.type, country)
  const { data: ids } = useStreamingIds(media.id, media.type)

  const providers = data?.providers.map((provider) => ({
    ...provider,
    ...streamingLink(provider.id, { ids, title: media.title, type: media.type, fallback: data.link }),
  }))

  return { region: regionName(country), providers, isLoading: isLoading || !country, error }
}
