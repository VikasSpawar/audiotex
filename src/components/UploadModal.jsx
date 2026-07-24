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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="w-full max-w-3xl  rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Upload audio</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Prepare a file, preview it, and send it to transcription</h3>
          </div>
          
          <button
            type="button"
            onClick={handleClose}
            className=" text-slate-500  ring-2  hover:ring-indigo-600 ring-slate-100 rounded-full transition"
            aria-label="Close upload modal"
          >
            <span className="material-icons transition  hover:bg-slate-100 hover:text-slate-700 border-slate-200 rounded-full p-2 border">close</span>
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-500 hover:bg-indigo-50">
              <span className="material-icons text-4xl text-indigo-600">cloud_upload</span>
              <span className="mt-3 text-lg font-semibold text-slate-900">Choose audio file</span>
              <span className="mt-2 text-sm text-slate-500">MP3, WAV, WEBM, OGG, M4A, AAC and FLAC are supported</span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelection} />
            </label>

            {selectedFile ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Preview</h4>
                    <p className="text-sm text-slate-500">Listen before you send it to transcription</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Ready</span>
                </div>
                {previewUrl ? (
                  <audio controls src={previewUrl} className="w-full" />
                ) : (
                  <p className="text-sm text-slate-500">The preview will appear here once the file is selected.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-lg font-semibold text-slate-900">File details</h4>
            <p className="mt-1 text-sm text-slate-500">You’ll see the key information here before transcription starts.</p>

            {fileDetails ? (
              <div className="mt-4 h-[120px] overflow-y-scroll scroll-border-amber-500  space-y-3">
                {fileDetails.map((detail) => (
                  <div key={detail.label} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{detail.label}</p>
                    <p className="mt-1 break-words text-sm text-slate-700">{detail.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Select a file to see its metadata and duration here.
              </div>
            )}

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                <span>Status</span>
                <span>{uploading ? `${uploadProgress}%` : "Idle"}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-600">{statusText}</p>
              {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {uploading ? "Uploading…" : "Send to transcript"}
          </button>
        </div>
      </div>
    </div>
  );
}
