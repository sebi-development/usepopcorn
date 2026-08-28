import React from 'react';

const Switch = React.memo(({ options, value, onChange, size = "md" }) => {
  const containerSizeClasses = size === "sm" ? "p-1 gap-1" : "p-1.5 gap-1.5";
  const buttonSizeClasses = size === "sm" ? "px-3 py-1 text-sm" : "px-4 py-2 text-base";

  return (
    <div
      role="radiogroup"
      className={`inline-flex items-center rounded-full bg-surface-500 ${containerSizeClasses}`}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={`
              rounded-full font-medium whitespace-nowrap
              transition-all duration-200 ease-out
              ${buttonSizeClasses}
              ${
                isActive
                  ? "bg-primary-light text-white shadow-lg shadow-primary/20 scale-100"
                  : "text-gray-400 hover:text-white scale-95 opacity-80 hover:opacity-100"
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
});

Switch.displayName = 'Switch';

export default Switch;
