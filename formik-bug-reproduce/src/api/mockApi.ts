export interface UserBasicInfo {
  name: string
  email: string
}

export interface UserPreferences {
  theme: string
  language: string
}

/**
 * Simulates fetching basic user info from API
 * Returns after 100ms delay
 */
export function fetchUserBasicInfo(): Promise<UserBasicInfo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      }
      console.log('API A (Basic Info) returned:', data)
      resolve(data)
    }, 100)
  })
}

/**
 * Simulates fetching user preferences from API
 * Returns after 150ms delay (50ms after basic info)
 */
export function fetchUserPreferences(): Promise<UserPreferences> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        theme: 'dark',
        language: 'en',
      }
      console.log('API B (Preferences) returned:', data)
      resolve(data)
    }, 150)
  })
}
