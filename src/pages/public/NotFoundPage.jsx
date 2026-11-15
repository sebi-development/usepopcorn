import { Link } from "react-router"
import Button from "@/components/ui/Button"
import InfoCard from "@/components/ui/InfoCard"

const BADGE = <span className="text-lg font-black text-primary-light tracking-tight">404</span>

export default function NotFoundPage() {
  return (
    <main className="min-h-[80dvh] flex items-center justify-center px-4">
      <InfoCard icon={BADGE} title="Page not found" subtitle="The page you're looking for doesn't exist or has moved.">
        <Button as={Link} to="/browse" className="py-2.5">Take me home</Button>
      </InfoCard>
    </main>
  )
}
