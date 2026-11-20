import { useWatch } from 'react-hook-form'
import { HiCheck, HiXMark } from 'react-icons/hi2'
import { PASSWORD_CHECKS } from '@/utils/passwordRules'

// Isolates the 'useWatch' subscription so typing re-renders only this list
export default function PasswordChecklist({ control, name = 'password' }) {
  const value = useWatch({ control, name, defaultValue: '' })

  return (
    <ul className="flex flex-col gap-1.5 px-1 py-2">
      {PASSWORD_CHECKS.map(({ key, text, test }) => {
        const met = test(value)
        return (
          <li
            key={key}
            className={`flex items-center gap-2 text-xs transition-all duration-300 ${met ? 'text-primary-light' : 'text-text-muted opacity-50'}`}
          >
            {met ? <HiCheck className="w-4 h-4 shrink-0" /> : <HiXMark className="w-4 h-4 shrink-0" />}
            <span>{text}</span>
          </li>
        )
      })}
    </ul>
  )
}
