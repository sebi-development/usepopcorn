import { HiOutlineUser } from "react-icons/hi2"
import useUpdateAvatar from "@/features/profile/hooks/useUpdateAvatar"
import useRemoveAvatar from "@/features/profile/hooks/useRemoveAvatar"
import { useRef, useMemo } from "react"
import toast from "react-hot-toast"
import { FiLoader } from "react-icons/fi"
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi"

function ProfileHero({ profileData, ratingsCount, action, isOwnProfile = false }) {
	const { mutate: updateAvatar, isPending: isUpdating } = useUpdateAvatar()
	const { mutate: removeAvatar, isPending: isRemoving } = useRemoveAvatar()

	const isBusy = isUpdating || isRemoving
	const fileInputRef = useRef(null)

	const createdAt = profileData?.created_at;
	const memberSince = useMemo(() => {
		if (!createdAt) return null
		return new Date(createdAt).toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		})
	}, [createdAt])

	function handleImageSelect(e) {
		const file = e.target.files[0]
		if (!file) return
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image')
			e.target.value = null
			return
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be less than 5MB')
			e.target.value = null
			return
		}
		updateAvatar({ file, oldAvatarUrl: profileData?.avatar_url })
	}

	return (
		<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
			<div
				onClick={() => isOwnProfile && fileInputRef.current?.click()}
				className="relative shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-surface-500 border-2 border-surface-100 flex items-center justify-center cursor-pointer group transition-all"
			>
				{isBusy && (
					<div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm flex items-center justify-center z-20">
						<FiLoader className="text-primary-light animate-spin" size={32} />
					</div>
				)}

				{/* Not clickable until it is visible: on touch there is no hover, and an invisible
				    "remove avatar" button under the thumb would delete the photo on a stray tap */}
				{isOwnProfile && !isBusy && (
					<div className="absolute inset-0 bg-black/50 flex flex-row items-center justify-center gap-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-10">
						<button
							onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
							className="p-2 text-white cursor-pointer"
						>
							<HiOutlinePencilAlt size={26} />
						</button>
						{profileData?.avatar_url && (
							<button
								onClick={(e) => { e.stopPropagation(); removeAvatar(profileData.avatar_url) }}
								className="p-2 text-white cursor-pointer hover:text-danger transition-colors"
							>
								<HiOutlineTrash size={26} />
							</button>
						)}
					</div>
				)}

				{profileData?.avatar_url ? (
					<img src={profileData.avatar_url} alt={profileData.username} className="w-full h-full object-cover" decoding="async" />
				) : (
					<HiOutlineUser size={64} className="text-text-muted" />
				)}

				{isOwnProfile && (
					<input ref={fileInputRef} onChange={handleImageSelect} type="file" accept="image/*" className="hidden" />
				)}
			</div>

			{/* min-w-0 + break-words: a long username wraps instead of pushing the column off-screen */}
			<div className="flex flex-col gap-3 min-w-0 max-w-full items-center text-center sm:items-stretch sm:text-left">
				<h1 className="max-w-full text-3xl sm:text-5xl font-bold text-text break-words">{profileData?.username}</h1>
				<div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-text-muted text-sm">
					<span>{ratingsCount ?? 0} ratings</span>
					<span>•</span>
					{memberSince && <span>Member since {memberSince}</span>}
				</div>
				{action && action}
			</div>
		</div>
	)
}

export default ProfileHero