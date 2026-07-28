import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function UploadMaterial() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleFile(f) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name?.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setError("");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF lesson to upload.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      const res = await api.post("/modules/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      const moduleId = res.data.module.id;
      const sessionRes = await api.post("/sessions", { moduleId });
      navigate(`/parent/session/${sessionRes.data.session.id}/code`);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="center-col" style={{ marginBottom: 10 }}>
        <h1>Upload material</h1>
        <p className="helper-text">
          Upload a PDF lesson and our AI will turn it into 3 short stories with 5 questions each,
          matched to your child&apos;s learning level.
        </p>
        <p className="helper-text">
          Prototype modules: <strong>MATH3_Mod1.pdf</strong> (addition) or{" "}
          <strong>MATH3_Mod2.pdf</strong> (division). Sample files live in{" "}
          <code>backend/sample-modules/</code>.
        </p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Lesson title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Addition of 2-digit numbers"
          />
        </div>

        <div
          className={`dropzone ${dragActive ? "dropzone--active" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <div style={{ fontSize: "2rem" }}>📄</div>
          {file ? <p>{file.name}</p> : <p>Click or drag a PDF here to upload</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {error && (
          <p className="error-text" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}

        <button className="btn btn--block" style={{ marginTop: 20 }} type="submit" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" /> Generating stories with AI…
            </>
          ) : (
            "Generate stories & get code"
          )}
        </button>
      </form>
    </div>
  );
}
