import { useLayoutEffect } from "react"
import { useParams } from "react-router"
import { HiArrowTopRightOnSquare } from "react-icons/hi2"

import usePerson, { knownForDepartment } from "@/features/people/hooks/usePerson"
import Filmography from "@/features/people/components/Filmography"
import PersonTabs from "@/features/people/components/PersonTabs"
import MoviePoster from "@/components/media/MoviePoster"
import AlertBanner from "@/components/ui/AlertBanner"
import Chip from "@/components/ui/Chip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import getTmdbImageUrl from "@/utils/tmdbImage"
import { departmentLabel } from "@/utils/tmdbPerson"
import { today } from "@/utils/tmdbItem"

const HERO_CLASS = "grid grid-cols-[6.5rem_minmax(0,1fr)] md:grid-cols-[min(300px,30%)_minmax(0,1fr)] md:grid-rows-[auto_1fr] gap-4 md:gap-x-8 md:gap-y-5 md:px-6"
const PHOTO_CLASS = "w-full aspect-2/3 rounded-card self-start md:row-span-2"
const TAP_AREA = "relative before:absolute before:-inset-3"

// No date-fns on this page: importing it split date-fns into chunks the entry and Browse then load
const formatDay = (day) => new Date(day).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })

function lifeLabel({ birthday, deathday }) {
  if (!birthday) return null
  const end = deathday ?? today()
  // Whole years: one less if the birthday hasn't come round yet in the end year
  const age = end.slice(0, 4) - birthday.slice(0, 4) - (end.slice(5) < birthday.slice(5))
  return deathday
    ? `${formatDay(birthday)} – ${formatDay(deathday)} (${age})`
    : `Born ${formatDay(birthday)} (${age})`
}

function PersonSkeleton() {
  return (
    <div className={`${HERO_CLASS} delayed-reveal`}>
      <SkeletonBox className={PHOTO_CLASS} />
      <div className="flex flex-col gap-4">
        <SkeletonBox className="h-7 md:h-10 w-3/4 rounded-lg" />
        <SkeletonBox className="h-6 w-1/2 rounded-full" />
      </div>
      <div className="col-span-2 md:col-span-1 flex flex-col gap-3 md:gap-4">
        <SkeletonBox className="h-11 w-full rounded-full" />
        <SkeletonBox className="h-48 md:h-auto md:flex-1 rounded-card" />
      </div>
    </div>
  )
}

export default function PersonPage() {
  const { id } = useParams()
  const personId = Number(id)

  // Open each person at the top, as DetailPage does
  useLayoutEffect(() => {
    history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    return () => { history.scrollRestoration = "auto" }
  }, [personId])

  const { data: person, isLoading, error } = usePerson(personId)

  if (isLoading) return <PersonSkeleton />
  if (error) return <AlertBanner message='Error fetching data. Please try again' variant="danger" />
  if (!person) return null

  const life = lifeLabel(person)

  return (
    <main className="flex flex-col gap-8 md:gap-14 pb-12">
      <div className={HERO_CLASS}>
        <MoviePoster
          src={getTmdbImageUrl(person.profile_path, 'h632')}
          srcSet={person.profile_path && `${getTmdbImageUrl(person.profile_path, 'w185')} 185w, ${getTmdbImageUrl(person.profile_path, 'h632')} 421w`}
          sizes="(min-width: 768px) 300px, 6.5rem"
          alt={person.name}
          className={PHOTO_CLASS}
          priority
        />

        <div className="flex flex-col gap-3 md:gap-5 min-w-0">
          <h1 className="text-xl md:text-4xl font-bold text-text leading-tight tracking-tight break-words">{person.name}</h1>

          <div className="flex flex-wrap items-center gap-2">
            {person.known_for_department && <Chip size="sm" label={departmentLabel(knownForDepartment(person))} />}
            {life && <Chip size="sm" label={life} />}
            {person.place_of_birth && <Chip size="sm" label={person.place_of_birth} />}
            {person.imdb_id && (
              <a href={`https://www.imdb.com/name/${person.imdb_id}/`} target="_blank" rel="noopener noreferrer" className={`${TAP_AREA} rounded-full`}>
                {/* A static Chip is cursor-default; inside a link it should point */}
                <Chip variant="outline" size="sm" className="cursor-pointer!">
                  IMDb
                  <HiArrowTopRightOnSquare className="w-2.5 h-2.5" aria-hidden="true" />
                </Chip>
              </a>
            )}
          </div>
        </div>
        <PersonTabs person={person} className="col-span-2 md:col-span-1" />
      </div>

      <Filmography key={person.id} person={person} />
    </main>
  )
}
