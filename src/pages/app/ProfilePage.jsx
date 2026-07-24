import { useState } from "react"
import { useForm } from "react-hook-form"
import ProfileHero from "../../features/profile/components/ProfileHero"
import RecentlyRated from "../../features/profile/components/RecentlyRated"
import Watchlist from "../../features/profile/components/Watchlist"
import Favorites from "../../features/profile/components/Favorites"
import Modal from "../../components/Modal"
import Form from "../../components/Form"
import Button from "../../components/Button"
import ProfileHeroSkeleton from "../../components/skeletons/ProfileHeroSkeleton"
import useProfileData from "../../features/profile/hooks/useProfileData"
import useInteractions from "../../features/interactions/hooks/useInteractions"
import useUpdateProfile from "../../features/profile/hooks/useUpdateProfile"
import useProfileRelationship from "../../features/social/hooks/useProfileRelationship"
import useFollow from "../../features/social/hooks/useFollow"
import { useParams } from "react-router"
import useCurrentUser from "../../features/auth/hooks/useCurrentUser"

function ProfilePage() {
  const { userId } = useParams() // get other user data 
  const currentUser = useCurrentUser()
  const isOwnProfile = !userId || userId === currentUser.id
  const targetUserId = userId ?? currentUser.id

  const { profileData, recentRatings, ratingsCount, isLoadingProfile, isLoadingRatings } = useProfileData(targetUserId)
  const { data: watchlist, isLoading: isWatchlistLoading } = useInteractions("watchlist", targetUserId)
  const { data: favorites, isLoading: isFavoritesLoading } = useInteractions("favorite", targetUserId)
  const { updateUserProfile, isUpdating } = useUpdateProfile()

  const { data: relationship } = useProfileRelationship(
    isOwnProfile ? null : targetUserId,
    currentUser.id
  )
  const { mutate: toggleFollow, isPending: isFollowPending } = useFollow(targetUserId)

  const { register, handleSubmit, getValues, formState: { errors }, reset } = useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function onSubmit(data) {
    const { username, password } = data
    updateUserProfile(
      { username, password },
      {
        onSuccess: () => {
          setIsModalOpen(false)
          reset()
        }
      }
    )
  }

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

      <Watchlist watchlist={watchlist} isLoading={isWatchlistLoading} />
      <Favorites favorites={favorites} isLoading={isFavoritesLoading} />
      <RecentlyRated recentlyRated={recentRatings} isLoading={isLoadingRatings} />

      {isOwnProfile && isModalOpen && (
        <Modal title="Edit Profile" onClose={() => setIsModalOpen(false)}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Input
              {...register("username", { minLength: { value: 2, message: "Too short" } })}
              label="Username"
              error={errors.username}
            />
            <Form.Input
              {...register("password", { minLength: { value: 6, message: "Minimum 6 characters" } })}
              type="password"
              label="New Password"
              error={errors.password}
            />
            <Form.Input
              {...register("confirmPassword", {
                validate: value => {
                  const currentPassword = getValues("password")
                  if (!currentPassword) return true
                  return value === currentPassword || "Passwords do not match"
                }
              })}
              type="password"
              label="Confirm Password"
              error={errors.confirmPassword}
            />
            <Form.Button isLoading={isUpdating}>Save changes</Form.Button>
          </Form>
        </Modal>
      )}
    </main>
  )
}

export default ProfilePage