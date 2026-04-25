'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Fires a success toast when the page mounts.
 * Rendered only when `?reset=success` is present in the URL.
 */
export function ResetSuccessToast() {
  useEffect(() => {
    toast.success('Password updated successfully.')
  }, [])

  return null
}
