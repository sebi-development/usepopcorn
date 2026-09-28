import { Link } from "react-router";
import logo from "@/assets/logo.webp?no-inline";

// Sized in em so the caller's text-* class controls the height (text-2xl → 24px, text-7xl → 72px)
export function PopcornIcon({ className = "" }) {
  return (
    <img
      src={logo}
      alt=""
      width={113}
      height={151}
      decoding="async"
      draggable={false}
      className={`h-[1em] w-auto select-none ${className}`}
    />
  );
}

export default function Logo({ redirectTo = "/", className = "" }) {
  return (
    <Link
      to={redirectTo}
      className={`flex items-center gap-2 text-text no-underline group cursor-pointer ${className}`}
    >
      <PopcornIcon className="text-2xl transition-transform duration-200 group-hover:scale-110" />

      <span className="font-semibold text-lg tracking-tight transition-colors duration-200">
        usePopcorn
      </span>
    </Link>
  );
}
