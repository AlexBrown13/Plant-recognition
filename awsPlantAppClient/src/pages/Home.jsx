import { useState, useEffect } from "react";
import { api, auth } from "../utils/api";
import "./Home.css";

function Home() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plantInfo, setPlantInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cleanup image preview URL on unmount or when image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      // Cleanup previous preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPlantInfo(null);
      setError(null);
      setSaveSuccess(false);
    } else {
      setError("Please select a valid image file");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
  };

  const handleIdentify = async () => {
  const [imageBase64, setImageBase64] = useState(null);
    if (!image) {
    setError("Please select an image first");
    return;
  }

  setIsLoading(true);
  setError(null);
  setSaveSuccess(false);

  try {
    const { plant, imageBase64 } = await api.identifyPlant(image);
    setPlantInfo(plant);
    setImageBase64(imageBase64); // 👈 needed for /save
  } catch (err) {
    setError(err.message || "Failed to identify plant. Please try again.");
    setPlantInfo(null);
  } finally {
    setIsLoading(false);
  }
};
  const handleSavePlant = async () => {
    if (!auth.isAuthenticated()) {
      setError("Please login to save plants");
      return;
    }

    if (!plantInfo) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.savePlant(plantInfo);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save plant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Identify Your Plant</h1>
        <p className="home-subtitle">
          Upload or drop an image to discover what plant you have
        </p>

        {/* Image Upload Area */}
        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button
                className="btn-remove-image"
                onClick={() => {
                  if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                  }
                  setImage(null);
                  setImagePreview(null);
                  setPlantInfo(null);
                  setError(null);
                }}
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📷</div>
              <p>Drag and drop your plant image here</p>
              <p className="upload-or">or</p>
              <label htmlFor="file-input" className="btn-upload">
                Choose File
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="file-input"
              />
            </div>
          )}
        </div>

        {/* Identify Button */}
        {image && !plantInfo && (
          <button
            className="btn-identify"
            onClick={handleIdentify}
            disabled={isLoading}
          >
            {isLoading ? "Identifying..." : "Identify Plant"}
          </button>
        )}

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Plant Information */}
        {plantInfo && (
          <div className="plant-info-card">
            <h2 className="plant-name">{plantInfo.name || "Plant Name"}</h2>

            {plantInfo.watering && (
              <div className="info-section">
                <h3>💧 Watering Instructions</h3>
                <p>{plantInfo.watering}</p>
              </div>
            )}

            {plantInfo.disease && (
              <div className="info-section">
                <h3>🦠 Disease Information</h3>
                <p>{plantInfo.disease}</p>
              </div>
            )}

            {plantInfo.care && (
              <div className="info-section">
                <h3>🌿 Care Instructions</h3>
                <p>{plantInfo.care}</p>
              </div>
            )}

            {auth.isAuthenticated() ? (
              <button
                className="btn-save"
                onClick={handleSavePlant}
                disabled={isSaving || saveSuccess}
              >
                {isSaving
                  ? "Saving..."
                  : saveSuccess
                  ? "✓ Saved!"
                  : "Save to My Plants"}
              </button>
            ) : (
              <p className="login-prompt">
                <a href="/login">Login</a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
