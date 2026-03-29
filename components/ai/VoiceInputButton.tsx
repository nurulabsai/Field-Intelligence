import React, { useState } from 'react';
import './VoiceInputButton.css';

interface VoiceInputButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  language: 'sw' | 'en';
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onRecordingComplete,
  language,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access to use voice input');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const labels = {
    sw: {
      recording: 'Inarekodi...',
      hold: 'Shikilia Kuongea'
    },
    en: {
      recording: 'Recording...',
      hold: 'Hold to Speak'
    }
  };

  const text = labels[language] || labels.en;

  return (
    <button
      className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      onMouseLeave={stopRecording} // Safety: stop if mouse leaves button
      type="button"
    >
      {isRecording ? (
        <>
          <span className="recording-animation">🔴</span>
          <span>{text.recording}</span>
        </>
      ) : (
        <>
          <span>🎤</span>
          <span>{text.hold}</span>
        </>
      )}
    </button>
  );
};