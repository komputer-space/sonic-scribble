export class AudioInput {
  constructor() {
    this.active = false;
    this.analyser;
    this.dataArray;
    this.setup();
  }

  async setup() {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .then((stream) => {
        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        this.analyser = audioCtx.createAnalyser();

        this.analyser.fftSize = 2048; // Set FFT size
        const bufferLength = this.analyser.frequencyBinCount; // Half of fftSize
        this.dataArray = new Uint8Array(bufferLength);

        source.connect(this.analyser);
        this.active = true;
      })
      .catch((err) => {
        console.error("Error accessing audio input:", err);
      });
  }

  read() {
    if (this.active) {
      this.analyser.getByteFrequencyData(this.dataArray);
    //   console.log(this.dataArray);
    }
  }
}
