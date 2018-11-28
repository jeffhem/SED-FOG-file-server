import React, { Component } from 'react';
import styles from './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
    };
    this.mediaRecord;
    this.source;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext);
    this.analyser = this.audioCtx.createAnalyser();
    this.recordToggle = this.recordToggle.bind(this);
  }

  visualize(stream) {
    const width = window.innerWidth;
    const height = 300;
    const canvas = document.querySelector('.visualizer');
    const audioCtx = this.audioCtx;
    const analyser = this.analyser;

    canvas.width = width;
    canvas.height = height;

    this.source = audioCtx.createMediaStreamSource(stream);
    this.source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, width, 100);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, width, height);
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = 'rgb(' + (96 + i * 3) + ',' + (163 + barWidth) + ',' + (0 + i) + ')';
        canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  }

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        audio: true
      })
        .then(stream => {
          this.visualize(stream);
          this.mediaRecord = new MediaRecorder(stream);

        })
        .catch(console.log);
    }
  }

  recordToggle() {
    const {isRecording} = this.state;
    let chunks = [];
    const soundClips = document.querySelector('.sound-clips');
    console.log(this.mediaRecord);

    if (!isRecording) {
      this.mediaRecord.start();
      this.setState({
        isRecording: true,
      });
    } else {
      this.mediaRecord.stop();
      this.setState({
        isRecording: false,
      });
    }

    this.mediaRecord.onstop = (e) => {
      const blob = new Blob(chunks, { 'type' : 'audio/ogg'});
      const reader = new FileReader();

      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const formData = new FormData();
        formData.append("audio_data", reader.result);
        formData.append('filename', Date(Date.now()).toISOString);
        fetch('/savefile', {
          method: 'POST',
          body: formData,
        })
          .then(res => res.json())
          .then(console.log);
      };

      chunks = [];
      // var clipContainer = document.createElement('article');
      // var clipLabel = document.createElement('p');
      // var audio = document.createElement('audio');

      // clipContainer.classList.add('clip');
      // audio.setAttribute('controls', '');

      // clipLabel.textContent = 'My unnamed clip';
      // clipContainer.appendChild(audio);
      // clipContainer.appendChild(clipLabel);
      // soundClips.appendChild(clipContainer);

      // audio.controls = true;

      // var audioURL = window.URL.createObjectURL(blob);
      // audio.src = audioURL;
      console.log("recorder stopped");

    }

    this.mediaRecord.ondataavailable = (e) => {
      console.log('herer');
      console.log(chunks);
      chunks.push(e.data);
    }
  }

  render() {
    const { isRecording } = this.state;
    return (
      <div className={styles.app}>
        <canvas className="visualizer"></canvas>
        <button onClick={this.recordToggle} className={isRecording ? 'btn__recording' : 'btn__ready'}>{isRecording ? 'Stop Recording' : 'Start Recording'}</button>
        <div className="sound-clips"></div>
      </div>
    );
  }
}
