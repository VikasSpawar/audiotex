import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ControlPanel from "./ControlPanel";
import TranscriptPanel from "./TranscriptPanel";
import UploadModal from "./UploadModal";
const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const requestWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const AudioScribe = () => {
  const [words, setWords] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const textareaRef = useRef(null);
  const fileReaderRef = useRef(null);
  const uploadSocketRef = useRef(null);

  const { user } = useAuth();

  const cleanupSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (wsRef.current) {
      const socket = wsRef.current;
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.send(JSON.stringify({ type: "sendSessionTermination" }));
      }
      socket.close();
      wsRef.current = null;
    }

    if (uploadSocketRef.current) {
      uploadSocketRef.current.close();
      uploadSocketRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupSession();
  }, []);

  // Effects
  useEffect(() => {
    if (
      !textareaRef.current ||
      textareaRef.current !== document.activeElement
    ) {
      setTranscript(words.map((w) => w.text).join(" "));
    }
  }, [words]);

  useEffect(() => {
    // if (transcriptContainerRef.current) {
    //   transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    // }
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [transcript]);



  // Helper: Stream audio file chunks over WebSocket for upload (existing logic)
  const streamAudioFile = (file) => {
    if (!user?.access_token) {
      setUploadError("Please log in to upload audio.");
      setStatus("Authentication required");
      return;
    }

    if (
      uploadSocketRef.current &&
      uploadSocketRef.current.readyState === WebSocket.OPEN
    ) {
      uploadSocketRef.current.close();
    }

    const socket = new WebSocket(
      `${api.replace(/^http/, "ws")}/transcription/stream?token=${encodeURIComponent(user.access_token)}`
    );
    uploadSocketRef.current = socket;

    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
      setIsRecording(true);
      setStatus("Uploading audio file...");
      const chunkSize = 32000; // bytes per chunk ~2 secs of 16kHz 16bit mono PCM
      let offset = 0;

      fileReaderRef.current = new FileReader();

      fileReaderRef.current.onload = (e) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send(e.target.result);
        offset += chunkSize;
        if (offset < file.size) {
          readSlice(offset);
        } else {
          // signal end of stream after last chunk
          socket.send(JSON.stringify({ type: "sendSessionTermination" }));
        }
      };

      function readSlice(o) {
        const slice = file.slice(o, o + chunkSize);
        fileReaderRef.current.readAsArrayBuffer(slice);
      }

      readSlice(0);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.message?.type === "Turn" &&
          Array.isArray(data.message.words)
        ) {
          setWords((prev) => {
            const existingStarts = new Set(prev.map((w) => w.start));
            const filtered = data.message.words.filter(
              (w) => !existingStarts.has(w.start)
            );
            return [...prev, ...filtered];
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    socket.onclose = () => {
      setStatus("Upload complete");
      setIsRecording(false);
      uploadSocketRef.current = null;
    };

    socket.onerror = () => {
      setStatus("Upload error");
      setIsRecording(false);
      uploadSocketRef.current = null;
    };
  };

  const startRecording = async () => {
    if (isRecording || wsRef.current) {
      return;
    }

    if (!user?.access_token) {
      setStatus("Authentication required");
      setUploadError("Please log in to start streaming.");
      return;
    }

    setWords([]);
    setTranscript("");
    setStatus("Connecting...");
    const socket = new WebSocket(
      `${api.replace(/^http/, "ws")}/transcription/stream?token=${encodeURIComponent(user.access_token)}`
    );

    socket.onopen = async () => {
      try {
        setIsRecording(true);
        setStatus("Streaming audio...");
        const context = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = context;
        const userStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = userStream;
        const source = context.createMediaStreamSource(userStream);

        await context.audioWorklet.addModule("/processor.js");
        const workletNode = new AudioWorkletNode(context, "pcm-processor");
        let pcmBuffer = [];
        const MIN_CHUNK_SAMPLES = 800;

        workletNode.port.onmessage = (event) => {
          const newSamples = new Int16Array(event.data);
          pcmBuffer.push(...newSamples);

          while (pcmBuffer.length >= MIN_CHUNK_SAMPLES) {
            const chunk = pcmBuffer.slice(0, MIN_CHUNK_SAMPLES);
            pcmBuffer = pcmBuffer.slice(MIN_CHUNK_SAMPLES);

            if (socket.readyState === WebSocket.OPEN) {
              socket.send(Int16Array.from(chunk).buffer);
            }
          }
        };
        source.connect(workletNode);
        workletNode.connect(context.destination);
      } catch (error) {
        console.error("Could not start recording", error);
        setStatus("Recording setup failed");
        setIsRecording(false);
        socket.close();
        cleanupSession();
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.message?.type === "Turn") {
          const { words } = data.message;

          setWords((prev) => {
            const finalWords = words.filter((w) => w.word_is_final);
            const seen = new Set(prev.map((w) => w.start + "-" + w.text));
            const fresh = finalWords.filter(
              (w) => !seen.has(w.start + "-" + w.text)
            );

            return [...prev, ...fresh];
          });
        }
      } catch (err) {
        console.error("WebSocket parse error:", err, event.data);
      }
    };

    socket.onclose = () => {
      if (wsRef.current === socket) {
        wsRef.current = null;
      }
      setStatus("Disconnected");
      setIsRecording(false);
    };

    socket.onerror = () => {
      if (wsRef.current === socket) {
        wsRef.current = null;
      }
      setStatus("WebSocket error");
      setIsRecording(false);
    };

    wsRef.current = socket;
  };

  const stopRecording = () => {
    cleanupSession();
    setIsRecording(false);
    setStatus("Stopped");
  };

  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(transcript.trim());
      }
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transcription.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // save transcription
  const saveTranscription = async () => {
    if (!user?.access_token) {
      alert("Please log in to save transcriptions.");
      return;
    }
    try {
      const res = await requestWithTimeout(`${api}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          text: transcript,
          title: transcript.split(" ").slice(0, 5).join(" ") + "...",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to save transcription.");
        return;
      }
      // alert("Transcription saved successfully.");
    } catch (err) {
      alert("Network error while saving transcription.");
    }
  };

  //clear transcription
  const clearTranscription = () => {
    setWords([]);
    setTranscript("");
  };

  const handleUploadComplete = (transcriptText) => {
    setTranscript(transcriptText || "No transcript received.");
    setStatus("Upload complete");
    setUploadError("");
    setUploading(false);
    setTimeout(() => setStatus("Idle"), 2000);
  };

  const openUploadModal = () => {
    if (!user?.access_token) {
      setUploadError("Please log in to upload audio.");
      return;
    }
    setUploadError("");
    setIsUploadModalOpen(true);
  };

  return (
    <div className="relative  flex min-h-screen flex-col bg-background group/design-root">
      {/* <Header /> */}
      <main className="layout-container flex h-full  grow flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-104px)]">
          <div className="flex flex-col justify-center p-6 sm:p-12 lg:p-16">
            <div className="max-w-xl mx-auto lg:mx-0">
              <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                Transform Your Voice into Text.
              </h1>
              <p className="text-secondary text-lg md:text-xl leading-relaxed mb-10 font-light">
                Effortlessly transcribe audio with our advanced Speech-to-Text
                API. Get accurate, real-time transcriptions for meetings,
                interviews, and more.
              </p>
              <div className=" sm:flex lg:block justify-center">
                <ControlPanel
                  uploading={uploading}
                  uploadError={uploadError}
                  isRecording={isRecording}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  status={status}
                  onOpenUploadModal={openUploadModal}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-rose-100 opacity-50 transform -skew-y-6" />
            <div className="relative w-full max-w-lg z-10">
              <TranscriptPanel
                status={status}
                transcript={transcript}
                saveTranscription={saveTranscription}
                textareaRef={textareaRef}
                handleTranscriptChange={handleTranscriptChange}
                copyToClipboard={copyToClipboard}
                downloadTranscript={downloadTranscript}
                clearTranscription={clearTranscription}
              />
            </div>
          </div>
        </div>
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        apiUrl={api}
        token={user?.access_token}
        onUploadComplete={handleUploadComplete}
        onUploadStateChange={setUploading}
      />
    </div>
  );
};

export default AudioScribe;
