import {
  HiOutlineHome,
  HiOutlineFire,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlinePlay,
  HiOutlineSignal,
} from "react-icons/hi2"
import { IoTrendingUp } from "react-icons/io5";

export const HOME_ITEM = {
  id: "home",
  label: "Home",
  icon: HiOutlineHome,
}

export const MOVIE_CATEGORIES = [
  { id: "trending", label: "Trending", icon: HiOutlineFire },
  { id: "popular", label: "Popular", icon: IoTrendingUp },
  { id: "top_rated", label: "Top Rated", icon: HiOutlineChartBar },
  { id: "upcoming", label: "Upcoming", icon: HiOutlineCalendar },
  { id: "now_playing", label: "Now Playing", icon: HiOutlinePlay },
]

export const SERIES_CATEGORIES = [
  { id: "trending", label: "Trending", icon: HiOutlineFire },
  { id: "popular", label: "Popular", icon: IoTrendingUp },
  { id: "top_rated", label: "Top Rated", icon: HiOutlineChartBar },
  { id: "on_the_air", label: "On The Air", icon: HiOutlineSignal },
]
