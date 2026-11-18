import { useState } from 'react'
import { HiCheck } from 'react-icons/hi2'
import { IoIosShareAlt } from 'react-icons/io'
import Tooltip from '@/components/ui/Tooltip'

export default function ShareButton({className = ''}) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    // Copies the current page URL to the user's clipboard
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)

    // Revert back to the share icon after 2 seconds
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Tooltip label='Share' side='bottom' >
      <button
        onClick={handleShare}
        className={`group/share ${copied ? 'bg-success/10 border-success/30' : 'hover:bg-white/10 hover:border-white/20'} ${className}`}
        aria-label="Share movie"
        title="Copy link to clipboard"
      >
        {copied ? (
          <HiCheck className="text-xl text-success" />
        ) : (
          <IoIosShareAlt className="text-xl text-text-muted group-hover/share:text-white transition-colors duration-200" />
        )}
      </button>
    </Tooltip>
  )
}