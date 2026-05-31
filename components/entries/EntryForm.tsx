'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import intlTelInput, { NUMBER_FORMAT } from 'intl-tel-input'
import { entrySchema } from '@/lib/validations/entry'
import { createEntry, updateEntry } from '@/app/actions/entries'
import type { HotelMessEntry } from '@/types'

interface EntryFormProps {
  mode: 'create' | 'edit'
  entryId?: string
  initialData?: HotelMessEntry
  canCreate?: boolean
}

type FieldErrors = Partial<Record<string, string>>

const defaultValues = {
  whatsup_available: false,
  full_name: '',
  phone_number: '',
  alternate_phone: '',
  email: '',
  street_address: '',
  building_name: '',
  flat_no: '',
  landmark: '',
  gender: '',
  meal_type: 'Lunch' as const,
  mess_plan_type: 'Monthly' as const,
  number_of_persons: 1,
  special_notes: '',
  meal_starting_date: '',
  status: 'Active' as const,
}

function normalizeMessPlanType(value?: string | null) {
  // Keep frontend value aligned with DB/UI constraint to prevent insert failures.
  return value === 'Monthly' ? 'Monthly' : 'Monthly'
}

export default function EntryForm({
  mode,
  entryId,
  initialData,
  canCreate = true,
}: EntryFormProps) {
  const router = useRouter()
  const phoneInputRef = useRef<HTMLInputElement | null>(null)
  const alternatePhoneInputRef = useRef<HTMLInputElement | null>(null)
  const phoneItiRef = useRef<ReturnType<typeof intlTelInput> | null>(null)
  const alternatePhoneItiRef = useRef<ReturnType<typeof intlTelInput> | null>(null)
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  const [formValues, setFormValues] = useState({
    whatsup_available: initialData?.whatsup_available ?? defaultValues.whatsup_available,
    full_name: initialData?.full_name ?? defaultValues.full_name,
    phone_number: initialData?.phone_number ?? defaultValues.phone_number,
    alternate_phone: initialData?.alternate_phone ?? defaultValues.alternate_phone,
    email: initialData?.email ?? defaultValues.email,
    street_address: initialData?.street_address ?? defaultValues.street_address,
    building_name: initialData?.building_name ?? defaultValues.building_name,
    flat_no: initialData?.flat_no ?? defaultValues.flat_no,
    landmark: initialData?.landmark ?? defaultValues.landmark,
    gender: initialData?.gender ?? defaultValues.gender,
    meal_type: initialData?.meal_type ?? defaultValues.meal_type,
    mess_plan_type: normalizeMessPlanType(
      initialData?.mess_plan_type ?? defaultValues.mess_plan_type
    ),
    number_of_persons: initialData?.number_of_persons ?? defaultValues.number_of_persons,
    special_notes: initialData?.special_notes ?? defaultValues.special_notes,
    meal_starting_date:
      initialData?.meal_starting_date?.slice(0, 10) ?? defaultValues.meal_starting_date,
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

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target
    setFormValues((prev) => ({ ...prev, [name]: checked }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function normalizePhoneValue(
    rawValue: string,
    iti: ReturnType<typeof intlTelInput> | null
  ) {
    if (iti?.getNumber()) {
      return iti.getNumber(NUMBER_FORMAT.E164)
    }

    const trimmedValue = rawValue.trim()

    if (!trimmedValue) {
      return ''
    }

    const compactValue = trimmedValue.replace(/[\s()-]/g, '')

    if (compactValue.startsWith('+')) {
      return `+${compactValue.slice(1).replace(/\D/g, '')}`
    }

    const digitsOnly = compactValue.replace(/\D/g, '')
    const dialCode = iti?.getSelectedCountry()?.dialCode ?? ''

    if (!dialCode) {
      return digitsOnly
    }

    if (digitsOnly.startsWith(dialCode)) {
      return `+${digitsOnly}`
    }

    const normalizedLocalNumber = digitsOnly.startsWith('0')
      ? digitsOnly.slice(1)
      : digitsOnly

    return `+${dialCode}${normalizedLocalNumber}`
  }

  function syncNormalizedPhoneValue(
    input: HTMLInputElement | null,
    iti: ReturnType<typeof intlTelInput> | null,
    fieldName: 'phone_number' | 'alternate_phone'
  ) {
    if (!input) return ''

    const normalizedValue = normalizePhoneValue(input.value, iti)
    input.value = normalizedValue
    setFormValues((prev) => ({ ...prev, [fieldName]: normalizedValue }))

    return normalizedValue
  }

  useEffect(() => {
    if (phoneInputRef.current) {
      phoneItiRef.current = intlTelInput(phoneInputRef.current, {
        initialCountry: 'ae',
        formatAsYouType: true,
        loadUtils: () => import('intl-tel-input/utils'),
        numberDisplayFormat: NUMBER_FORMAT.INTERNATIONAL,
      })

      if (formValues.phone_number) {
        phoneItiRef.current.setNumber(formValues.phone_number)
      }
    }

    if (alternatePhoneInputRef.current) {
      alternatePhoneItiRef.current = intlTelInput(alternatePhoneInputRef.current, {
        initialCountry: 'ae',
        formatAsYouType: true,
        loadUtils: () => import('intl-tel-input/utils'),
        numberDisplayFormat: NUMBER_FORMAT.INTERNATIONAL,
      })

      if (formValues.alternate_phone) {
        alternatePhoneItiRef.current.setNumber(formValues.alternate_phone)
      }
    }

    const syncPhoneFromIntl = () => {
      if (!phoneInputRef.current) return
      setFormValues((prev) => ({
        ...prev,
        phone_number: phoneInputRef.current?.value ?? prev.phone_number,
      }))
    }

    const syncAlternatePhoneFromIntl = () => {
      if (!alternatePhoneInputRef.current) return
      setFormValues((prev) => ({
        ...prev,
        alternate_phone:
          alternatePhoneInputRef.current?.value ?? prev.alternate_phone,
      }))
    }

    phoneInputRef.current?.addEventListener('countrychange', syncPhoneFromIntl)
    alternatePhoneInputRef.current?.addEventListener(
      'countrychange',
      syncAlternatePhoneFromIntl
    )

    return () => {
      phoneInputRef.current?.removeEventListener(
        'countrychange',
        syncPhoneFromIntl
      )
      alternatePhoneInputRef.current?.removeEventListener(
        'countrychange',
        syncAlternatePhoneFromIntl
      )
      phoneItiRef.current?.destroy()
      alternatePhoneItiRef.current?.destroy()
      phoneItiRef.current = null
      alternatePhoneItiRef.current = null
    }
    // Initialize once for this component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    if (mode === 'create' && !canCreate) {
      setServerError('Only role_id 2 users can submit new entries.')
      return
    }

    // Read phone numbers directly from the DOM inputs so we always
    // get the current value regardless of React state sync with intlTelInput.
    const phoneNumber =
      syncNormalizedPhoneValue(
        phoneInputRef.current,
        phoneItiRef.current,
        'phone_number'
      ) || formValues.phone_number
    const alternatePhone =
      syncNormalizedPhoneValue(
        alternatePhoneInputRef.current,
        alternatePhoneItiRef.current,
        'alternate_phone'
      ) || formValues.alternate_phone

    // Client-side validation
    const result = entrySchema.safeParse({
      ...formValues,
      phone_number: phoneNumber,
      alternate_phone: alternatePhone,
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
    // Override with the resolved intlTelInput values
    formData.set('phone_number', phoneNumber)
    formData.set('alternate_phone', String(alternatePhone ?? ''))

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
      const successName = result.data.full_name
      setToastMessage(
        `${successName}, entry ${mode === 'edit' ? 'updated' : 'submitted'} successfully.`
      )
      setShowToast(true)

      setTimeout(() => {
        setShowToast(false)
      }, 1800)

      setTimeout(() => {
        if (mode === 'edit' && entryId) {
          router.push(`/entries/${entryId}`)
        } else {
          router.push('/entries')
        }
      }, 2400)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 warm-entry-form" noValidate>
      {toastMessage && (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg transition-opacity duration-700 ${
            showToast ? 'opacity-100' : 'opacity-0'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {toastMessage}
          </div>
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

      {mode === 'create' && !canCreate && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Only users with role_id 2 can submit this form.
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              ref={phoneInputRef}
              type="tel"
              name="phone_number"
              required
              onChange={handleChange}
              onBlur={() =>
                syncNormalizedPhoneValue(
                  phoneInputRef.current,
                  phoneItiRef.current,
                  'phone_number'
                )
              }
              placeholder="e.g. +971 50 123 4567"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.phone_number
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {fieldErrors.phone_number && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.phone_number}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="whatsup_available"
                checked={formValues.whatsup_available}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              WhatsApp Available
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alternate Phone
            </label>
            <input
              ref={alternatePhoneInputRef}
              type="tel"
              name="alternate_phone"
              onChange={handleChange}
              onBlur={() =>
                syncNormalizedPhoneValue(
                  alternatePhoneInputRef.current,
                  alternatePhoneItiRef.current,
                  'alternate_phone'
                )
              }
              placeholder="Optional"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.alternate_phone
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {fieldErrors.alternate_phone && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.alternate_phone}</p>
            )}
          </div>
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formValues.email ?? ''}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="Optional"
          />
          <FormField
            label="Street Address"
            name="street_address"
            required
            value={formValues.street_address}
            onChange={handleChange}
            error={fieldErrors.street_address}
            placeholder="e.g. Al Rigga Street"
          />
          <FormField
            label="Building Name"
            name="building_name"
            required
            value={formValues.building_name}
            onChange={handleChange}
            error={fieldErrors.building_name}
            placeholder="e.g. Al Noor Building"
          />
          <FormField
            label="Flat No"
            name="flat_no"
            value={formValues.flat_no ?? ''}
            onChange={handleChange}
            error={fieldErrors.flat_no}
            placeholder="Optional"
          />
          <FormField
            label="Landmark"
            name="landmark"
            value={formValues.landmark ?? ''}
            onChange={handleChange}
            error={fieldErrors.landmark}
            placeholder="Optional"
          />
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
              Meal Starting Date
            </label>
            <input
              type="date"
              name="meal_starting_date"
              value={formValues.meal_starting_date ?? ''}
              onChange={handleChange}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.meal_starting_date
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {fieldErrors.meal_starting_date && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.meal_starting_date}</p>
            )}
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
          className="warm-outline-btn"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || success || (mode === 'create' && !canCreate)}
          className="warm-btn warm-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
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
