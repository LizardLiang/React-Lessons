import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Simulates a context that provides multiple values from an API
interface AppContextValue {
  configVersion: string | null
  standard: string | null
  organizationId: number | null
  documentName: string | null
  fiscalYear: number | null
  loading: boolean
}

const defaultValue: AppContextValue = {
  configVersion: null,
  standard: null,
  organizationId: null,
  documentName: null,
  fiscalYear: null,
  loading: true,
}

const AppContext = createContext<AppContextValue>(defaultValue)

export function UserProvider({ children }: { children: ReactNode }) {
  const [contextValues, setContextValues] = useState<AppContextValue>(defaultValue)

  useEffect(() => {
    // Mock API call - context values arrive at ~50ms
    console.log('[AppContext] Fetching context values...')
    const timer = setTimeout(() => {
      const values = {
        configVersion: 'CONFIG-2024-V1',
        standard: 'ISO-9001',
        organizationId: 12345,
        documentName: 'Annual Report 2024',
        fiscalYear: 2024,
        loading: false,
      }
      console.log('[AppContext] Context values ready:', values)
      setContextValues(values)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AppContext.Provider value={contextValues}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
