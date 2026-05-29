import { z } from 'zod'

export const entrySchema = z.object({
  whatsup_available: z.preprocess(
    (value) =>
      value === true ||
      value === 'true' ||
      value === 'on' ||
      value === '1',
    z.boolean()
  ),

  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be 100 characters or less'),

  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .max(30, 'Phone number must be 30 characters or less'),

  alternate_phone: z
    .string()
    .max(30, 'Alternate phone must be 30 characters or less')
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),

  street_address: z
    .string()
    .min(1, 'Street address is required')
    .max(250, 'Street address must be 250 characters or less'),

  building_name: z
    .string()
    .min(1, 'Building name is required')
    .max(150, 'Building name must be 150 characters or less'),

  flat_no: z
    .string()
    .max(50, 'Flat number must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  landmark: z
    .string()
    .max(150, 'Landmark must be 150 characters or less')
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

  meal_starting_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please provide a valid start date')
    .optional()
    .or(z.literal('')),

  status: z.enum(['Active', 'Inactive']).default('Active'),
})

export type EntryFormData = z.infer<typeof entrySchema>
