import React from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { getCountryOptions } from '../../../utils/getCountries';

// This component is strictly separated so it can be lazy-loaded.
const CountrySelect = React.forwardRef(function CountrySelect({ ...props }, ref) {
  const options = getCountryOptions();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-muted">Country</label>
      <div className="relative">
        <select
          ref={ref}
          {...props}
          className="appearance-none w-full py-2 pl-4 pr-10 rounded-lg text-sm bg-surface-100 text-text border border-white/5 outline-none ring-0 transition-all duration-200 focus:border-primary focus:bg-surface-900/40 focus:shadow-inner cursor-pointer"
        >
          <option value="" disabled>Select a country...</option>
          {options.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <LuChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      </div>
    </div>
  );
});

export default CountrySelect;
