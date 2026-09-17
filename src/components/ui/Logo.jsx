import { Link } from "react-router";

export function PopcornIcon({ className = "" }) {
  return (
    <span className={`select-none ${className}`}>
      🍿
    </span>
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