import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { from } from "rxjs";
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

export function FunctionalUpdateBuggyForm() {
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

  const { values, setValues, handleChange, handleSubmit } = useFormik<FormValues>({
    enableReinitialize: false,
    validateOnMount: false,
    initialValues,
    onSubmit: (vals) => {
      console.log("Form submitted:", vals);
    },
  });

  // useEffect #1: Sync configVersion from context
  useEffect(() => {
    if (configVersion && values.configId !== configVersion) {
      console.log("[Effect 1] Syncing configId from context:", configVersion);
      setTimings((t) => ({ ...t, configId: Date.now() - startTime }));
      setValues((prev) => ({
        ...prev,
        configId: configVersion,
      }));
    }
  }, [configVersion, values.configId, setValues, startTime]);

  // useEffect #2: Sync standard from context
  useEffect(() => {
    if (standard && values.standard !== standard) {
      console.log("[Effect 2] Syncing standard from context:", standard);
      setTimings((t) => ({ ...t, standard: Date.now() - startTime }));
      setValues((prev) => ({
        ...prev,
        standard: standard,
      }));
    }
  }, [standard, values.standard, setValues, startTime]);

  // useEffect #3: Sync organizationId from context
  useEffect(() => {
    if (organizationId && values.organizationId !== organizationId) {
      console.log("[Effect 3] Syncing organizationId from context:", organizationId);
      setTimings((t) => ({ ...t, organizationId: Date.now() - startTime }));
      setValues((prev) => ({
        ...prev,
        organizationId: organizationId,
      }));
    }
  }, [organizationId, values.organizationId, setValues, startTime]);

  // useEffect #4: Sync documentName and fiscalYear from context
  useEffect(() => {
    if ((documentName && values.documentName !== documentName) ||
        (fiscalYear && values.fiscalYear !== fiscalYear)) {
      console.log("[Effect 4] Syncing documentName/fiscalYear:", { documentName, fiscalYear });
      setTimings((t) => ({ ...t, documentName: Date.now() - startTime }));
      setValues((prev) => ({
        ...prev,
        documentName: documentName || prev.documentName,
        fiscalYear: fiscalYear || prev.fiscalYear,
      }));
    }
  }, [documentName, fiscalYear, values.documentName, values.fiscalYear, setValues, startTime]);

  // useEffect #5: Nested API call (simulates nested RxJS subscriptions)
  useEffect(() => {
    if (values.unitIds.length > 0) return;

    console.log("[Effect 5] Starting nested API subscription...");

    // Outer API (~100ms)
    from(fetchUserBasicInfo()).subscribe(() => {
      console.log("[Effect 5] Outer API returned, starting inner...");
      setTimings((t) => ({ ...t, outerApi: Date.now() - startTime }));

      // Inner API (~150ms after outer = ~250ms total)
      from(fetchUserPreferences()).subscribe(() => {
        console.log("[Effect 5] Inner API returned, calling setValues...");
        setTimings((t) => ({ ...t, innerApi: Date.now() - startTime }));

        // BUG: This setValues overwrites context values!
        // The `prev` here has stale/empty context values
        setValues((prev) => {
          console.log("[Effect 5] prev state:", prev);
          return {
            ...prev,
            unitIds: [1, 2, 3],
            parentUnitId: 1,
          };
        });

        setApiComplete(true);
      });
    });
  }, [setValues, startTime, values.unitIds.length]);

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
      <h1 style={{ color: "#9c27b0" }}>Context Values Lost Bug</h1>
      <h2 style={{ color: "#666", marginTop: "-10px" }}>
        Multiple context syncs + nested API all using setValues
      </h2>

      <div
        style={{
          background: hasBug ? "#ffebee" : "#e8f5e9",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: `2px solid ${hasBug ? "#c62828" : "#2e7d32"}`,
        }}
      >
        <h3 style={{ color: hasBug ? "#c62828" : "#2e7d32" }}>
          {hasBug ? "BUG: Context values LOST!" : "All values preserved"}
        </h3>
        <p>
          <strong>Pattern:</strong><br />
          • ~50ms: Context ready (configVersion, standard, organizationId...)<br />
          • Effects 1-4: Each syncs a context value via setValues<br />
          • ~100ms: Outer API returns<br />
          • ~250ms: Inner API calls setValues → overwrites context values!
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
          setValues Call Timeline
        </div>
        <div style={{ padding: "15px", background: "#f5f5f5", fontSize: "0.9em" }}>
          {Object.entries(timings)
            .sort(([, a], [, b]) => a - b)
            .map(([name, time]) => (
              <div key={name} style={{ marginBottom: "3px" }}>
                <span style={{ width: "120px", display: "inline-block" }}>{name}:</span>
                <span>{time}ms</span>
              </div>
            ))}
        </div>
      </div>

      {/* Context values */}
      <div style={{ marginBottom: "20px", padding: "10px", background: "#fff3e0", borderRadius: "8px" }}>
        <strong>Context Values (from useAppContext):</strong>
        <pre style={{ fontSize: "0.85em", margin: "10px 0 0 0" }}>
{JSON.stringify({ configVersion, standard, organizationId, documentName, fiscalYear }, null, 2)}
        </pre>
      </div>

      <form onSubmit={handleSubmit}>
        <h2>Form Values (Formik):</h2>

        {Object.entries(values).map(([field, value]) => {
          const isBug = bugs[field as keyof typeof bugs];
          const isContextField = ["configId", "standard", "organizationId", "documentName", "fiscalYear"].includes(field);

          return (
            <div key={field} style={{ marginBottom: "8px" }}>
              <label>
                <strong style={{ color: isContextField ? "#e65100" : "#333" }}>{field}:</strong>{" "}
                <input
                  name={field}
                  value={Array.isArray(value) ? JSON.stringify(value) : String(value ?? "")}
                  onChange={handleChange}
                  style={{ marginLeft: "10px", width: "200px" }}
                  readOnly={Array.isArray(value)}
                />
                {value && !isBug && (
                  <span style={{ color: "green", marginLeft: "10px" }}>✓</span>
                )}
                {isBug && (
                  <span style={{ color: "red", marginLeft: "10px" }}>
                    ✗ LOST! (was: {field === "configId" ? configVersion : ""})
                  </span>
                )}
                {isContextField && <span style={{ color: "#999", marginLeft: "5px" }}>(from context)</span>}
              </label>
            </div>
          );
        })}
      </form>

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          background: "#ffebee",
          border: "2px solid #c62828",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ color: "#c62828" }}>The Bug Pattern:</h3>
        <pre style={{ background: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto", fontSize: "0.8em" }}>
{`// Multiple useEffects syncing context values
useEffect(() => {
  if (configVersion && values.configId !== configVersion) {
    setValues((prev) => ({ ...prev, configId: configVersion }));
  }
}, [configVersion, ...]);

useEffect(() => {
  if (standard && values.standard !== standard) {
    setValues((prev) => ({ ...prev, standard }));
  }
}, [standard, ...]);

// ... more context syncs ...

// Nested API call - THIS OVERWRITES EVERYTHING!
useEffect(() => {
  OuterService.getData().subscribe(() => {
    InnerService.getData().subscribe(() => {
      // By now, prev is STALE - doesn't have context values!
      setValues((prev) => ({
        ...prev,  // prev.configId is "" !
        unitIds: newUnitIds,
      }));
    });
  });
}, [...]);

// ✅ FIX: Use setFieldValue instead
setFieldValue('unitIds', newUnitIds);`}
        </pre>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", background: "#e0e0e0", borderRadius: "4px" }}>
        <strong>Raw Formik values:</strong>
        <pre style={{ fontSize: "0.85em" }}>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
