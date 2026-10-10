// Shared filter model for every filterable list (Browse rows/grids, the Community feed).
//
// A surface describes its filters as defs:
//   { key, label, kind: 'select' | 'multi', options: [{ value, label }] }
// - select: one value              URL `country=KR`   → 'KR'
// - multi:  any of several values  URL `genre=35,28`  → ['28', '35'] (deduped, sorted)
// A filter whose options only exist at runtime (e.g. followed users) passes `validate(value)`
// instead of checking against `options`.
//
// Parsed filters hold only active keys, in def order, so the same selection always produces the
// same object: they go straight into query keys.

const isValid = (def, value) => (def.validate
  ? def.validate(value)
  : def.options?.some((option) => option.value === value))

const PARSERS = {
  select: (raw, def) => (isValid(def, raw) ? raw : null),
  multi: (raw, def) => {
    const values = [...new Set(raw.split(','))].filter((value) => isValid(def, value)).sort()
    return values.length ? values : null
  },
}

const SERIALIZERS = {
  select: (value) => value,
  multi: (values) => [...values].sort().join(','),
}

export function parseFilters(searchParams, defs) {
  const filters = {}
  for (const def of defs) {
    const raw = searchParams.get(def.key)
    if (!raw) continue
    const value = PARSERS[def.kind](raw, def)
    if (value != null) filters[def.key] = value
  }
  return filters
}

// Copy of `searchParams` with every def's param replaced by `filters` (non-filter params kept).
export function writeFilters(searchParams, defs, filters) {
  const next = new URLSearchParams(searchParams)
  for (const def of defs) {
    next.delete(def.key)
    const value = filters[def.key]
    if (value != null) next.set(def.key, SERIALIZERS[def.kind](value))
  }
  return next
}

export const isEmptyFilters = (filters) => !filters || Object.keys(filters).length === 0

const optionLabel = (def, value) => def.options?.find((option) => option.value === value)?.label

// One removable chip per active value: a multi filter gives one per value.
// `remove` is the filter's value without this chip (undefined clears the key).
export function getActiveChips(defs, filters) {
  const chips = []
  for (const def of defs) {
    const value = filters[def.key]
    if (value == null) continue
    if (def.kind === 'multi') {
      for (const v of value) {
        const rest = value.filter((other) => other !== v)
        chips.push({ id: `${def.key}:${v}`, key: def.key, label: optionLabel(def, v) ?? v, remove: rest.length ? rest : undefined })
      }
    } else {
      chips.push({ id: def.key, key: def.key, label: optionLabel(def, value) ?? def.label, remove: undefined })
    }
  }
  return chips
}
