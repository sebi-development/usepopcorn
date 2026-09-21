import { useState } from "react"
import { FiSearch, FiLoader } from "react-icons/fi"
import useUserSearch from "@/features/search/hooks/useUserSearch"
import useFollowingIds from "@/features/social/hooks/useFollowingIds"
import UserResultItem from "@/features/social/components/UserResultltem"

export default function UserSearchWidget() {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: results, isLoading } = useUserSearch(searchTerm)
  const { followingSet } = useFollowingIds()

  return (
    <div className="bg-surface-500 border border-surface-100 rounded-card p-5 flex flex-col transition-all duration-300">

      <h3 className="font-bold text-sm text-text uppercase tracking-wider mb-3">
        Find Friends
      </h3>

      {/* Search Input Container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          {isLoading ? (
            <FiLoader className="animate-spin text-primary-light" size={16} />
          ) : (
            <FiSearch size={16} />
          )}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username..."
          className="w-full bg-surface-900 border border-white/5 rounded-xl h-10 pl-9 pr-3 text-text text-sm placeholder:text-text-muted outline-none focus:border-primary-light/50 focus:ring-1 focus:ring-primary-light/50 transition-all"
        />
      </div>

      {/* Inline Results Expansion */}
      {searchTerm.length >= 2 && (
        <div className="flex flex-col gap-1 mt-4 animate-in slide-in-from-top-2 fade-in duration-200">

          {/* Handle Empty State */}
          {!isLoading && results?.length === 0 && (
            <div className="text-center py-4 text-sm text-text-muted">
              No users found.
            </div>
          )}

          {/* Render Actual Results */}
          {!isLoading && results?.map((user) => (
            <UserResultItem key={user.id} user={user} isFollowing={followingSet.has(user.id)} />
          ))}

        </div>
      )}
    </div>
  )
}