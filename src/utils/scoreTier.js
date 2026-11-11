import tier1 from '@/assets/rating-icons/rating-icon-tier1.avif?no-inline'
import tier2 from '@/assets/rating-icons/rating-icon-tier2.avif?no-inline'
import tier3 from '@/assets/rating-icons/rating-icon-tier3.avif?no-inline'
import tier4 from '@/assets/rating-icons/rating-icon-tier4.avif?no-inline'
import tier5 from '@/assets/rating-icons/rating-icon-tier5.avif?no-inline'

const SCORE_TIERS = [
  { min: 85, classes: "border-primary-light/50 text-primary-light shadow-inner shadow-primary-light/15", icon: { src: tier1, w: 96, h: 124, label: "Must watch" } },
  { min: 75, classes: "border-white/20 text-white/90", icon: { src: tier2, w: 96, h: 110, label: "Good" } },
  { min: 55, classes: "border-white/20 text-white/90", icon: { src: tier3, w: 96, h: 111, label: "Mixed" } },
  { min: 30, classes: "border-danger/40 text-danger", icon: { src: tier4, w: 96, h: 110, label: "Weak" } },
  { min: 0, classes: "border-danger/40 text-danger", icon: { src: tier5, w: 96, h: 95, label: "Terrible" } },
  { min: -Infinity, classes: "border-white/5 text-white/40", icon: null }
]

// `value` is 0-100; null/undefined picks the empty tier (no icon)
export default function getScoreTier(value) {
  return SCORE_TIERS.find((tier) => (value != null ? value >= tier.min : tier.min === -Infinity))
}
