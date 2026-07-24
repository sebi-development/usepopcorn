import { useState } from 'react'
import { HiCheck } from 'react-icons/hi2'
import { IoIosShareAlt } from 'react-icons/io'
import Tooltip from '../../../components/Tooltip'

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
        className={`${copied ? 'bg-success/10 border-success/30' : 'hover:bg-white/10 hover:border-white/20'} ${className}`}
        aria-label="Share movie"
        title="Copy link to clipboard"
      >
        {copied ? (
          <HiCheck className="text-xl text-success animate-in zoom-in duration-200" />
        ) : (
          <IoIosShareAlt className="text-xl text-text-muted group-hover:text-white transition-colors duration-200" />
        )}
      </button>
    </Tooltip>
  )
}