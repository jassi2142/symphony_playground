const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
window.audioCtx = audioCtx;

const streamDest = audioCtx.createMediaStreamDestination();
let mediaRecorder;
let recordedChunks = [];

window.currentTempo = 120;
window.currentPace = 1.0;

window.setTempo = (val) => window.currentTempo = val;
window.setPace = (val) => window.currentPace = val;

function createNoiseBuffer() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    return buffer;
}
const noiseBuffer = createNoiseBuffer();

function connectOutput(node) {
    node.connect(audioCtx.destination);
    node.connect(streamDest);
}

const SoundEngine = {
    isRecording: false,
    startRecording: () => {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(streamDest.stream);
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Symphony-Recording.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        };
        mediaRecorder.start();
        SoundEngine.isRecording = true;
    },
    stopRecording: () => {
        if(mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        SoundEngine.isRecording = false;
    },

    // == UI SOUNDS ==
    playDrop: () => {
        if(audioCtx.state === 'suspended') return;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime(400, _time);
        osc.frequency.exponentialRampToValueAtTime(800, _time + 0.1);
        gain.gain.setValueAtTime(0.2, _time);
        gain.gain.exponentialRampToValueAtTime(0.01, _time + 0.1);
        osc.start(_time); osc.stop(_time + 0.1);
    },
    playTrash: () => {
        if(audioCtx.state === 'suspended') return;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime(150, _time);
        osc.frequency.exponentialRampToValueAtTime(40, _time + 0.3);
        gain.gain.setValueAtTime(0.3, _time);
        gain.gain.exponentialRampToValueAtTime(0.01, _time + 0.3);
        osc.start(_time); osc.stop(_time + 0.3);
    },

    // == ANIMALS ==
    playWoodpecker: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.05 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000 * p;
        gain.connect(filter); connectOutput(filter);
        osc.frequency.setValueAtTime(800 * p, _time);
        osc.frequency.exponentialRampToValueAtTime(200 * p, _time + dur);
        gain.gain.setValueAtTime(0.5, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playElephant: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.4 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000 * p, _time);
        filter.frequency.exponentialRampToValueAtTime(150 * p, _time + dur*0.75);
        gain.connect(filter); connectOutput(filter);
        osc.frequency.setValueAtTime(150 * p, _time); 
        osc.frequency.exponentialRampToValueAtTime(70 * p, _time + dur);
        gain.gain.setValueAtTime(0.7, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playFrog: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.2 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400 * p, _time);
        filter.frequency.linearRampToValueAtTime(1200 * p, _time + dur/2);
        filter.frequency.linearRampToValueAtTime(400 * p, _time + dur);
        gain.connect(filter); connectOutput(filter);
        osc.frequency.setValueAtTime(60 * p, _time);
        osc.frequency.exponentialRampToValueAtTime(150 * p, _time + dur/2);
        osc.frequency.exponentialRampToValueAtTime(60 * p, _time + dur);
        gain.gain.setValueAtTime(0.8, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playCat: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.5 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime(400 * p, _time);
        osc.frequency.linearRampToValueAtTime(650 * p, _time + dur*0.4);
        osc.frequency.linearRampToValueAtTime(300 * p, _time + dur);
        gain.gain.setValueAtTime(0.001, _time);
        gain.gain.linearRampToValueAtTime(0.3, _time + dur*0.2);
        gain.gain.linearRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playBee: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.6 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 30; 
        lfoGain.gain.value = 50 * p; 
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
        osc.type = 'sawtooth';
        osc.connect(gain);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 600 * p;
        gain.connect(filter); connectOutput(filter);
        osc.frequency.setValueAtTime(150 * p, _time);
        osc.frequency.linearRampToValueAtTime(250 * p, _time + dur*0.3);
        osc.frequency.linearRampToValueAtTime(150 * p, _time + dur);
        gain.gain.setValueAtTime(0.001, _time);
        gain.gain.linearRampToValueAtTime(0.2, _time + dur*0.2);
        gain.gain.linearRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); lfo.start(_time);
        osc.stop(_time + dur); lfo.stop(_time + dur);
    },
    playMonkey: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.3 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain); connectOutput(gain);
        const startHertz = 400 * p; 
        const dipHertz = 200 * p;
        const upHertz = 800 * p;
        osc.frequency.setValueAtTime(startHertz, _time);
        osc.frequency.exponentialRampToValueAtTime(dipHertz, _time + dur*0.4);
        osc.frequency.exponentialRampToValueAtTime(upHertz, _time + dur*0.8);
        gain.gain.setValueAtTime(0.01, _time);
        gain.gain.linearRampToValueAtTime(0.6, _time + dur*0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playOwl: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.8 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime(300 * p, _time); 
        osc.frequency.exponentialRampToValueAtTime(200 * p, _time + dur);
        gain.gain.setValueAtTime(0.01, _time);
        gain.gain.linearRampToValueAtTime(0.7, _time + dur*0.1);
        gain.gain.linearRampToValueAtTime(0.2, _time + dur*0.2);
        gain.gain.linearRampToValueAtTime(0.6, _time + dur*0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playDuck: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.3 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2;
        filter.frequency.setValueAtTime(800 * p, _time);
        filter.frequency.exponentialRampToValueAtTime(400 * p, _time + dur);
        osc.connect(filter); filter.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime(300 * p, _time);
        osc.frequency.exponentialRampToValueAtTime(150 * p, _time + dur);
        gain.gain.setValueAtTime(0.8, _time);
        gain.gain.exponentialRampToValueAtTime(0.01, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playCricket: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.2 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        const lfo = audioCtx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.value = 40; 
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 1;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        osc.connect(gain); connectOutput(gain);
        osc.frequency.value = 4000 * p;
        gain.gain.setValueAtTime(0.2, _time);
        gain.gain.linearRampToValueAtTime(0.01, _time + dur);
        osc.start(_time); lfo.start(_time);
        osc.stop(_time + dur); lfo.stop(_time + dur);
    },

    // == INSTRUMENTS ==
    playTrumpet: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.4 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 * p, _time);
        filter.frequency.linearRampToValueAtTime(2000 * p, _time + dur*0.25);
        filter.frequency.linearRampToValueAtTime(400 * p, _time + dur);
        gain.connect(filter); connectOutput(filter);
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00]; 
        osc.frequency.setValueAtTime(notes[Math.floor(Math.random() * notes.length)] * p, _time); 
        gain.gain.setValueAtTime(0.01, _time);
        gain.gain.linearRampToValueAtTime(0.5, _time + dur*0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playGuitar: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.8 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000 * p, _time);
        filter.frequency.exponentialRampToValueAtTime(100 * p, _time + dur);
        gain.connect(filter); connectOutput(filter);
        const chords = [196.00, 261.63, 329.63]; 
        osc.frequency.setValueAtTime(chords[Math.floor(Math.random() * chords.length)] * p, _time); 
        gain.gain.setValueAtTime(0.6, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playDrum: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.2 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime(150 * p, _time);
        osc.frequency.exponentialRampToValueAtTime(40 * p, _time + dur*0.5);
        gain.gain.setValueAtTime(1.0, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur*0.5);
        osc.start(_time); osc.stop(_time + dur*0.5);
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000 * p;
        const noiseGain = audioCtx.createGain();
        noiseSource.connect(noiseFilter); noiseFilter.connect(noiseGain); connectOutput(noiseGain);
        noiseGain.gain.setValueAtTime(0.5, _time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        noiseSource.start(_time); noiseSource.stop(_time + dur);
    },
    playBongo: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.15 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); connectOutput(gain);
        const freq = (Math.random() > 0.5 ? 400 : 250) * p;
        osc.frequency.setValueAtTime(freq, _time);
        osc.frequency.exponentialRampToValueAtTime(freq - (50*p), _time + dur);
        gain.gain.setValueAtTime(0.8, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playFlute: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.6 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 6;
        lfoGain.gain.value = 15;
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
        osc.type = 'sine';
        osc.connect(gain); connectOutput(gain);
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        osc.frequency.value = notes[Math.floor(Math.random() * notes.length)] * p;
        gain.gain.setValueAtTime(0.001, _time);
        gain.gain.linearRampToValueAtTime(0.3, _time + dur*0.2);
        gain.gain.linearRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); lfo.start(_time);
        osc.stop(_time + dur); lfo.stop(_time + dur);
    },
    playAccordion: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.8 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        filter.type = 'lowpass';
        filter.frequency.value = 1500 * p;
        osc1.connect(gain); osc2.connect(gain);
        gain.connect(filter); connectOutput(filter);
        const base = (Math.random() > 0.5 ? 261.63 : 349.23) * p; 
        osc1.frequency.value = base;
        osc2.frequency.value = base * 1.25; 
        gain.gain.setValueAtTime(0.001, _time);
        gain.gain.linearRampToValueAtTime(0.3, _time + dur*0.3);
        gain.gain.linearRampToValueAtTime(0.001, _time + dur);
        osc1.start(_time); osc2.start(_time);
        osc1.stop(_time + dur); osc2.stop(_time + dur);
    },
    playBass: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.6 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = 'square';
        osc2.type = 'sawtooth';
        osc1.connect(gain);
        osc2.connect(gain);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 5; 
        filter.frequency.setValueAtTime(2000 * p, _time);
        filter.frequency.exponentialRampToValueAtTime(80 * p, _time + dur * 0.5);
        gain.connect(filter); connectOutput(filter);
        const notes = [130.81, 146.83, 174.61]; 
        const freq = notes[Math.floor(Math.random() * notes.length)] * p;
        osc1.frequency.setValueAtTime(freq, _time);
        osc2.frequency.setValueAtTime(freq * 0.5, _time); 
        gain.gain.setValueAtTime(1.5, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc1.start(_time); osc2.start(_time);
        osc1.stop(_time + dur); osc2.stop(_time + dur);
    },
    playMaracas: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.1 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const shake = (start, length) => {
            const noiseSource = audioCtx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            const noiseFilter = audioCtx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 3000 * p;
            noiseFilter.Q.value = 1.5;
            const noiseGain = audioCtx.createGain();
            noiseSource.connect(noiseFilter); noiseFilter.connect(noiseGain); connectOutput(noiseGain);
            noiseGain.gain.setValueAtTime(1.5, start);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, start + length);
            noiseSource.start(start); noiseSource.stop(start + length);
        };
        shake(_time, dur);
        shake(_time + dur * 0.8, dur * 1.5); 
    },

    // == NATURE ==
    playCloud: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.6 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain); connectOutput(gain);
        const notes = [523.25, 659.25, 783.99, 1046.50]; 
        osc.frequency.setValueAtTime(notes[Math.floor(Math.random() * notes.length)] * p, _time);
        gain.gain.setValueAtTime(0.2, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playStar: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 1.0 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime((1500 + Math.random()*500) * p, _time);
        gain.gain.setValueAtTime(0.15, _time);
        gain.gain.exponentialRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playRain: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.4 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = (800 + Math.random()*400) * p;
        const noiseGain = audioCtx.createGain();
        noiseSource.connect(noiseFilter); noiseFilter.connect(noiseGain); connectOutput(noiseGain);
        noiseGain.gain.setValueAtTime(0.01, _time);
        noiseGain.gain.linearRampToValueAtTime(0.2, _time + dur/2);
        noiseGain.gain.linearRampToValueAtTime(0.01, _time + dur);
        noiseSource.start(_time); noiseSource.stop(_time + dur);
    },
    playWind: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 1.0 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(300 * p, _time);
        noiseFilter.frequency.linearRampToValueAtTime((800 + Math.random()*400) * p, _time + dur/2);
        noiseFilter.frequency.linearRampToValueAtTime(300 * p, _time + dur);
        const noiseGain = audioCtx.createGain();
        noiseSource.connect(noiseFilter); noiseFilter.connect(noiseGain); connectOutput(noiseGain);
        noiseGain.gain.setValueAtTime(0.01, _time);
        noiseGain.gain.linearRampToValueAtTime(0.4, _time + dur/2);
        noiseGain.gain.linearRampToValueAtTime(0.01, _time + dur);
        noiseSource.start(_time); noiseSource.stop(_time + dur);
    },
    playWhistle: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.4 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain); connectOutput(gain);
        osc.frequency.setValueAtTime(1000 * p, _time);
        osc.frequency.linearRampToValueAtTime(1500 * p, _time + dur/2);
        osc.frequency.linearRampToValueAtTime(1000 * p, _time + dur);
        gain.gain.setValueAtTime(0.001, _time);
        gain.gain.linearRampToValueAtTime(0.4, _time + dur*0.2);
        gain.gain.linearRampToValueAtTime(0.001, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    },
    playThunder: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 2.0 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 * p, _time);
        filter.frequency.exponentialRampToValueAtTime(50 * p, _time + dur);
        const gain = audioCtx.createGain();
        noise.connect(filter); filter.connect(gain); connectOutput(gain);
        gain.gain.setValueAtTime(0.01, _time);
        gain.gain.linearRampToValueAtTime(1.0, _time + 0.1);
        gain.gain.linearRampToValueAtTime(0.4, _time + 0.3);
        gain.gain.linearRampToValueAtTime(0.8, _time + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, _time + dur);
        noise.start(_time); noise.stop(_time + dur);
    },
    playCampfire: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.5 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000 * p;
        const gain = audioCtx.createGain();
        noise.connect(filter); filter.connect(gain); connectOutput(gain);
        gain.gain.setValueAtTime(0.01, _time);
        gain.gain.linearRampToValueAtTime(0.6, _time + 0.1);
        gain.gain.linearRampToValueAtTime(0.1, _time + 0.2);
        gain.gain.linearRampToValueAtTime(0.8, _time + 0.3);
        gain.gain.linearRampToValueAtTime(0.01, _time + dur);
        noise.start(_time); noise.stop(_time + dur);
    },
    playOcean: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = (60 / window.currentTempo) * 4; 
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100 * p, _time);
        filter.frequency.linearRampToValueAtTime(800 * p, _time + dur/2);
        filter.frequency.linearRampToValueAtTime(100 * p, _time + dur);
        const gain = audioCtx.createGain();
        noise.connect(filter); filter.connect(gain); connectOutput(gain);
        gain.gain.setValueAtTime(0.01, _time);
        gain.gain.linearRampToValueAtTime(0.3, _time + dur/2);
        gain.gain.linearRampToValueAtTime(0.01, _time + dur);
        noise.start(_time); noise.stop(_time + dur);
    },
    playSongbird: (scale=1) => {
        if(audioCtx.state === 'suspended') return;
        const dur = 0.4 * window.currentPace;
        const p = 1/scale;
        const _time = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain); connectOutput(gain);
        const startNote = (2000 + Math.random()*1000) * p;
        osc.frequency.setValueAtTime(startNote, _time);
        osc.frequency.exponentialRampToValueAtTime(startNote + 1000*p, _time + dur*0.3);
        osc.frequency.setValueAtTime(startNote - 500*p, _time + dur*0.4);
        osc.frequency.exponentialRampToValueAtTime(startNote + 800*p, _time + dur*0.8);
        gain.gain.setValueAtTime(0.01, _time);
        gain.gain.linearRampToValueAtTime(0.3, _time + dur*0.1);
        gain.gain.linearRampToValueAtTime(0.01, _time + dur*0.4);
        gain.gain.linearRampToValueAtTime(0.4, _time + dur*0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, _time + dur);
        osc.start(_time); osc.stop(_time + dur);
    }
};

window.SoundEngine = SoundEngine;

let loopTimer = null;
let currentBeat = 0;
let isPlayingLoop = false;

window.startPlayback = (getMeadowTypes) => {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    isPlayingLoop = true;
    currentBeat = 0;
    
    if(loopTimer) clearTimeout(loopTimer);
    
    function scheduleNextBeat() {
        if(!isPlayingLoop) return;
        
        const bpm = window.currentTempo || 120;
        const beatDurationMs = (60 / bpm) * 1000;
        
        const items = getMeadowTypes();
        
        // Helper to trigger logic AND pass scale
        const trigger = (action, item, delay) => {
            setTimeout(() => {
                // Play audio matching the scale size
                action(item.scale);
                
                // Trigger CSS visual Dance
                if(item.element) {
                    item.element.classList.add('dancing');
                    setTimeout(() => {
                        if(item.element) item.element.classList.remove('dancing');
                    }, 300);
                }
            }, delay);
        };
        
        items.forEach((item, i) => {
            const type = item.type;
            
            if(type === 'woodpecker') trigger(SoundEngine.playWoodpecker, item, (i * 100) % beatDurationMs);
            else if (type === 'elephant') { if(currentBeat % 2 === 0) trigger(SoundEngine.playElephant, item, 0); }
            else if (type === 'frog') { if(currentBeat % 2 !== 0) trigger(SoundEngine.playFrog, item, beatDurationMs/4); }
            else if (type === 'cat') { if(Math.random() > 0.6) trigger(SoundEngine.playCat, item, Math.random() * beatDurationMs); }
            else if (type === 'bee') trigger(SoundEngine.playBee, item, (i * 80) % beatDurationMs);
            else if (type === 'monkey') { if (Math.random() > 0.5) trigger(SoundEngine.playMonkey, item, beatDurationMs/2); }
            else if (type === 'owl') { if(currentBeat % 4 === 0) trigger(SoundEngine.playOwl, item, 0); }
            else if (type === 'duck') trigger(SoundEngine.playDuck, item, (i * 200) % beatDurationMs);
            else if (type === 'cricket') trigger(SoundEngine.playCricket, item, (i * 125) % beatDurationMs);
            
            else if (type === 'trumpet') { if(currentBeat % 4 === 0 || currentBeat % 4 === 2) trigger(SoundEngine.playTrumpet, item, 0); }
            else if (type === 'guitar') { if(currentBeat % 2 === 0) trigger(SoundEngine.playGuitar, item, beatDurationMs/3); }
            else if (type === 'drum') { 
                trigger(SoundEngine.playDrum, item, 0);
                if(i % 2 === 1) trigger(SoundEngine.playDrum, item, beatDurationMs/2); 
            }
            else if (type === 'bongo') { 
                if(currentBeat % 2 === 0) trigger(SoundEngine.playBongo, item, beatDurationMs/2); 
                else if(Math.random() > 0.5) trigger(SoundEngine.playBongo, item, beatDurationMs/4); 
            }
            else if (type === 'flute') { if(currentBeat % 4 === 0 || currentBeat % 4 === 2) trigger(SoundEngine.playFlute, item, beatDurationMs/4); } 
            else if (type === 'accordion') { if(currentBeat % 4 === 1) trigger(SoundEngine.playAccordion, item, 0); } 
            else if (type === 'bass') { trigger(SoundEngine.playBass, item, 0); }
            else if (type === 'maracas') {
                trigger(SoundEngine.playMaracas, item, 0);
                trigger(SoundEngine.playMaracas, item, beatDurationMs/2); 
            }

            else if (type === 'cloud') trigger(SoundEngine.playCloud, item, (i * 150) % beatDurationMs);
            else if (type === 'star') { if(currentBeat % 4 === 0) trigger(SoundEngine.playStar, item, 0); }
            else if (type === 'rain') trigger(SoundEngine.playRain, item, Math.random() * beatDurationMs);
            else if (type === 'wind') { if(currentBeat % 4 === 0) trigger(SoundEngine.playWind, item, 0); }
            else if (type === 'whistle') { if(Math.random() > 0.7) trigger(SoundEngine.playWhistle, item, 0); } 
            else if (type === 'thunder') { if(currentBeat % 8 === 0) trigger(SoundEngine.playThunder, item, 0); }
            else if (type === 'campfire') { trigger(SoundEngine.playCampfire, item, Math.random() * beatDurationMs); }
            else if (type === 'ocean') { if(currentBeat % 4 === 0) trigger(SoundEngine.playOcean, item, 0); }
            else if (type === 'songbird') { if(Math.random() > 0.4) trigger(SoundEngine.playSongbird, item, Math.random() * beatDurationMs); }
        });
        
        currentBeat++;
        loopTimer = setTimeout(scheduleNextBeat, beatDurationMs);
    }
    scheduleNextBeat();
};

window.stopPlayback = () => {
    isPlayingLoop = false;
    if(loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = null;
    }
    currentBeat = 0;
};
