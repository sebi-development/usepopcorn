import { useState, Suspense, lazy } from "react"
import ProfileHero from "@/features/profile/components/ProfileHero"
import RecentlyRated from "@/features/profile/components/RecentlyRated"
import Watchlist from "@/features/profile/components/Watchlist"
import Favorites from "@/features/profile/components/Favorites"
import Button from "@/components/ui/Button"
import ProfileHeroSkeleton from "@/features/profile/components/ProfileHeroSkeleton"
import useProfileData from "@/features/profile/hooks/useProfileData"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import useFollowingIds from "@/features/social/hooks/useFollowingIds"
import useFollow from "@/features/social/hooks/useFollow"
import { useParams } from "react-router"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

const EditProfileModal = lazy(() => import("../../features/profile/components/EditProfileModal"))

// The hero's one action: a 44px tap target on phones, the compact button from md up
const HERO_ACTION_CLASS = "min-h-11 min-w-36 md:min-h-0 md:min-w-0"

function ProfilePage() {
  const { userId } = useParams() // get other user data 
  const currentUser = useCurrentUser()
  const isOwnProfile = !userId || userId === currentUser?.id
  const targetUserId = userId ?? currentUser?.id

  const { profileData, recentRatings, ratingsCount, isLoadingProfile, isLoadingRatings } = useProfileData(targetUserId)
  // Watchlist and favorites are private (RLS returns them to their owner only), so on someone
  // else's profile the two requests would always come back empty
  const { data: watchlist, isLoading: isWatchlistLoading } = useInteractions("watchlist", targetUserId, { enabled: isOwnProfile })
  const { data: favorites, isLoading: isFavoritesLoading } = useInteractions("favorite", targetUserId, { enabled: isOwnProfile })
  const { followingSet, isLoading: isLoadingFollowing } = useFollowingIds({ enabled: !isOwnProfile })
  const isFollowing = followingSet.has(targetUserId)
  const { mutate: toggleFollow, isPending: isFollowPending } = useFollow(targetUserId)

  const [isModalOpen, setIsModalOpen] = useState(false)


  const action = isOwnProfile
    ? <Button variant="secondary" size="sm" className={HERO_ACTION_CLASS} onClick={() => setIsModalOpen(true)}>Edit Profile</Button>
    : <Button
      variant={isFollowing ? "secondary" : "solid"}
      size="sm"
      className={HERO_ACTION_CLASS}
      isLoading={isFollowPending}
      // Until the list has loaded, "not following" is only a guess
      disabled={isLoadingFollowing}
      onClick={() => toggleFollow(isFollowing)}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>

  return (
    <main className="flex flex-col gap-12 md:gap-16 pb-12">
      {isLoadingProfile ? (
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
      <RecentlyRated
        userId={targetUserId}
        recentlyRated={recentRatings}
        ratingsCount={ratingsCount}
        isLoading={isLoadingRatings}
        showInfo={false}
      />

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