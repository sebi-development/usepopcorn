import { SiNetflix, SiAppletv, SiHbomax, SiParamountplus } from 'react-icons/si'
import { TbBrandDisney } from 'react-icons/tb'
import { FaAmazon } from 'react-icons/fa'
import Tooltip from '../../../components/Tooltip'

const PROVIDER_CONFIG = {
  netflix: { icon: SiNetflix, color: '#E50914' },
  disney: { icon: TbBrandDisney, color: '#00D6E8' },
  max: { icon: SiHbomax, color: '#9E86FF' },
  hbo: { icon: SiHbomax, color: '#9E86FF' },
  paramount: { icon: SiParamountplus, color: '#0059F1' },
  apple: { icon: SiAppletv, color: '#007AFF' },
  amazon: { icon: FaAmazon, color: '#00A8E1' },
}

const CONFIG_KEYS = Object.keys(PROVIDER_CONFIG);

export default function ProviderBadge({ provider }) {
  const lowerName = provider.name.toLowerCase()
  const configKey = CONFIG_KEYS.find((k) => lowerName.includes(k))
  const config = PROVIDER_CONFIG[configKey]

  // Render branded SVG icon when a config match exists
  if (config) {
    const Icon = config.icon
    return (
      <Tooltip label={provider.name} side="bottom">
        <Icon
          className="w-12 h-12 rounded-lg"
          style={{ color: config.color }}
        />
      </Tooltip>
    )
  }

  // No config match and no TMDB logo → render nothing
  if (!provider.logoPath) return null

  // TMDB image fallback
  return (
    <Tooltip label={provider.name} side='bottom' >
      <img
        src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`}
        alt={provider.name}
        className="w-12 h-12 rounded-lg object-cover bg-surface-200"
        onError={(e) => (e.target.style.display = 'none')}
      />
    </Tooltip>
  )
}
