import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
const api = import.meta.env.VITE_API_URL;


export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, title: "", text: "" });

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      if (!user?.access_token) return;
      try {
        const res = await fetch(`${api}/history`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });

        if (!res.ok) {
          setLoading(false);
          const err = await res.json();
          setError(err.error || "Failed to fetch history");
          return;
        }

        const data = await res.json();
        setLoading(false);
        setHistory(data);
      } catch (err) {
        setError("Network error");
      }
    }
    fetchHistory();
  }, [user]);

  // Format created_at ISO to human-friendly string
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Open modal with transcription data
  const openEditModal = (transcription) => {
    setEditData({ id: transcription.id, title: transcription.title || "", text: transcription.text });
    setIsModalOpen(true);
  };

  // Close modal and clear state
  const closeModal = () => {
    setIsModalOpen(false);
    setEditData({ id: null, title: "", text: "" });
    setError("");
  };

  // Handle input changes in modal
  const handleChange = (e) => {
    const { id, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [id === "transcription-title" ? "title" : "text"]: value,
    }));
  };

  // Save changes via PUT request & update local state
  const saveChanges = async () => {
    try {
      const res = await fetch(`${api}/history/${editData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({ title: editData.title, text: editData.text }),
      });
      if (!res.ok) throw new Error("Failed to save changes");

      setHistory((prev) =>
        prev.map((item) =>
          item.id === editData.id ? { ...item, title: editData.title, text: editData.text } : item
        )
      );
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete transcription via DELETE request & update state
  const deleteTranscription = async ({id}) => {
    console.log("Deleting transcription with id:", id , editData.id);
    let transcriptionId = id || editData.id;
    // if (!window.confirm("Are you sure you want to delete this transcription?")) return;
    try {
      const res = await fetch(`${api}/history/${transcriptionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete transcription");

      setHistory((prev) => prev.filter((item) => item.id !== editData.id));
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  return (

    <main className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 font-serif">Transcription History</h2>

        <div className="flex items-center space-x-4">
          <Link to={'/'} className="flex items-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
            <span className="material-icons mr-2">mic</span> New Transcription
          </Link>
         
        </div>
      </div>

      {error && <p className="mb-6 text-red-600">{error}</p>}
       {/*  loading animation */}
        {loading &&  <div className="flex p-2 justify-center items-center space-x-2">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-8">


        {!loading&&!history?.length && <p className="text-gray-600">No transcriptions found.</p>}
        {history?.map(({ id, title, text, created_at }) => (
          <div
          onClick={() => openEditModal({ id, title, text })}
            key={id}
            className="bg-white rounded-xl  cursor-pointer shadow-md overflow-hidden p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800 font-serif truncate">
                {title || text.slice(0, 30) + "..."}
              </h3>
              <div className="relative group">
                <button className="text-gray-500   pl-4 hover:text-gray-800" aria-label="More options">
                  <span className="material-icons">more_vert</span>
                </button>
                <div className="absolute right-0  w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openEditModal({ id, title, text });
                    }}
                    className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <span className="material-icons text-sm mr-2">edit</span>
                    Edit Transcription
                  </a>
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      openEditModal({ id, title, text });
                      // Optionally, you can handle delete here directly or prefer modal delete only.
                    }}
                    className=" px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <span className="material-icons text-sm mr-2">delete</span>Delete
                  </a>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">{formatDate(created_at)}</p>
            <p className="text-gray-600 text-sm line-clamp-3 mb-6">{text}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                  <span className="material-icons">play_arrow</span>
                  <span className="ml-1 text-sm font-semibold">Play</span>
                </button>
                <span className="text-gray-400 text-sm">--:--</span>
              </div>
              <button className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                <span className="material-icons text-lg">download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Transcription</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={closeModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            {error && <p className="mb-4 text-red-600">{error}</p>}
            <div className="mb-6">
              <label htmlFor="transcription-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                id="transcription-title"
                type="text"
                value={editData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="transcription-content" className="block text-sm font-medium text-gray-700 mb-2">
                Transcription
              </label>
              <textarea
                id="transcription-content"
                rows={10}
                value={editData.text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm leading-relaxed text-gray-600"
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                className="text-red-600 hover:text-red-800 font-semibold flex items-center"
                onClick={deleteTranscription}
              >
                <span className="material-icons mr-1">delete</span>Delete
              </button>
              <div className="flex space-x-4">
                <button
                  className="bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-200"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700"
                  onClick={saveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
