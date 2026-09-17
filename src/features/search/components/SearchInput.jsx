import { FiSearch } from 'react-icons/fi'
import { LuLoaderCircle } from 'react-icons/lu'
import SlidingTabs from '@/components/ui/SlidingTabs'

function SearchInput({ value, onChange, filter, onFilterChange, isLoading }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100">
      {isLoading
        ? <LuLoaderCircle className="text-text-muted shrink-0 animate-spin" size={20} />
        : <FiSearch className="text-text-muted shrink-0" size={20} />
      }
      <input
        type="text"
        value={value}
        onChange={onChange}
        autoFocus
        placeholder="Search movies & series..."
        className="w-full bg-transparent text-text text-lg placeholder:text-text-muted outline-none"
      />
      <SlidingTabs
        tabs={[
          { id: 'movie', label: 'Movies' },
          { id: 'tv', label: 'Series' },
        ]}
        activeTab={filter}
        onChange={onFilterChange}
        containerPadding="p-0.5"
        containerGap="gap-0"
        containerRadius="rounded-lg"
        pillRadius="rounded-md"
        tabRadius="rounded-md"
        className="bg-surface-100 backdrop-blur-none border-none"
        pillClassName="bg-surface-500 backdrop-blur-none border-none"
        tabClassName="px-3 py-0.5 text-xs"
      />
    </div>
  )
}

export default SearchInput