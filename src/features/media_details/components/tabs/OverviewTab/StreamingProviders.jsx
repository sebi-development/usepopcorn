import InfoNote from '@/components/ui/InfoNote'
import ProviderBadge, { ProviderBadgeSkeleton } from '@/features/media_details/components/tabs/OverviewTab/ProviderBadge'
import useStreamingProviders from '@/features/media_details/components/tabs/OverviewTab/useStreamingProviders'

const LIST_CLASS = "flex flex-wrap gap-x-6 gap-y-3"
const SKELETON_BADGES = [1, 2, 3]

// Mounts when the Streaming section first opens, which starts both requests. The badges show as soon
// as the services are in; the Wikidata ids then turn a search link into the title's own page.
export default function StreamingProviders({ media }) {
  const { region, providers, isLoading, error } = useStreamingProviders(media)

  if (isLoading) return (
    <div className={`${LIST_CLASS} delayed-reveal`}>
      {SKELETON_BADGES.map((i) => <ProviderBadgeSkeleton key={i} />)}
    </div>
  )
  if (error) return <InfoNote>Couldn't load the streaming services. Please try again later.</InfoNote>
  if (!providers.length) return <InfoNote>No major streaming service in {region} has this title right now.</InfoNote>

  return (
    <>
      <div className={LIST_CLASS}>
        {providers.map((provider) => <ProviderBadge key={provider.id} provider={provider} title={media.title} />)}
      </div>
      <InfoNote className="mt-4">Availability in {region} by JustWatch</InfoNote>
    </>
  )
}
