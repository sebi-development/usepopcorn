import {
  HiOutlineHome, HiHome,
  HiOutlineFire, HiFire,
  HiOutlineChartBar, HiChartBar,
  HiOutlineCalendar, HiCalendar,
  HiOutlinePlay, HiPlay,
  HiOutlineSignal, HiSignal,
  HiOutlineSparkles, HiSparkles,
} from "react-icons/hi2"
import { IoTrendingUp } from "react-icons/io5";

// `filledIcon` replaces a row's `icon` while hovered (Popular's arrow has none, so it gets a bolder stroke)

export const HOME_ITEM = {
  id: "home",
  label: "Home",
  icon: HiOutlineHome,
  filledIcon: HiHome,
}

export const INSPIRE_ITEM = {
  id: "inspire",
  label: "Inspire",
  icon: HiOutlineSparkles,
  filledIcon: HiSparkles,
}

export const MOVIE_CATEGORIES = [
  { id: "trending", label: "Trending", icon: HiOutlineFire, filledIcon: HiFire },
  { id: "popular", label: "Popular", icon: IoTrendingUp },
  { id: "top_rated", label: "Top Rated", icon: HiOutlineChartBar, filledIcon: HiChartBar },
  { id: "upcoming", label: "Upcoming", icon: HiOutlineCalendar, filledIcon: HiCalendar },
  { id: "now_playing", label: "Now Playing", icon: HiOutlinePlay, filledIcon: HiPlay },
]

export const SERIES_CATEGORIES = [
  { id: "trending", label: "Trending", icon: HiOutlineFire, filledIcon: HiFire },
  { id: "popular", label: "Popular", icon: IoTrendingUp },
  { id: "top_rated", label: "Top Rated", icon: HiOutlineChartBar, filledIcon: HiChartBar },
  { id: "on_the_air", label: "On The Air", icon: HiOutlineSignal, filledIcon: HiSignal },
]
