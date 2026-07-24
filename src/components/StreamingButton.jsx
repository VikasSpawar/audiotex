// StreamingButton.jsx
import React from "react";
import MicOnAnimation from "./MicOnAnimation";

const StreamingButton = ({ isRecording, startRecording , stopRecording , status}) => {
  return (
    <div className=" relative group flex items-center justify-center">
      {/* Button */}
      <button
        onClick={isRecording ? stopRecording:startRecording}
        className={`cursor-pointer relative flex items-center justify-center gap-3 px-8 py-4 rounded-full text-white text-base font-medium shadow-lg
          transition-all duration-500 ease-in-out focus:outline-none focus:ring-2
          ${isRecording 
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 w-48 sm:w-56" 
            : "bg-primary hover:opacity-90 focus:ring-primary w-44 sm:w-52"
          }`}
        aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        type="button"
      >
        {/* Idle State */}
        <span
          className={`flex items-center justify-center transition-all duration-300 ease-in-out
            ${isRecording ? "opacity-0 scale-90 absolute" : "opacity-100 scale-100 relative"}`}
        >
          <i className="material-icons">mic</i>
          <span className="ml-2 hidden sm:inline"> {status=='Connecting...'?'Connecting...' : 'Start Recording'} </span>
        </span>

        {/* Recording State */}
        <span
          className={`flex items-center justify-center transition-all duration-300 ease-in-out
            ${isRecording ? "opacity-100 scale-100 relative" : "opacity-0 scale-90 absolute"}`}
        >
          <MicOnAnimation />
          <span className="ml-2 hidden sm:inline">Recording...</span>
        </span>
      </button>

      {/* Tooltip */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap"
      >
        {isRecording ? "Click to stop recording" : "Click to start recording"}
      </div>
    </div>
  );
};

export default StreamingButton;
