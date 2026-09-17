import { useState, Suspense, lazy } from "react"
import ProfileHero from "@/features/profile/components/ProfileHero"
import RecentlyRated from "@/features/profile/components/RecentlyRated"
import Watchlist from "@/features/profile/components/Watchlist"
import Favorites from "@/features/profile/components/Favorites"
import Button from "@/components/ui/Button"
import ProfileHeroSkeleton from "@/features/profile/components/ProfileHeroSkeleton"
import useProfileData from "@/features/profile/hooks/useProfileData"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import useProfileRelationship from "@/features/social/hooks/useProfileRelationship"
import useFollow from "@/features/social/hooks/useFollow"
import { useParams } from "react-router"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useDelayedLoading from "@/hooks/useDelayedLoading"

const EditProfileModal = lazy(() => import("../../features/profile/components/EditProfileModal"))

function ProfilePage() {
  const { userId } = useParams() // get other user data 
  const currentUser = useCurrentUser()
  const isOwnProfile = !userId || userId === currentUser?.id
  const targetUserId = userId ?? currentUser?.id

  const { profileData, recentRatings, ratingsCount, isLoadingProfile, isLoadingRatings } = useProfileData(targetUserId)
  const showLoadingProfile = useDelayedLoading(isLoadingProfile)
  const { data: watchlist, isLoading: isWatchlistLoading } = useInteractions("watchlist", targetUserId)
  const { data: favorites, isLoading: isFavoritesLoading } = useInteractions("favorite", targetUserId)
  const { data: relationship } = useProfileRelationship(
    isOwnProfile ? null : targetUserId,
    currentUser?.id
  )
  const { mutate: toggleFollow, isPending: isFollowPending } = useFollow(targetUserId)

  const [isModalOpen, setIsModalOpen] = useState(false)


  const action = isOwnProfile
    ? <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>Edit Profile</Button>
    : <Button
      variant={relationship?.isFollowing ? "secondary" : "solid"}
      size="sm"
      isLoading={isFollowPending}
      onClick={() => toggleFollow(relationship?.isFollowing)}
    >
      {relationship?.isFollowing ? "Unfollow" : "Follow"}
    </Button>

  return (
    <main className="flex flex-col gap-12 md:gap-16 pb-12">
      {showLoadingProfile ? (
        <ProfileHeroSkeleton />
      ) : (
        <ProfileHero
          profileData={profileData}
          ratingsCount={ratingsCount}
          action={action}
          isOwnProfile={isOwnProfile}
        />
      )}

      <Watchlist watchlist={watchlist} isLoading={isWatchlistLoading} showInfo={false} />
      <Favorites favorites={favorites} isLoading={isFavoritesLoading} showInfo={false} />
      <RecentlyRated recentlyRated={recentRatings} isLoading={isLoadingRatings} showInfo={false} />

      {isOwnProfile && isModalOpen && (
        <Suspense fallback={null}>
          <EditProfileModal 
            onClose={() => setIsModalOpen(false)} 
            profileData={profileData} 
          />
        </Suspense>
      )}
    </main>
  )
}

export default ProfilePage