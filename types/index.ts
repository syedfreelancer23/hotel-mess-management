export type MealType = 'Lunch' | 'Dinner' | 'Lunch & Dinner'
export type MessPlanType = 'Daily' | 'Weekly' | 'Monthly'
export type GenderType = 'Male' | 'Female' | 'Other'
export type StatusType = 'Active' | 'Inactive'

export interface HotelMessEntry {
  id: string
  full_name: string
  phone_number: string
  whatsup_available: boolean
  alternate_phone: string | null
  email: string | null
  gender: GenderType | null
  meal_type: MealType
  mess_plan_type: MessPlanType
  number_of_persons: number
  special_notes: string | null
  status: StatusType
  created_by: number
  created_at: string
  updated_at: string
}

export interface ActionResult {
  error?: string
  success?: boolean
  id?: string
}
