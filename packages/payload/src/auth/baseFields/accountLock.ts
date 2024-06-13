import type { Field } from '../../bundle.js'

export const baseAccountLockFields = [
  {
    name: 'loginAttempts',
    type: 'number',
    defaultValue: 0,
    hidden: true,
  },
  {
    name: 'lockUntil',
    type: 'date',
    hidden: true,
  },
] as Field[]
