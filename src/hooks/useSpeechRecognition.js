import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSupported = Boolean(SpeechRecognitionAPI);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let currentTranscript = '';
      let currentConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        currentTranscript += result[0].transcript;
        if (result.isFinal) {
          currentConfidence = result[0].confidence;
        }
      }

      setTranscript(currentTranscript);
      if (currentConfidence > 0) {
        setConfidence(currentConfidence);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };

    recognitionRef.current = recognition;
  }, [SpeechRecognitionAPI]);

  const startListening = useCallback(async (lang = 'en-US') => {
    if (!isSupported || !recognitionRef.current) return;

    setTranscript('');
    setConfidence(0);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);

      // MediaRecorder for playback of own voice if mic permission granted
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioUrl(URL.createObjectURL(blob));
          }
          // Stop media tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }
    } catch {
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setAudioUrl(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    confidence,
    audioUrl,
    startListening,
    stopListening,
    resetTranscript
  };
};

export default useSpeechRecognition;
