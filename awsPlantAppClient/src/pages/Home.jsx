import { useEffect, useMemo, useState } from "react";
import { identifyPlant, savePlant } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

// helper: checks if user is logged in (token in localStorage)
const hasToken = () => !!localStorage.getItem("google_id_token");

export default function Home() {
  const navigate = useNavigate();

    // ===== file + preview state =====
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

    // ===== loading flags =====
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

    // ===== results =====
  const [plant, setPlant] = useState(null); // {scientificName, commonName, perenualId, watering, sunlight}
  const [imageBase64, setImageBase64] = useState(null);

    // ===== UI feedback =====
  const [error, setError] = useState(null);
  const [saveOk, setSaveOk] = useState(false);

  // (this reads localStorage directly on every render)
  const loggedIn = hasToken();

   // cleanup: when previewUrl changes or component unmounts,
  // revoke the old object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

    // clears previous results when user picks a new image or removes it
  function resetResult() {
    setPlant(null);
    setImageBase64(null);
    setSaveOk(false);
    setError(null);
  }

   // called when user chooses a file OR drops a file
  function handlePickFile(file) {
    if (!file || !file.type?.startsWith("image/")) {
      setError("pick an image file");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    resetResult();
  }

    // calls backend to identify plant
  async function handleIdentify() {
    if (!imageFile) {
      setError("select an image first");
      return;
    }

    setIsIdentifying(true);
    setError(null);
    setSaveOk(false);

    try {
      const res = await identifyPlant(imageFile);
      setPlant(res.plant);
      setImageBase64(res.imageBase64);
    } catch (e) {
      setError(e?.message || "identify failed");
      setPlant(null);
      setImageBase64(null);
    } finally {
      setIsIdentifying(false);
    }
  }

  // saves identified plant + image to backend (S3 etc.)
  async function handleSave() {
    if (!plant || !imageBase64) {
      setError("identify first");
      return;
    }

      // protect save: must be logged in
    if (!hasToken()) {
      // new: redirect to login, then back home
      localStorage.setItem("post_login_redirect", "/");
      navigate("/login");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await savePlant(plant, imageBase64);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2000);
    } catch (e) {
      setError(e?.message || "save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Identify Your Plant</h1>

        <div
          className="upload-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handlePickFile(e.dataTransfer.files?.[0]);
          }}
        >
          {previewUrl ? (
            <div className="image-preview-container">
              <img src={previewUrl} alt="preview" className="image-preview" />
              <button
                className="btn-remove-image"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setImageFile(null);
                  setPreviewUrl(null);
                  resetResult();
                }}
              >
                remove
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📷</div>
              <p>drag & drop an image</p>
              <p className="upload-or">or</p>
              <label htmlFor="file-input" className="btn-upload">
                choose file
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="file-input"
                onChange={(e) => handlePickFile(e.target.files?.[0])}
              />
            </div>
          )}
        </div>

        {imageFile && !plant && (
          <button
            className="btn-identify"
            onClick={handleIdentify}
            disabled={isIdentifying}
          >
            {isIdentifying ? "identifying..." : "identify"}
          </button>
        )}

        {error && <div className="error-message">{error}</div>}

        {plant && (
          <div className="plant-info-card">
            <h2 className="plant-name">
              {plant.commonName || plant.scientificName || "unknown"}
            </h2>

            {plant.scientificName && (
              <div className="info-section">
                <h3>🔬 scientific name</h3>
                <p>{plant.scientificName}</p>
              </div>
            )}

            {plant.watering && (
              <div className="info-section">
                <h3>💧 watering</h3>
                <p>{plant.watering}</p>
              </div>
            )}

            {Array.isArray(plant.sunlight) && plant.sunlight.length > 0 && (
              <div className="info-section">
                <h3>☀️ sunlight</h3>
                <p>{plant.sunlight.join(", ")}</p>
              </div>
            )}

            {loggedIn ? (
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={isSaving || saveOk}
              >
                {isSaving ? "saving..." : saveOk ? "✓ saved" : "save"}
              </button>
            ) : (
              <p className="login-prompt">
                login first to save (
                <Link
                  to="/login"
                  onClick={() => localStorage.setItem("post_login_redirect", "/")}
                >
                  google login
                </Link>
                )
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
