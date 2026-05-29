'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { entrySchema } from '@/lib/validations/entry'
import { createEntry, updateEntry } from '@/app/actions/entries'
import type { HotelMessEntry } from '@/types'

interface EntryFormProps {
  mode: 'create' | 'edit'
  entryId?: string
  initialData?: HotelMessEntry
}

type FieldErrors = Partial<Record<string, string>>

const defaultValues = {
  full_name: '',
  phone_number: '',
  alternate_phone: '',
  email: '',
  gender: '',
  meal_type: 'Lunch' as const,
  mess_plan_type: 'Daily' as const,
  number_of_persons: 1,
  special_notes: '',
  status: 'Active' as const,
}

export default function EntryForm({ mode, entryId, initialData }: EntryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)

  const [formValues, setFormValues] = useState({
    full_name: initialData?.full_name ?? defaultValues.full_name,
    phone_number: initialData?.phone_number ?? defaultValues.phone_number,
    alternate_phone: initialData?.alternate_phone ?? defaultValues.alternate_phone,
    email: initialData?.email ?? defaultValues.email,
    gender: initialData?.gender ?? defaultValues.gender,
    meal_type: initialData?.meal_type ?? defaultValues.meal_type,
    mess_plan_type: initialData?.mess_plan_type ?? defaultValues.mess_plan_type,
    number_of_persons: initialData?.number_of_persons ?? defaultValues.number_of_persons,
    special_notes: initialData?.special_notes ?? defaultValues.special_notes,
    status: initialData?.status ?? defaultValues.status,
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    // Client-side validation
    const result = entrySchema.safeParse({
      ...formValues,
      number_of_persons: Number(formValues.number_of_persons),
    })

    if (!result.success) {
      const errors: FieldErrors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string
        errors[field] = err.message
      })
      setFieldErrors(errors)
      return
    }

    const formData = new FormData()
    Object.entries(formValues).forEach(([key, val]) => {
      formData.set(key, String(val ?? ''))
    })

    startTransition(async () => {
      const res =
        mode === 'edit' && entryId
          ? await updateEntry(entryId, formData)
          : await createEntry(formData)

      if (res.error) {
        setServerError(res.error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        if (mode === 'edit' && entryId) {
          router.push(`/entries/${entryId}`)
        } else {
          router.push('/entries')
        }
      }, 1200)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Success Banner */}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Entry {mode === 'edit' ? 'updated' : 'created'} successfully! Redirecting…
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {serverError}
        </div>
      )}

      {/* Section: Personal Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">Personal Information</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            label="Full Name"
            name="full_name"
            required
            value={formValues.full_name}
            onChange={handleChange}
            error={fieldErrors.full_name}
            placeholder="e.g. Ahmed Al Mansouri"
          />
          <FormField
            label="Phone Number"
            name="phone_number"
            required
            value={formValues.phone_number}
            onChange={handleChange}
            error={fieldErrors.phone_number}
            placeholder="e.g. +971 50 123 4567"
          />
          <FormField
            label="Alternate Phone"
            name="alternate_phone"
            value={formValues.alternate_phone ?? ''}
            onChange={handleChange}
            error={fieldErrors.alternate_phone}
            placeholder="Optional"
          />
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formValues.email ?? ''}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="Optional"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gender
            </label>
            <select
              name="gender"
              value={formValues.gender ?? ''}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value="">Select gender (optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

        </div>
      </div>

      {/* Section: Meal Plan */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">Meal Plan Details</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Meal Type <span className="text-red-500">*</span>
            </label>
            <select
              name="meal_type"
              value={formValues.meal_type}
              onChange={handleChange}
              required
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.meal_type
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            >
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Lunch & Dinner">Lunch &amp; Dinner</option>
            </select>
            {fieldErrors.meal_type && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.meal_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mess Plan Type <span className="text-red-500">*</span>
            </label>
            <select
              name="mess_plan_type"
              value={formValues.mess_plan_type}
              onChange={handleChange}
              required
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.mess_plan_type
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            {fieldErrors.mess_plan_type && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.mess_plan_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Number of Persons <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="number_of_persons"
              value={formValues.number_of_persons}
              onChange={handleChange}
              min={1}
              max={50}
              required
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.number_of_persons
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {fieldErrors.number_of_persons && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.number_of_persons}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formValues.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Notes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">Additional Notes</h3>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Special Notes
          </label>
          <textarea
            name="special_notes"
            value={formValues.special_notes ?? ''}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Any dietary restrictions, special requirements, or additional information…"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 transition-colors resize-none ${
              fieldErrors.special_notes
                ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
          <div className="flex justify-between mt-1">
            {fieldErrors.special_notes ? (
              <p className="text-xs text-red-500">{fieldErrors.special_notes}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400">
              {(formValues.special_notes ?? '').length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || success}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isPending && (
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isPending
            ? mode === 'edit'
              ? 'Updating…'
              : 'Saving…'
            : mode === 'edit'
            ? 'Update Entry'
            : 'Save Entry'}
        </button>
      </div>
    </form>
  )
}

// ── Reusable field component ──────────────────────────────────────────────────

interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  placeholder?: string
  required?: boolean
  type?: string
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required,
  type = 'text',
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{' '}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
