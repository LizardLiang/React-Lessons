import { BuggyForm } from './components/BuggyForm'
import { CorrectForm } from './components/CorrectForm'

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
          Formik setValues Race Condition Bug Demo
        </h1>
        <p style={{ margin: '10px 0 0', opacity: 0.8 }}>
          Side-by-side comparison of buggy vs correct implementation
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div
        style={{
          display: 'flex',
          minHeight: 'calc(100vh - 100px)',
        }}
      >
        {/* Left: Buggy Form */}
        <div
          style={{
            flex: 1,
            borderRight: '3px solid #333',
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
              fontSize: '1.1em',
              textAlign: 'center',
            }}
          >
            ❌ BUGGY BEHAVIOR (using setValues)
          </div>
          <BuggyForm />
        </div>

        {/* Right: Correct Form */}
        <div
          style={{
            flex: 1,
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
              fontSize: '1.1em',
              textAlign: 'center',
            }}
          >
            ✅ CORRECT SOLUTION (using setFieldValue)
          </div>
          <CorrectForm />
        </div>
      </div>
    </div>
  )
}

export default App
