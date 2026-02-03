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

/**
 * FIX: Uses setFieldValue instead of setValues
 * Each field is updated independently without relying on closure-captured state
 */
export function SetFieldValueFixForm() {
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

  const { values, setFieldValue, handleChange, handleSubmit } = useFormik<FormValues>({
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
      console.log("[Fix Effect 1] setFieldValue configId:", configVersion);
      setTimings((t) => ({ ...t, configId: Date.now() - startTime }));
      // ✅ FIX: setFieldValue instead of setValues
      setFieldValue("configId", configVersion);
    }
  }, [configVersion, values.configId, setFieldValue, startTime]);

  // useEffect #2: Sync standard from context
  useEffect(() => {
    if (standard && values.standard !== standard) {
      console.log("[Fix Effect 2] setFieldValue standard:", standard);
      setTimings((t) => ({ ...t, standard: Date.now() - startTime }));
      setFieldValue("standard", standard);
    }
  }, [standard, values.standard, setFieldValue, startTime]);

  // useEffect #3: Sync organizationId from context
  useEffect(() => {
    if (organizationId && values.organizationId !== organizationId) {
      console.log("[Fix Effect 3] setFieldValue organizationId:", organizationId);
      setTimings((t) => ({ ...t, organizationId: Date.now() - startTime }));
      setFieldValue("organizationId", organizationId);
    }
  }, [organizationId, values.organizationId, setFieldValue, startTime]);

  // useEffect #4: Sync documentName and fiscalYear from context
  useEffect(() => {
    if (documentName && values.documentName !== documentName) {
      console.log("[Fix Effect 4] setFieldValue documentName:", documentName);
      setTimings((t) => ({ ...t, documentName: Date.now() - startTime }));
      setFieldValue("documentName", documentName);
    }
    if (fiscalYear && values.fiscalYear !== fiscalYear) {
      console.log("[Fix Effect 4] setFieldValue fiscalYear:", fiscalYear);
      setFieldValue("fiscalYear", fiscalYear);
    }
  }, [documentName, fiscalYear, values.documentName, values.fiscalYear, setFieldValue, startTime]);

  // useEffect #5: Nested API call
  useEffect(() => {
    if (values.unitIds.length > 0) return;

    console.log("[Fix Effect 5] Starting nested API subscription...");

    from(fetchUserBasicInfo()).subscribe(() => {
      console.log("[Fix Effect 5] Outer API returned, starting inner...");
      setTimings((t) => ({ ...t, outerApi: Date.now() - startTime }));

      from(fetchUserPreferences()).subscribe(() => {
        console.log("[Fix Effect 5] Inner API returned, calling setFieldValue...");
        setTimings((t) => ({ ...t, innerApi: Date.now() - startTime }));

        // ✅ FIX: setFieldValue for each field independently
        setFieldValue("unitIds", [1, 2, 3]);
        setFieldValue("parentUnitId", 1);

        setApiComplete(true);
      });
    });
  }, [setFieldValue, startTime, values.unitIds.length]);

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
      <h1 style={{ color: "#2e7d32" }}>✅ FIX: setFieldValue</h1>
      <h2 style={{ color: "#666", marginTop: "-10px" }}>
        Each field updated independently
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
          {hasBug ? "Still has bugs!" : "✓ All values preserved!"}
        </h3>
        <p>
          <strong>Why this works:</strong><br />
          <code>setFieldValue</code> updates each field independently without
          relying on the closure-captured form state.
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
          setFieldValue Call Timeline
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

      <form onSubmit={handleSubmit}>
        <h2>Form Values (Formik):</h2>

        {Object.entries(values).map(([field, value]) => {
          const isBug = bugs[field as keyof typeof bugs];
          const isContextField = ["configId", "standard", "organizationId", "documentName", "fiscalYear"].includes(field);

          return (
            <div key={field} style={{ marginBottom: "8px" }}>
              <label>
                <strong style={{ color: isContextField ? "#2e7d32" : "#333" }}>{field}:</strong>{" "}
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
          background: "#e8f5e9",
          border: "2px solid #2e7d32",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ color: "#2e7d32" }}>The Fix:</h3>
        <pre style={{ background: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto", fontSize: "0.8em" }}>
{`// ✅ Instead of setValues((prev) => ({ ...prev, field }))
// Use setFieldValue for each field:

useEffect(() => {
  if (configVersion && values.configId !== configVersion) {
    setFieldValue('configId', configVersion);
  }
}, [configVersion, values.configId, setFieldValue]);

// In nested API callback:
from(fetchData()).subscribe((data) => {
  setFieldValue('unitIds', data.unitIds);
  setFieldValue('parentUnitId', data.parentUnitId);
});`}
        </pre>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", background: "#e0e0e0", borderRadius: "4px" }}>
        <strong>Raw Formik values:</strong>
        <pre style={{ fontSize: "0.85em" }}>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
