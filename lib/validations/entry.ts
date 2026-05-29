import { z } from 'zod'

export const entrySchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be 100 characters or less'),

  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number must be 20 characters or less'),

  alternate_phone: z
    .string()
    .max(20, 'Alternate phone must be 20 characters or less')
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),

  gender: z.enum(['Male', 'Female', 'Other', '']).optional(),

  meal_type: z.enum(['Lunch', 'Dinner', 'Lunch & Dinner'], {
    required_error: 'Meal type is required',
    invalid_type_error: 'Please select a valid meal type',
  }),

  mess_plan_type: z.enum(['Daily', 'Weekly', 'Monthly'], {
    required_error: 'Mess plan type is required',
    invalid_type_error: 'Please select a valid plan type',
  }),

  number_of_persons: z.coerce
    .number({
      required_error: 'Number of persons is required',
      invalid_type_error: 'Must be a number',
    })
    .int('Must be a whole number')
    .min(1, 'At least 1 person is required')
    .max(50, 'Maximum 50 persons allowed'),

  special_notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .or(z.literal('')),

  status: z.enum(['Active', 'Inactive']).default('Active'),
})

export type EntryFormData = z.infer<typeof entrySchema>
