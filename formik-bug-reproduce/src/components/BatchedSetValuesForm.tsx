import { useFormik } from "formik";
import { useEffect, useState, useRef } from "react";
import { from, forkJoin } from "rxjs";
import { fetchUserBasicInfo, fetchUserPreferences } from "../api/mockApi";
import { useAppContext } from "../context/UserContext";

interface FormValues {
  // From context (~50ms)
  configId: string;
  standard: string;
  organizationId: number | null;
  documentName: string;
  fiscalYear: number | null;
  // From API (~100ms nested to ~250ms)
  unitIds: number[];
  parentUnitId: number | null;
}

const initialValues: FormValues = {
  configId: "",
  standard: "",
  organizationId: null,
  documentName: "",
  fiscalYear: null,
  unitIds: [],
  parentUnitId: null,
};

/**
 * Alternative approach: Wait for ALL data, then call setValues ONCE
 * This avoids race conditions by batching everything into a single update
 */
export function BatchedSetValuesForm() {
  const {
    configVersion,
    standard,
    organizationId,
    documentName,
    fiscalYear,
    loading: contextLoading,
  } = useAppContext();

  const [apiComplete, setApiComplete] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [timings, setTimings] = useState<Record<string, number>>({});
  const hasInitialized = useRef(false);

  const { values, setValues, handleChange, handleSubmit } = useFormik<FormValues>({
    enableReinitialize: false,
    validateOnMount: false,
    initialValues,
    onSubmit: (vals) => {
      console.log("Form submitted:", vals);
    },
  });

  // Single useEffect that waits for context + APIs, then sets everything at once
  useEffect(() => {
    // Only run once
    if (hasInitialized.current) return;

    // Wait for context to be ready
    if (contextLoading) {
      console.log("[Batched] Waiting for context...");
      return;
    }

    hasInitialized.current = true;
    console.log("[Batched] Context ready, starting APIs...");
    setTimings((t) => ({ ...t, contextReady: Date.now() - startTime }));

    // Use forkJoin to wait for all APIs to complete
    forkJoin({
      basicInfo: from(fetchUserBasicInfo()),
      preferences: from(fetchUserPreferences()),
    }).subscribe(({ basicInfo, preferences }) => {
      console.log("[Batched] All APIs complete, setting all values at once");
      setTimings((t) => ({ ...t, allApisComplete: Date.now() - startTime }));

      // ✅ Single setValues call with ALL data
      setValues({
        // Context values
        configId: configVersion || "",
        standard: standard || "",
        organizationId: organizationId,
        documentName: documentName || "",
        fiscalYear: fiscalYear,
        // API values
        unitIds: [1, 2, 3],
        parentUnitId: 1,
      });

      setApiComplete(true);
    });
  }, [
    contextLoading,
    configVersion,
    standard,
    organizationId,
    documentName,
    fiscalYear,
    setValues,
    startTime,
  ]);

  const contextReady = !contextLoading;
  const allComplete = contextReady && apiComplete;

  // Check for bugs
  const bugs = {
    configId: allComplete && configVersion && !values.configId,
    standard: allComplete && standard && !values.standard,
    organizationId: allComplete && organizationId && !values.organizationId,
    documentName: allComplete && documentName && !values.documentName,
    fiscalYear: allComplete && fiscalYear && !values.fiscalYear,
  };

  const hasBug = Object.values(bugs).some(Boolean);
  const bugFields = Object.entries(bugs)
    .filter(([, isBug]) => isBug)
    .map(([field]) => field);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1 style={{ color: "#1565c0" }}>Alternative: Batched setValues</h1>
      <h2 style={{ color: "#666", marginTop: "-10px" }}>
        Wait for all data, then single setValues
      </h2>

      <div
        style={{
          background: hasBug ? "#ffebee" : "#e3f2fd",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: `2px solid ${hasBug ? "#c62828" : "#1565c0"}`,
        }}
      >
        <h3 style={{ color: hasBug ? "#c62828" : "#1565c0" }}>
          {hasBug ? "Still has bugs!" : "✓ All values preserved!"}
        </h3>
        <p>
          <strong>How this works:</strong><br />
          Instead of multiple setValues calls racing each other, we:<br />
          1. Wait for context to be ready<br />
          2. Use <code>forkJoin</code> to wait for all APIs<br />
          3. Call <code>setValues</code> ONCE with all data
        </p>
        {hasBug && (
          <p style={{ color: "#c62828", fontWeight: "bold" }}>
            Lost fields: {bugFields.join(", ")}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Status:</strong>{" "}
        Context: {contextReady ? "✓" : "loading..."}{" "}
        | API: {apiComplete ? "✓" : "loading..."}
      </div>

      {/* Timing visualization */}
      <div
        style={{
          marginBottom: "20px",
          border: "2px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div style={{ background: "#333", color: "#fff", padding: "10px 15px", fontWeight: "bold" }}>
          Timeline (Batched)
        </div>
        <div style={{ padding: "15px", background: "#f5f5f5", fontSize: "0.9em" }}>
          {Object.entries(timings)
            .sort(([, a], [, b]) => a - b)
            .map(([name, time]) => (
              <div key={name} style={{ marginBottom: "3px" }}>
                <span style={{ width: "150px", display: "inline-block" }}>{name}:</span>
                <span>{time}ms</span>
              </div>
            ))}
          {Object.keys(timings).length === 0 && (
            <span style={{ color: "#999" }}>Waiting...</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <h2>Form Values (Formik):</h2>

        {Object.entries(values).map(([field, value]) => {
          const isBug = bugs[field as keyof typeof bugs];
          const isContextField = ["configId", "standard", "organizationId", "documentName", "fiscalYear"].includes(field);

          return (
            <div key={field} style={{ marginBottom: "8px" }}>
              <label>
                <strong style={{ color: isContextField ? "#1565c0" : "#333" }}>{field}:</strong>{" "}
                <input
                  name={field}
                  value={Array.isArray(value) ? JSON.stringify(value) : String(value ?? "")}
                  onChange={handleChange}
                  style={{ marginLeft: "10px", width: "180px" }}
                  readOnly={Array.isArray(value)}
                />
                {value && !isBug && (
                  <span style={{ color: "green", marginLeft: "10px" }}>✓</span>
                )}
                {isBug && (
                  <span style={{ color: "red", marginLeft: "10px" }}>✗ LOST!</span>
                )}
              </label>
            </div>
          );
        })}
      </form>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#e3f2fd",
          border: "2px solid #1565c0",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ color: "#1565c0" }}>The Batched Approach:</h3>
        <pre style={{ background: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto", fontSize: "0.8em" }}>
{`// Wait for context, then batch all updates
useEffect(() => {
  if (contextLoading) return;

  forkJoin({
    basicInfo: from(fetchUserBasicInfo()),
    preferences: from(fetchUserPreferences()),
  }).subscribe(({ basicInfo, preferences }) => {
    // ✅ Single setValues with ALL data
    setValues({
      configId: configVersion,
      standard: standard,
      organizationId: organizationId,
      // ... all context values
      unitIds: [1, 2, 3],
      parentUnitId: 1,
    });
  });
}, [contextLoading, ...contextDeps]);

// Pros: No race conditions
// Cons: Form stays empty until ALL data is ready
//       Requires restructuring existing code`}
        </pre>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", background: "#e0e0e0", borderRadius: "4px" }}>
        <strong>Raw Formik values:</strong>
        <pre style={{ fontSize: "0.85em" }}>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
