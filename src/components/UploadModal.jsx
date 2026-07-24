import { useEffect, useMemo, useState } from "react";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function UploadModal({
  isOpen,
  onClose,
  apiUrl,
  token,
  onUploadComplete,
  onUploadStateChange,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [duration, setDuration] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("Choose an audio file to preview it before sending it to transcription.");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(uploading);
    }
  }, [uploading, onUploadStateChange]);

  const fileDetails = useMemo(() => {
    if (!selectedFile) return null;

    return [
      { label: "Name", value: selectedFile.name },
      { label: "Type", value: selectedFile.type || "Unknown" },
      { label: "Size", value: formatFileSize(selectedFile.size) },
      { label: "Duration", value: formatDuration(duration) },
      { label: "Last modified", value: new Date(selectedFile.lastModified).toLocaleString() },
    ];
  }, [selectedFile, duration]);

  const resetState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setDuration(null);
    setUploadProgress(0);
    setUploading(false);
    setStatusText("Choose an audio file to preview it before sending it to transcription.");
    setError("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setError("");
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setStatusText("Preview ready. You can listen before sending it to transcription.");

    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = localUrl;
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Please choose an audio file first.");
      return;
    }

    if (!token) {
      setError("Please log in before uploading audio.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");
    setStatusText("Uploading your file…");

    const formData = new FormData();
    formData.append("audio", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiUrl}/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentage);
        setStatusText(percentage < 100 ? `Uploading your file… ${percentage}%` : "Finalizing transcription…");
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText);
          onUploadComplete(payload.transcript || "No transcript received.");
          setUploadProgress(100);
          setStatusText("Transcription complete. Your text is ready.");
          setTimeout(() => handleClose(), 600);
        } catch {
          setError("The server returned an unexpected response.");
          setUploading(false);
        }
      } else {
        try {
          const payload = JSON.parse(xhr.responseText);
          setError(payload.error || "Upload failed.");
        } catch {
          setError("Upload failed. Please try again.");
        }
        setUploading(false);
      }
    };

    xhr.onerror = () => {
      setError("Network error while sending the audio file.");
      setUploading(false);
    };

    xhr.send(formData);
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 md:p-6">
    <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8">
      
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 sm:text-sm sm:tracking-[0.3em]">
            Upload audio
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 sm:mt-2 sm:text-2xl">
            Prepare a file, preview it, and send it to transcription
          </h3>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close upload modal"
        >
          <span className="material-icons border-slate-200 block rounded-full border p-2 text-xl sm:text-2xl">
            close
          </span>
        </button>
      </div>

      {/* Main Grid Body */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Input & Preview */}
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-indigo-500 hover:bg-indigo-50 sm:px-6 sm:py-10">
            <span className="material-icons text-3xl text-indigo-600 sm:text-4xl">
              cloud_upload
            </span>
            <span className="mt-2 text-base font-semibold text-slate-900 sm:mt-3 sm:text-lg">
              Choose audio file
            </span>
            <span className="mt-1 text-xs text-slate-500 sm:mt-2 sm:text-sm">
              MP3, WAV, WEBM, OGG, M4A, AAC and FLAC supported
            </span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileSelection}
            />
          </label>

          {selectedFile ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 sm:text-base">Preview</h4>
                  <p className="text-xs text-slate-500 sm:text-sm">Listen before transcribing</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 sm:px-3 sm:py-1">
                  Ready
                </span>
              </div>
              {previewUrl ? (
                <audio controls src={previewUrl} className="w-full h-10 sm:h-12" />
              ) : (
                <p className="text-xs text-slate-500 sm:text-sm">
                  The preview will appear here once the file is selected.
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Right Column: File Details & Progress */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div>
            <h4 className="text-base font-semibold text-slate-900 sm:text-lg">File details</h4>
            <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm">
              Key metadata appears here prior to transcription.
            </p>

            {fileDetails ? (
              <div className="mt-3 max-h-[160px] space-y-2 overflow-y-auto pr-1 sm:mt-4 sm:space-y-3">
                {fileDetails.map((detail) => (
                  <div key={detail.label} className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:text-xs">
                      {detail.label}
                    </p>
                    <p className="mt-0.5 break-words text-xs font-medium text-slate-700 sm:mt-1 sm:text-sm">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-xs text-slate-500 sm:mt-4 sm:px-4 sm:py-8 sm:text-sm">
                Select a file to see metadata & duration.
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-600 sm:mb-2 sm:text-sm">
              <span>Status</span>
              <span className="font-medium">{uploading ? `${uploadProgress}%` : "Idle"}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 sm:h-2.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-600 sm:mt-3 sm:text-sm">{statusText}</p>
            {error ? <p className="mt-2 text-xs font-medium text-red-600 sm:mt-3 sm:text-sm">{error}</p> : null}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-5 flex flex-col-reverse gap-2.5 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={handleClose}
          className="w-full rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full rounded-full bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 sm:w-auto"
        >
          {uploading ? "Uploading…" : "Send to transcript"}
        </button>
      </div>

    </div>
  </div>
);
}
