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
    <div className="upload-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Nunito:wght@700;800;900&display=swap');

        .upload-page-wrapper {
          font-family: 'Nunito', 'Poppins', sans-serif;
          background-image: url('/bg.png'); 
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          background-attachment: fixed;
          
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .upload-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 40px;
          border: 6px solid #FFFFFF;
          box-shadow: 0px 20px 0px rgba(76, 55, 169, 0.08), 0px 30px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 540px;
          padding: 40px 36px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .upload-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .upload-header h1 {
          font-size: 32px;
          font-weight: 900;
          color: #4c37a9;
          margin: 0 0 10px 0;
        }

        .upload-header p {
          font-size: 14px;
          color: #6698cc;
          font-weight: 800;
          margin: 0;
          line-height: 1.5;
        }

        .upload-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 900;
          color: #4c37a9;
          margin-left: 4px;
        }

        .form-group input {
          width: 100%;
          background: #f8f6fc;
          border: 2px solid transparent;
          border-radius: 18px;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 700;
          color: #4c37a9;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: 'Nunito', sans-serif;
        }

        .form-group input:focus {
          border-color: #8c7be8;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(140, 123, 232, 0.15);
        }

        /* --- DROPZONE STYLES --- */
        .dropzone {
          background: #f5f2fa;
          border: 2.5px dashed #a89ce2;
          border-radius: 24px;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dropzone:hover, .dropzone--active {
          background: #ede8f7;
          border-color: #7b66dc;
          transform: scale(1.01);
        }

        .dropzone-icon {
          font-size: 36px;
          line-height: 1;
        }

        .dropzone-text {
          font-size: 14px;
          font-weight: 800;
          color: #6652c0;
          margin: 0;
          text-align: center;
          word-break: break-word;
        }

        .error-text {
          color: #e04f72;
          font-size: 14px;
          font-weight: 800;
          text-align: center;
          margin: 0;
        }

        .btn-submit {
          width: 100%;
          background-color: #7b66dc;
          color: #FFFFFF;
          border: none;
          padding: 16px;
          border-radius: 25px;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0px 6px 0px #5a48b5;
          margin-top: 6px;
          font-family: 'Nunito', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #8a77ea;
          transform: translateY(-2px);
          box-shadow: 0px 8px 0px #5a48b5;
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0px 2px 0px #5a48b5;
        }

        .btn-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="upload-header">
        <h1>Upload material</h1>
        <p>
          Upload a PDF learning material and Vizma will turn it into short stories with 5
          questions each, matched to your child's learning level.
        </p>
      </div>

      <div className="upload-card">
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Lesson Title</label>
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
            <div className="dropzone-icon">📄</div>
            <p className="dropzone-text">
              {file ? file.name : "Click or drag a PDF here to upload"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn-submit" type="submit" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner" /> Generating stories…
              </>
            ) : (
              "Generate stories & get code"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}