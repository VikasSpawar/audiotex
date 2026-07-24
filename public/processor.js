class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.CHUNK_SIZE = 1600; // 100ms of 16kHz audio
  }

  // Converts float [-1, 1] to int16 [-32768, 32767]
  process(inputs) {
    const inputChannels = inputs[0];

    // Defensive: handle silence and stereo/multi-channel
    if (inputChannels && inputChannels.length > 0 && inputChannels[0]) {
      // Only use first channel for mono
      const input = inputChannels[0];

      for (let i = 0; i < input.length; i++) {
        // Clamp, then scale to int16
        let s = Math.max(-1, Math.min(1, input[i]));
        let int16 = s < 0 ? s * 0x8000 : s * 0x7FFF;
        this.buffer.push(int16);
      }

      // Send buffers in full CHUNK_SIZE packets
      while (this.buffer.length >= this.CHUNK_SIZE) {
        const slice = this.buffer.splice(0, this.CHUNK_SIZE);
        const arrayBuffer = new ArrayBuffer(slice.length * 2);
        const view = new DataView(arrayBuffer);

        for (let i = 0; i < slice.length; i++) {
          view.setInt16(i * 2, slice[i], true); // Little-endian
        }
        this.port.postMessage(arrayBuffer);
      }
    }
    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
