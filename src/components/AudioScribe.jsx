import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ControlPanel from "./ControlPanel";
import TranscriptPanel from "./TranscriptPanel";
const api = import.meta.env.VITE_API_URL;
export function Header() {
  return (
    <header className="z-20 border flex sticky top-0 items-center justify-between whitespace-nowrap px-6 sm:px-10 py-6 md:py-8  ">
      <div className="flex items-center border gap-3">
        <div className="size-8 text-primary">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 7.5v-1.5a6 6 0 00-6-6m-6 1.5v-1.5a6 6 0 016-6v1.5m-6 7.5h12a6 6 0 00-6-6v-1.5a6 6 0 00-6 6v1.5m6 7.5v-1.5a6 6 0 00-6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-primary text-2xl font-bold tracking-wider">
          AudioTex
        </h2>
      </div>

      <nav className="shadow-md hidden md:flex items-center gap-10 text-sm font-medium  rounded-full px-3 py-2 bg-white">
        <a href="#" className="text-secondary hover:text-primary transition">
          Features
        </a>
        <a href="#" className="text-secondary hover:text-primary transition">
          Pricing
        </a>
        <a href="#" className="text-secondary hover:text-primary transition">
          Support
        </a>
        <button className="bg-primary text-white h-10 rounded-full px-6 font-semibold hover:opacity-90 shadow-md transition-opacity duration-200">
          Get Started
        </button>
      </nav>

      <button
        className="md:hidden text-secondary hover:text-primary"
        aria-label="Open menu"
      >
        <i className="material-icons">menu</i>
      </button>
    </header>
  );
}

const AudioScribe = () => {
  const [words, setWords] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const textareaRef = useRef(null);
  const fileReaderRef = useRef(null);
  const uploadSocketRef = useRef(null);

  const { user } = useAuth();

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

  // Methods (streamAudioFile, startRecording, stopRecording, handleTranscriptChange, copyToClipboard, downloadTranscript, handleUploadInput)
  // ... use your existing method implementations here ...

  // For brevity, only your return JSX and segregation are shown

  // Helper: Stream audio file chunks over WebSocket for upload (existing logic)
  const streamAudioFile = (file) => {
    if (
      uploadSocketRef.current &&
      uploadSocketRef.current.readyState === WebSocket.OPEN
    ) {
      uploadSocketRef.current.close();
    }

    const socket = new WebSocket(
      "ws://localhost:5000/api/transcription/stream"
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
    setWords([]);
    setTranscript("");
    setStatus("Connecting...");
    const socket = new WebSocket(
      "ws://localhost:5000/api/transcription/stream"
    );

    socket.onopen = async () => {
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
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.message?.type === "Turn") {
          const { words, transcript } = data.message;

          setWords((prev) => {
            // Only keep words that are marked as final
            const finalWords = words.filter((w) => w.word_is_final);

            // Prevent duplicates (combine start+text as unique key)
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
      setStatus("Disconnected");
      setIsRecording(false);
    };

    socket.onerror = () => {
      setStatus("WebSocket error");
      setIsRecording(false);
    };

    wsRef.current = socket;
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "sendSessionTermination" }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsRecording(false);
    setStatus("Stopped");
  };

  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript.trim());
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
      const res = await fetch(`${api}/history`, {
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

  // --- NEW: Handle file upload to backend ---
  const handleUploadInput = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.access_token) {
      setUploadError("Please select a file and login.");
      return;
    }
    setTranscript("");
    setUploadError("");
    setUploading(true);
    setStatus("Uploading audio file...");

    const formData = new FormData();
    formData.append("audio", file);

    // console.log(user)

    try {
      const res = await fetch(`${api}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access_token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setUploadError(err.error || "Upload failed");
        setStatus("Upload error");
        setUploading(false);
        return;
      }
      const data = await res.json();
      setTranscript(data.transcript || "No transcript received.");
      setStatus("Upload complete");

      // reset file input afer 2 seconds
      setTimeout(() => {
        // console.log("resetting file input")
        e.target.value = null;
        setStatus("Idle");
      }, 2000);
    } catch (err) {
      setUploadError("Network error");
      setStatus("Upload error");
    }
    setUploading(false);
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
                  handleUploadInput={handleUploadInput}
                  status={status}
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
    </div>
  );
};

export default AudioScribe;
