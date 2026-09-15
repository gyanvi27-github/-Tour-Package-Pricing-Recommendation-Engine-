import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  AlertCircle,
  HelpCircle,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { LiveAudioPlayer, floatTo16BitPCM, arrayBufferToBase64 } from '../utils/audioUtils';

interface VoiceConversationProps {
  onClose?: () => void;
  isFullPageView?: boolean;
}

type CallStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

export const VoiceConversation: React.FC<VoiceConversationProps> = ({
  onClose,
  isFullPageView = false,
}) => {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [modelSpeakingLevel, setModelSpeakingLevel] = useState<number>(0);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [voiceName, setVoiceName] = useState<string>('Zephyr');
  const [interactionCount, setInteractionCount] = useState<number>(0);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const timerRef = useRef<any>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    playerRef.current = new LiveAudioPlayer();
    return () => {
      endCall();
      playerRef.current?.close();
    };
  }, []);

  // Timer for active call
  useEffect(() => {
    if (status === 'connected' || status === 'listening' || status === 'speaking') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const startCall = async () => {
    setErrorMessage(null);
    setStatus('connecting');
    setInteractionCount(0);

    try {
      // 1. Initialize Audio Player for 24kHz model output
      playerRef.current?.init();

      // 2. Request Microphone Stream (16kHz preferred)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
      } catch (micErr: any) {
        throw new Error(
          `Microphone permission was denied or unavailable (${micErr.name || micErr.message}). Please allow microphone access in your browser to use Gemini Live voice.`
        );
      }

      // 3. Setup WebSocket connection to server Live API bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to server Live API WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.connected) {
            setStatus('listening');
            if (data.voiceName) setVoiceName(data.voiceName);
          }

          if (data.audio) {
            setStatus('speaking');
            setInteractionCount((prev) => prev + 1);
            playerRef.current?.playChunk(data.audio, (lvl) => {
              setModelSpeakingLevel(lvl);
              setTimeout(() => setModelSpeakingLevel(0), 120);
            });
          }

          if (data.interrupted) {
            console.log('Voice output interrupted by user');
            playerRef.current?.stopAll();
            setModelSpeakingLevel(0);
            setStatus('listening');
          }

          if (data.closed) {
            endCall();
          }

          if (data.error) {
            setErrorMessage(data.error);
            setStatus('error');
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('Live API WebSocket error:', err);
        setErrorMessage('WebSocket connection to Gemini Live voice failed.');
        setStatus('error');
      };

      ws.onclose = () => {
        if (status !== 'idle') {
          setStatus('idle');
        }
      };

      // 4. Setup Web Audio capture pipeline at 16kHz
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // 2048 or 4096 samples buffer for responsive real-time streaming
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) {
          setAudioLevel(0);
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);

        // Compute local volume level for visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i += 8) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / (inputData.length / 8));
        setAudioLevel(Math.min(1, rms * 6));

        // Convert to 16-bit PCM little endian
        const pcmBuffer = floatTo16BitPCM(inputData);
        const base64Audio = arrayBufferToBase64(pcmBuffer);

        // Send to Live WebSocket
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err: any) {
      console.error('Failed to start Gemini Live voice call:', err);
      setErrorMessage(err.message || 'Could not initiate voice conversation.');
      setStatus('error');
      endCall();
    }
  };

  const endCall = () => {
    // 1. Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 2. Stop audio player
    playerRef.current?.stopAll();

    // 3. Stop audio context & processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // 4. Stop mic media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setAudioLevel(0);
    setModelSpeakingLevel(0);
    setStatus('idle');
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const isActive = status === 'connected' || status === 'listening' || status === 'speaking';

  // Dynamic visualizer size based on active audio levels
  const effectiveLevel = status === 'speaking' ? modelSpeakingLevel : audioLevel;
  const orbScale = 1 + effectiveLevel * 0.4;
  const ringScale = 1 + effectiveLevel * 0.9;

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-between rounded-3xl bg-gradient-to-b from-[#0a1526] via-[#070e1c] to-[#040812] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 overflow-hidden text-center backdrop-blur-xl ${
        isFullPageView ? 'min-h-[620px]' : 'min-h-[520px]'
      }`}
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: isActive
            ? 'radial-gradient(circle at 50% 45%, rgba(0, 229, 255, 0.15) 0%, rgba(59, 130, 246, 0.08) 45%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 60%)',
        }}
      />

      {/* Top Header & Status Strip */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className={`w-4 h-4 ${isActive ? 'animate-pulse text-cyan-300' : ''}`} />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Gemini Live Voice</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold">
                Live API
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              gemini-3.1-flash-live-preview • {voiceName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isActive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{formatTime(callDuration)}</span>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl text-xs bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Center Interactive Voice Orb Visualizer */}
      <div className="relative my-auto py-8 flex flex-col items-center justify-center z-10">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Outermost Pulsing Wave Rings */}
          {isActive && (
            <>
              <div
                className="absolute inset-0 rounded-full border border-cyan-400/20 transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${ringScale * 1.3})`,
                  opacity: Math.max(0.1, effectiveLevel),
                }}
              />
              <div
                className="absolute inset-0 rounded-full border border-cyan-500/30 transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${ringScale * 1.15})`,
                  opacity: Math.max(0.2, effectiveLevel * 1.2),
                }}
              />
            </>
          )}

          {/* Glowing Aura Ring */}
          <div
            className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-purple-500/20 blur-xl transition-transform duration-150"
            style={{
              transform: `scale(${orbScale * 1.2})`,
            }}
          />

          {/* Central Animated Orb */}
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl border ${
              isActive
                ? status === 'speaking'
                  ? 'bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 border-cyan-300 shadow-cyan-500/50'
                  : 'bg-gradient-to-tr from-[#0d284a] via-[#113a69] to-[#0c4075] border-cyan-400/60 shadow-cyan-500/30'
                : 'bg-gradient-to-tr from-[#0a1626] to-[#060e1c] border-slate-800 shadow-black'
            }`}
            style={{
              transform: `scale(${orbScale})`,
            }}
          >
            {status === 'connecting' ? (
              <div className="flex flex-col items-center gap-2 text-cyan-300">
                <Sparkles className="w-8 h-8 animate-spin" />
                <span className="text-[11px] font-semibold">Connecting...</span>
              </div>
            ) : isActive ? (
              <div className="flex flex-col items-center gap-1.5 text-white">
                {status === 'speaking' ? (
                  <>
                    <Volume2 className="w-9 h-9 text-slate-950 animate-bounce" />
                    <span className="text-xs font-black text-slate-950 uppercase tracking-wider">
                      Gemini Speaking
                    </span>
                  </>
                ) : isMuted ? (
                  <>
                    <MicOff className="w-8 h-8 text-rose-400" />
                    <span className="text-xs font-bold text-rose-300">Mic Muted</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 text-cyan-300 animate-pulse" />
                    <span className="text-xs font-bold text-cyan-200">Listening...</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Headphones className="w-9 h-9 text-cyan-400/80" />
                <span className="text-xs font-semibold text-slate-300">Ready to Talk</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Status Text & Prompt Hint */}
        <div className="mt-4 space-y-1">
          <div className="text-base sm:text-lg font-bold text-white">
            {status === 'idle' && 'Real-Time Voice Assistant'}
            {status === 'connecting' && 'Connecting to Gemini Live...'}
            {status === 'listening' && 'Listening... Speak naturally'}
            {status === 'speaking' && 'Gemini is answering verbally'}
            {status === 'error' && 'Voice Connection Issue'}
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {status === 'idle' &&
              'Have a live, zero-latency conversation. Ask about travel packages, customize itineraries, or compare destinations.'}
            {status === 'listening' &&
              'Speak freely. Interrupt anytime by speaking again — Gemini Live detects natural conversation turns.'}
            {status === 'speaking' && 'Listen to Gemini Live voice output in 24kHz audio.'}
            {status === 'error' && errorMessage}
          </p>
        </div>
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="w-full max-w-md mb-4 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 text-left z-10">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="w-full flex items-center justify-center gap-4 z-10 pt-2 border-t border-cyan-500/10">
        {!isActive ? (
          <button
            onClick={startCall}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 text-slate-950" />
            <span>Start Voice Conversation</span>
          </button>
        ) : (
          <div className="flex items-center gap-3.5">
            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        )}
      </div>

      {/* Trust & Model Spec Footer */}
      <div className="w-full mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bi-directional Audio (16kHz PCM In • 24kHz Out)</span>
        </div>
        <div className="hidden sm:block font-mono text-[10px] text-slate-500">
          Latency: Real-time • Model: gemini-3.1-flash-live-preview
        </div>
      </div>
    </div>
  );
};
