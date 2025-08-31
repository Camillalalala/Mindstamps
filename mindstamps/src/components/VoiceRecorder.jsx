import { useState, useRef, useEffect } from 'react';

const VoiceRecorder = ({ onTranscription, onError, onFieldChange, onSubmit, currentField = 'title', autoStart = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [activeField, setActiveField] = useState(currentField);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Add start event handler
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };

      // Handle results
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        
        // Check for voice commands
        const lowerTranscript = fullTranscript.toLowerCase();
        if (event.results[event.results.length - 1].isFinal) {
          // Navigation commands
          if (lowerTranscript.includes('next field') || lowerTranscript.includes('next') || lowerTranscript.includes('move on')) {
            console.log('Processing "next" command');
            handleFieldNavigation();
            // Clear transcript but don't return - let normal processing continue
            setTranscript('');
            return;
          }
          
          // Submit command
          if (lowerTranscript.includes('submit') || lowerTranscript.includes('save memory') || lowerTranscript.includes('create memory')) {
            console.log('Processing "submit" command');
            if (onSubmit) {
              onSubmit();
            }
            setTranscript('');
            return;
          }
          
          // Address/location commands
          if (lowerTranscript.includes('address is') || lowerTranscript.includes('location is') || lowerTranscript.includes('at')) {
            console.log('Processing location command');
            handleLocationCommand(fullTranscript);
            return;
          }
        }
        
        if (onTranscription) {
          onTranscription(fullTranscript, event.results[event.results.length - 1].isFinal, activeField);
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't treat "aborted" as a real error if we're just switching fields
        if (event.error === 'aborted') {
          console.log('Recognition aborted (likely due to field change), ignoring error');
          return;
        }
        
        // Only stop recording for real errors
        if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
          setIsRecording(false);
          if (onError) {
            onError(event.error);
          }
        }
      };

      // Handle end - restart if we want continuous recording
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended, isRecording:', isRecording);
        // Only restart if we're still supposed to be recording
        if (isRecording) {
          console.log('Restarting speech recognition for continuous recording');
          // Restart recognition automatically for continuous recording
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              try {
                // Check if recognition is already running
                if (recognitionRef.current.continuous) {
                  recognitionRef.current.start();
                  console.log('Speech recognition restarted successfully');
                }
              } catch (error) {
                console.error('Recognition restart failed:', error);
                if (error.name === 'InvalidStateError') {
                  // Recognition is already running, this is okay
                  console.log('Recognition already running, continuing...');
                } else if (error.name === 'AbortError') {
                  // Aborted, try again
                  console.log('Recognition was aborted, trying again...');
                  setTimeout(() => {
                    try {
                      recognitionRef.current.start();
                    } catch (e) {
                      console.error('Second restart attempt failed:', e);
                      setIsRecording(false);
                    }
                  }, 500);
                } else {
                  setIsRecording(false);
                  if (onError && error.name !== 'AbortError') {
                    onError('Failed to restart voice recognition');
                  }
                }
              }
            }
          }, 100);
        } else {
          setIsRecording(false);
        }
      };
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription, onError]);

  // Auto-start recording when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart && isSupported && !isRecording) {
      // Add a small delay to ensure component is fully mounted
      setTimeout(() => {
        startRecording();
      }, 500);
    }
  }, [autoStart, isSupported, isRecording]);

  // Update activeField when currentField prop changes
  useEffect(() => {
    setActiveField(currentField);
  }, [currentField]);

  const handleFieldNavigation = () => {
    const fieldOrder = ['title', 'story', 'location'];
    const currentIndex = fieldOrder.indexOf(activeField);
    const nextIndex = (currentIndex + 1) % fieldOrder.length;
    const nextField = fieldOrder[nextIndex];
    
    console.log('Navigating from', activeField, 'to', nextField);
    
    // Don't stop recognition, just update the field
    setActiveField(nextField);
    setTranscript('');
    
    if (onFieldChange) {
      onFieldChange(nextField);
    }
    
    // No need to restart recognition - keep it running continuously
  };

  const handleLocationCommand = (transcript) => {
    // Extract location from transcript
    const lowerTranscript = transcript.toLowerCase();
    let location = '';
    
    if (lowerTranscript.includes('address is')) {
      location = transcript.substring(transcript.toLowerCase().indexOf('address is') + 10).trim();
    } else if (lowerTranscript.includes('location is')) {
      location = transcript.substring(transcript.toLowerCase().indexOf('location is') + 11).trim();
    } else if (lowerTranscript.includes('at ')) {
      location = transcript.substring(transcript.toLowerCase().indexOf('at ') + 3).trim();
    }
    
    if (location && onTranscription) {
      onTranscription(location, true, 'location');
    }
    
    setTranscript('');
    // Keep recording active after location command
  };

  const startRecording = async () => {
    if (!isSupported || !recognitionRef.current) {
      console.error('Speech recognition not supported or not initialized');
      if (onError) {
        onError('Speech recognition not supported');
      }
      return;
    }

    try {
      // Request microphone permission
      console.log('Requesting microphone permission...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      
      setTranscript('');
      setIsRecording(true);
      
      // Start recognition without stopping first (to avoid abort errors)
      try {
        recognitionRef.current.start();
        console.log('Speech recognition started successfully');
      } catch (error) {
        if (error.name === 'InvalidStateError') {
          console.log('Recognition already running, continuing...');
          // Already running, that's fine
        } else {
          console.error('Failed to start recognition:', error);
          setIsRecording(false);
          if (onError && error.name !== 'AbortError') {
            onError('Failed to start voice recognition');
          }
        }
      }
      
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setIsRecording(false);
      if (onError) {
        onError('Microphone permission required');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false); // Set this first to prevent auto-restart
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-recorder-unsupported p-4 text-center">
        <p className="text-sm" style={{ color: 'var(--warm-brown)' }}>
          Voice recording not supported in this browser. Try Chrome or Safari.
        </p>
      </div>
    );
  }

  const getFieldDisplayName = (field) => {
    const fieldNames = {
      title: 'Memory Title',
      story: 'Story',
      location: 'Location'
    };
    return fieldNames[field] || field;
  };

  return (
    <div className="voice-recorder">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleRecording}
          className={`voice-button flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'btn-warm hover:scale-105'
          }`}
          style={{
            boxShadow: isRecording 
              ? '0 0 20px rgba(239, 68, 68, 0.4)' 
              : '0 4px 12px rgba(212, 165, 116, 0.3)'
          }}
        >
          {isRecording ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="6" width="8" height="8" rx="1" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--deep-brown)' }}>
            {isRecording 
              ? `🎤 Recording ${getFieldDisplayName(activeField)}... Listening continuously` 
              : `Start continuous voice recording for ${getFieldDisplayName(activeField)}`
            }
          </p>
          {transcript && (
            <p className="text-xs mt-1 italic" style={{ color: 'var(--warm-brown)' }}>
              "{transcript}"
            </p>
          )}
        </div>
      </div>
      
      {/* Field Indicator */}
      <div className="mt-2 flex items-center space-x-2">
        <div className="flex flex-wrap gap-1">
          {['title', 'story', 'location'].map((field, index) => (
            <div
              key={field}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                activeField === field
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {getFieldDisplayName(field)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Voice Commands Help */}
      {isRecording && (
        <div className="mt-2 text-xs" style={{ color: 'var(--warm-brown)' }}>
          <strong>Voice Commands:</strong> "next" (next field) • "address is [location]" • "submit" (save memory) • Click 🔴 to stop
        </div>
      )}
      
      {isRecording && (
        <div className="mt-3 flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs" style={{ color: 'var(--warm-brown)' }}>
            Continuously listening for "{getFieldDisplayName(activeField)}" and commands...
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;