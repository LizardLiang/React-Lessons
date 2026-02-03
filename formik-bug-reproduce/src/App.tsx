import { FunctionalUpdateBuggyForm } from './components/FunctionalUpdateBuggyForm'
import { SetFieldValueFixForm } from './components/SetFieldValueFixForm'
import { BatchedSetValuesForm } from './components/BatchedSetValuesForm'

function App() {
  return (
    <div style={{ fontFamily: 'monospace' }}>
      {/* Header */}
      <div
        style={{
          background: '#1a1a2e',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>
          Formik setValues Race Condition - Context + Multiple Effects
        </h1>
        <p style={{ margin: '10px 0 0', opacity: 0.8 }}>
          Scenario: Multiple context values + nested API calls all using setValues
        </p>
      </div>

      {/* Three-column comparison */}
      <div
        style={{
          display: 'flex',
          minHeight: 'calc(100vh - 100px)',
        }}
      >
        {/* Left: Buggy Form (multiple setValues) */}
        <div
          style={{
            flex: 1,
            borderRight: '2px solid #333',
            background: '#fff5f5',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              background: '#c62828',
              color: '#fff',
              padding: '10px 20px',
              fontWeight: 'bold',
              fontSize: '1em',
              textAlign: 'center',
            }}
          >
            ❌ BUG: Multiple setValues((prev) =&gt; ...)
          </div>
          <FunctionalUpdateBuggyForm />
        </div>

        {/* Middle: setFieldValue Fix */}
        <div
          style={{
            flex: 1,
            borderRight: '2px solid #333',
            background: '#f5fff5',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              background: '#2e7d32',
              color: '#fff',
              padding: '10px 20px',
              fontWeight: 'bold',
              fontSize: '1em',
              textAlign: 'center',
            }}
          >
            ✅ FIX 1: setFieldValue()
          </div>
          <SetFieldValueFixForm />
        </div>

        {/* Right: Batched setValues Fix */}
        <div
          style={{
            flex: 1,
            background: '#f5f5ff',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              background: '#1565c0',
              color: '#fff',
              padding: '10px 20px',
              fontWeight: 'bold',
              fontSize: '1em',
              textAlign: 'center',
            }}
          >
            ✅ FIX 2: Batched single setValues
          </div>
          <BatchedSetValuesForm />
        </div>
      </div>
    </div>
  )
}

export default App
