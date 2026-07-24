import { useState } from "react";

function TranscriptPanel({
  status,
  transcript,
  textareaRef,
  handleTranscriptChange,
  copyToClipboard,
  downloadTranscript,
  saveTranscription,
  clearTranscription
}) {
  const [copied, setCopied] = useState(false);
 const [saved, setSaved] = useState(false);
  const handleBottomCopyClick = () => {
    copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 1000); // Hide after 1 second
  };
// handle save transcription and animation on saved
 
  const handleSaveTranscription = async() => {
    transcript.length===0&&alert("Transcript is empty!")
   await saveTranscription();
    setSaved(true);
    setTimeout(() => setSaved(false), 1000); // Hide after 1 second
  }


  return (
    <section className="relative w-full max-w-lg z-10">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-border text-left">
        <h2 className="text-3xl font-bold text-primary mb-6">Real-Time Transcription</h2>
        <div
          className="bg-gray-50 border-border rounded-lg p-4 h-80 overflow-y-auto border text-secondary mb-6 font-light leading-relaxed relative"
          aria-live="polite"
          role="log"
          tabIndex={-1}
        >
          <div className="h-full">
            <textarea
              ref={textareaRef}
              value={transcript}
              onChange={handleTranscriptChange}
              // placeholder="Your transcription will appear here as you speak or after uploading your audio file."
              className="w-full h-full resize-none bg-transparent border-none outline-none font-sans text-gray-600"
              spellCheck={true}
              rows={15}
              aria-label="Editable live transcription"
            />

           {
            status=="Uploading audio file..."&&<p className=" font-bold absolute top-4">Transcripting...</p>

           }
           {
            status=="Streaming audio..."&&!transcript&&<p className=" font-bold absolute top-4">Listening...</p>
           }
           { (status=="Idle"||status=="Disconnected")&&!transcript&&<p className="absolute top-4">Your transcription will appear here as you speak or after uploading your audio file...</p>}
          
          </div>
        </div>
        <div className=" flex justify-around flex-wrap gap-4  items-center relative">
          
         
          <div className="relative flex items-center">
                   <button
                   disabled={transcript.length===0}
            onClick={handleSaveTranscription}
            className="flex disabled:grayscale-80 items-center justify-center gap-2 bg-transparent text-secondary px-4 py-2 rounded-full hover:text-primary transition-all duration-200 ease-in-out hover:outline-none hover:ring-2 hover:ring-primary hover:ring-opacity-50 text-sm font-medium"
            aria-label="Save transcription"
            type="button"
          >
            <i className="material-icons text-base">save</i>
            <span className="truncate">Save</span>
          </button>
          {saved && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-xs rounded px-2 py-1 shadow transition">
                Saved!
              </span>
            )}

          </div>
            {/* clear transcription */}
            <button
            disabled={transcript.length===0}
            onClick={clearTranscription}
            className="flex disabled:grayscale-80 items-center justify-center  gap-2 bg-transparent text-secondary px-4 py-2  rounded-full hover:text-red-500 transition-all duration-200 ease-in-out hover:outline-none hover:ring-2 hover:ring-red-500 hover:ring-opacity-50 text-sm font-medium"
            aria-label="Clear transcription"
            type="button"
          >
            <i className="material-icons text-base">clear</i>
            <span className="truncate">Clear</span>
          </button>


          <button
            disabled={transcript.length===0}
            onClick={downloadTranscript}
            className="disabled:grayscale-80 flex items-center justify-center gap-2 bg-transparent text-secondary px-4 py-2 rounded-full hover:text-green-600 transition-all duration-200 ease-in-out hover:outline-none hover:ring-2 hover:ring-green-600 hover:ring-opacity-50 text-sm font-medium"
            aria-label="Download transcription"
            type="button"
          >
            <i className="material-icons text-base">download</i>
            {/* <span className="truncate"></span> */}
          </button>
          <div className="relative flex items-center">
            <button
              disabled={transcript.length===0}
              onClick={handleBottomCopyClick}
              className="disabled:grayscale-80 flex items-center justify-center gap-2 bg-transparent text-secondary px-4 py-2 rounded-full hover:text-secondary transition-all duration-200 ease-in-out hover:outline-none hover:ring-2 hover:ring-secondary hover:ring-opacity-50 text-sm font-medium"
              aria-label="Copy transcription"
              type="button"
            >
              <i className="material-icons text-base">content_copy</i>
              <span className="truncate">Copy</span>
            </button>
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-xs rounded px-2 py-1 shadow transition">
                Copied!
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TranscriptPanel;