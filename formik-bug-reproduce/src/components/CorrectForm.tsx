import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import {
  fetchUserBasicInfo,
  fetchUserPreferences,
  UserBasicInfo,
  UserPreferences,
} from '../api/mockApi'

interface FormValues {
  name: string
  email: string
  theme: string
  language: string
}

const initialValues: FormValues = {
  name: '',
  email: '',
  theme: '',
  language: '',
}

export function CorrectForm() {
  const [apiCallsComplete, setApiCallsComplete] = useState(0)
  const [apiAResponse, setApiAResponse] = useState<UserBasicInfo | null>(null)
  const [apiBResponse, setApiBResponse] = useState<UserPreferences | null>(null)
  const [apiATime, setApiATime] = useState<number | null>(null)
  const [apiBTime, setApiBTime] = useState<number | null>(null)
  const [startTime] = useState(() => Date.now())

  const formik = useFormik<FormValues>({
    initialValues,
    onSubmit: (values) => {
      console.log('Form submitted:', values)
    },
  })

  // API A: Fetch basic info (returns after 100ms)
  useEffect(() => {
    console.log('[CorrectForm] --- Starting API A call ---')
    fetchUserBasicInfo().then((data) => {
      console.log('[CorrectForm] Setting values from API A (Basic Info):', data)
      setApiAResponse(data)
      setApiATime(Date.now() - startTime)
      // ✅ CORRECT: Use setFieldValue for individual fields
      // This doesn't rely on closure-captured formik.values
      formik.setFieldValue('name', data.name)
      formik.setFieldValue('email', data.email)
      setApiCallsComplete((prev) => prev + 1)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // API B: Fetch preferences (returns after 150ms)
  useEffect(() => {
    console.log('[CorrectForm] --- Starting API B call ---')
    fetchUserPreferences().then((data) => {
      console.log('[CorrectForm] Setting values from API B (Preferences):', data)
      setApiBResponse(data)
      setApiBTime(Date.now() - startTime)
      // ✅ CORRECT: Use setFieldValue for individual fields
      // Each field is updated independently, no stale closure issue
      formik.setFieldValue('theme', data.theme)
      formik.setFieldValue('language', data.language)
      setApiCallsComplete((prev) => prev + 1)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allFieldsPopulated =
    apiCallsComplete === 2 &&
    formik.values.name &&
    formik.values.email &&
    formik.values.theme &&
    formik.values.language

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#2e7d32' }}>✅ Correct Solution</h1>
      <h2 style={{ color: '#666', marginTop: '-10px' }}>Using setFieldValue</h2>

      <div
        style={{
          background: '#e8f5e9',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #4caf50',
        }}
      >
        <h3>How It Works:</h3>
        <p>
          <code>setFieldValue</code> updates individual fields without relying
          on the closure-captured <code>formik.values</code>.
        </p>
        <p>
          Each API callback updates only its own fields, so there's no risk of
          overwriting other fields.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>API Calls Complete:</strong> {apiCallsComplete}/2
        {allFieldsPopulated && (
          <span style={{ color: 'green', marginLeft: '10px', fontWeight: 'bold' }}>
            ✓ All fields populated correctly!
          </span>
        )}
      </div>

      {/* API Response Visualization Section */}
      <div
        style={{
          marginBottom: '20px',
          border: '2px solid #333',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#333',
            color: '#fff',
            padding: '10px 15px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          API Responses
        </div>
        <div style={{ display: 'flex' }}>
          {/* API A Response */}
          <div style={{ flex: 1, borderRight: '1px solid #ccc' }}>
            <div
              style={{
                background: '#e3f2fd',
                padding: '8px 12px',
                borderBottom: '1px solid #ccc',
                fontWeight: 'bold',
                color: '#1565c0',
              }}
            >
              API A (Basic Info)
              <br />
              <span style={{ fontWeight: 'normal', fontSize: '0.85em' }}>
                {apiATime !== null ? `Returned at: ${apiATime}ms` : 'Expected: ~100ms'}
              </span>
            </div>
            <div style={{ padding: '12px', background: '#fff', minHeight: '80px' }}>
              {apiAResponse ? (
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.9em',
                    color: '#1565c0',
                  }}
                >
                  {JSON.stringify(apiAResponse, null, 2)}
                </pre>
              ) : (
                <span style={{ color: '#999', fontStyle: 'italic' }}>Waiting...</span>
              )}
            </div>
          </div>
          {/* API B Response */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                background: '#e8f5e9',
                padding: '8px 12px',
                borderBottom: '1px solid #ccc',
                fontWeight: 'bold',
                color: '#2e7d32',
              }}
            >
              API B (Preferences)
              <br />
              <span style={{ fontWeight: 'normal', fontSize: '0.85em' }}>
                {apiBTime !== null ? `Returned at: ${apiBTime}ms` : 'Expected: ~150ms'}
              </span>
            </div>
            <div style={{ padding: '12px', background: '#fff', minHeight: '80px' }}>
              {apiBResponse ? (
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.9em',
                    color: '#2e7d32',
                  }}
                >
                  {JSON.stringify(apiBResponse, null, 2)}
                </pre>
              ) : (
                <span style={{ color: '#999', fontStyle: 'italic' }}>Waiting...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <h2>Current Form Values:</h2>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>name:</strong>{' '}
            <input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              style={{ marginLeft: '10px' }}
            />
            {formik.values.name && (
              <span style={{ color: 'green', marginLeft: '10px' }}>
                ✓ Set from API A
              </span>
            )}
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>email:</strong>{' '}
            <input
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              style={{ marginLeft: '10px' }}
            />
            {formik.values.email && (
              <span style={{ color: 'green', marginLeft: '10px' }}>
                ✓ Set from API A
              </span>
            )}
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>theme:</strong>{' '}
            <input
              name="theme"
              value={formik.values.theme}
              onChange={formik.handleChange}
              style={{ marginLeft: '10px' }}
            />
            {formik.values.theme && (
              <span style={{ color: 'green', marginLeft: '10px' }}>
                ✓ Set from API B
              </span>
            )}
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>language:</strong>{' '}
            <input
              name="language"
              value={formik.values.language}
              onChange={formik.handleChange}
              style={{ marginLeft: '10px' }}
            />
            {formik.values.language && (
              <span style={{ color: 'green', marginLeft: '10px' }}>
                ✓ Set from API B
              </span>
            )}
          </label>
        </div>
      </form>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          background: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '8px',
        }}
      >
        <h3>Why This Works:</h3>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
          }}
        >
{`// ✅ Instead of:
formik.setValues({
  ...formik.values,  // ❌ Stale closure
  name: data.name,
  email: data.email,
})

// ✅ Use:
formik.setFieldValue('name', data.name)
formik.setFieldValue('email', data.email)`}
        </pre>
        <p style={{ marginTop: '10px' }}>
          <code>setFieldValue</code> updates each field independently without
          reading the current form state from a closure.
        </p>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          background: '#e0e0e0',
          borderRadius: '4px',
        }}
      >
        <strong>Raw values object:</strong>
        <pre>{JSON.stringify(formik.values, null, 2)}</pre>
      </div>
    </div>
  )
}
