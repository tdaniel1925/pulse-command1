/**
 * Formats a phone number string to x-xxx-xxx-xxxx (or +x-xxx-xxx-xxxx for intl).
 * Returns the original string if it can't be parsed.
 */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 11) {
    return `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return raw
}
