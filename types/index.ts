export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Full Board'
export type MessPlanType = 'Daily' | 'Weekly' | 'Monthly'
export type GenderType = 'Male' | 'Female' | 'Other'
export type StatusType = 'Active' | 'Inactive'

export interface HotelMessEntry {
  id: string
  full_name: string
  phone_number: string
  alternate_phone: string | null
  email: string | null
  gender: GenderType | null
  nationality: string | null
  emirates_id_or_passport: string | null
  meal_type: MealType
  mess_plan_type: MessPlanType
  number_of_persons: number
  special_notes: string | null
  status: StatusType
  created_by: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
    name?: string
    user_name?: string
  }
}

export interface ActionResult {
  error?: string
  success?: boolean
  id?: string
}
