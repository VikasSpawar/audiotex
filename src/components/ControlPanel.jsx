import StreamingButton from "./StreamingButton";

function ControlPanel({
  isRecording,
  startRecording,
  stopRecording,
  uploading,
  uploadError,
  handleUploadInput,
  status,
}) {
  return (
    <section className="max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row gap-4 items-center">
      <StreamingButton
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        status={status}
      />
 
     <label
        htmlFor="upload-audio"
        className={`  flex items-center justify-center gap-2 w-full sm:w-auto bg-transparent border border-border text-secondary px-8 py-4 rounded-full cursor-pointer hover:bg-border hover:text-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-base font-medium `}
        aria-label="Upload Audio"
      >
           {uploading && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin"></div>
          <span >Transcriptin...</span>
        </div>
      )}
   
    
        {status=='Upload complete'&& !uploadError && (
          <div className="flex items-center gap-2">
            <i className="material-icons text-green-500">check_circle</i>
              <span>Transcription complete...</span>
          </div>
        )}

     
    
        {status!="Uploading audio file..."&&status!="Upload complete"&&
        <>
        <i className="material-icons">upload_file</i> 
        <span className="truncate">Upload Audio</span>
        </>
        }
     
        <input
        
          id="upload-audio"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleUploadInput}
          disabled={isRecording || uploading}
          aria-disabled={isRecording || uploading}
        />  
       
   

      </label>
   
 


      {uploadError && (
        <p className="text-red-500 mt-2 text-center sm:text-left">{uploadError}</p>
      )}
    
    </section>
  );
}

export default ControlPanel;