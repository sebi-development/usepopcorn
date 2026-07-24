import { memo, useMemo } from 'react';

const SIZES = {
  md: { button: 'px-4 py-1.5', content: 'gap-2 text-xs', icon: 'w-3.5 h-3.5' },
  sm: { button: 'px-2.5 py-1', content: 'gap-1.5 text-[0.65rem]', icon: 'w-3 h-3' },
}

const Chip = memo(function Chip({ 
  label, 
  icon: Icon, 
  colorRgb = "121, 80, 242",
  size = 'md',
  className = "",
  onClick 
}) {

  const dynamicStyles = useMemo(() => ({
    "--chip-base": `rgb(${colorRgb})`,
    "--chip-muted": `rgba(${colorRgb}, 0.25)`,
    "--chip-glow": `rgba(${colorRgb}, 0.5)`,
  }), [colorRgb]);

  const { button, content, icon } = SIZES[size]

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`relative inline-flex items-center justify-center ${button} rounded-full group outline-none transition-transform ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'} ${className}`}
      style={dynamicStyles}
    >
      {/* The Smoked Glass */}
      <div 
        className="absolute inset-0 rounded-full bg-[#0a0a0a]/60 backdrop-blur-md transition-colors duration-300 group-hover:bg-[#0a0a0a]/40"
        style={{ boxShadow: `inset 0 0 16px var(--chip-muted)` }}
      />

      {/* The Gradient Edge Mask */}
      <div 
        className="absolute inset-0 rounded-full p-[1px] pointer-events-none"
        style={{
          background: `linear-gradient(135deg, var(--chip-muted) 0%, var(--chip-muted) 40%, var(--chip-base) 100%)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* The Ambient Outset Glow */}
      <div 
        className="absolute inset-0 rounded-full opacity-60 blur-[6px] pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, transparent 40%, var(--chip-glow) 100%)`,
        }}
      />

      {/* The Content */}
      <div 
        className={`relative z-10 flex items-center ${content} font-medium tracking-wide drop-shadow-md`}
        style={{ color: "var(--chip-base)" }}
      >
        {Icon && <Icon className={icon} />}
        <span className="mt-[1px]">{label}</span>
      </div>
    </button>
  );
});

export default Chip;