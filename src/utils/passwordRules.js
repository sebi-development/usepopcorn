// One definition of a strong password: the form rules and the live checklist both read it
export const PASSWORD_CHECKS = [
  { key: 'lower', text: 'At least one lowercase letter', error: 'Needs a lowercase letter', test: (v) => /[a-z]/.test(v) },
  { key: 'upper', text: 'At least one uppercase letter', error: 'Needs an uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', text: 'At least one number', error: 'Needs a number', test: (v) => /[0-9]/.test(v) },
  { key: 'length', text: 'Minimum 8 characters', error: 'Minimum 8 characters', test: (v) => v.length >= 8 },
]

// Spread into register(): the first failing check shows its message
export const PASSWORD_RULES = {
  required: 'Password is required',
  validate: Object.fromEntries(PASSWORD_CHECKS.map(({ key, test, error }) => [key, (v) => test(v) || error])),
}
