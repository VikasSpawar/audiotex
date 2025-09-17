import { useState, useEffect } from "react";

export default function TranscriptEditorModal({
  isOpen,
  onClose,
  transcriptData, // { id, title, text }
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (isOpen && transcriptData) {
      setTitle(transcriptData.title || "");
      setText(transcriptData.text || "");
    }
  }, [isOpen, transcriptData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave && onSave({ ...transcriptData, title, text });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this transcription?")) {
      onDelete && onDelete(transcriptData);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-modal-title"
    >
      <div className="bg-white rounded-xl p-6 max-w-lg w-full relative shadow-lg">
        <h2 id="editor-modal-title" className="text-2xl font-bold mb-4 text-primary">
          Edit Transcription
        </h2>
        <label className="block mb-2 font-medium text-gray-700">Title</label>
        <input
          type="text"
          className="w-full rounded border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
        />
        <label className="block mb-2 font-medium text-gray-700">Transcription Text</label>
        <textarea
          className="w-full h-40 rounded border border-gray-300 px-3 py-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={true}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
