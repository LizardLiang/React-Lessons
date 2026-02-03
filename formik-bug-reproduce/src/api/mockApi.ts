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

export interface UserSettings {
  notifications: boolean
  timezone: string
}

export interface UserProfile {
  avatar: string
  bio: string
}

/**
 * API C - Returns after 80ms
 */
export function fetchUserSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        notifications: true,
        timezone: 'UTC+8',
      }
      console.log('API C (Settings) returned:', data)
      resolve(data)
    }, 80)
  })
}

/**
 * API D - Returns after 120ms
 */
export function fetchUserProfile(): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        avatar: 'avatar.png',
        bio: 'Hello world',
      }
      console.log('API D (Profile) returned:', data)
      resolve(data)
    }, 120)
  })
}
