const CSRF_STORAGE_KEY = 'member-backend-csrf-token'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage
}

export function saveCsrfToken(token: string): void {
  const storage = getStorage()

  if (storage) {
    storage.setItem(CSRF_STORAGE_KEY, token)
  }
}

export function getCsrfToken(): string | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  const token = storage.getItem(CSRF_STORAGE_KEY)

  return token && token.length > 0 ? token : null
}

export function clearCsrfToken(): void {
  const storage = getStorage()

  if (storage) {
    storage.removeItem(CSRF_STORAGE_KEY)
  }
}