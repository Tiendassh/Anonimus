import React, { useState, useEffect, useRef } from "react";
import { 
  Gamepad, 
  Sparkles, 
  User, 
  Send, 
  PhoneCall, 
  Video, 
  ShieldAlert, 
  Copy, 
  Check, 
  Volume2, 
  PhoneOff, 
  Disc, 
  Heart, 
  Compass, 
  Cpu, 
  Share2, 
  Activity,
  Mic,
  Camera
} from "lucide-react";
import { MatchRoom, Message, UserProfile } from "../types";

interface MatchTabProps {
  topics: { id: string; name: string }[];
  currentUserId: string;
  userName: string;
  userAvatar: string;
  userInterests: string[];
  activeRoom: MatchRoom | null;
  onSetUserProfile: (name: string, avatar: string, tastes: string[]) => void;
  onSetActiveRoom: (room: MatchRoom | null) => void;
  onRefreshState: () => void;
}

export default function MatchTab({
  topics,
  currentUserId,
  userName,
  userAvatar,
  userInterests,
  activeRoom,
  onSetUserProfile,
  onSetActiveRoom,
  onRefreshState
}: MatchTabProps) {
  // Setup Lobby forms states
  const [inputName, setInputName] = useState<string>("Sombra Anónima");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("🦊");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Privacidad"]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [matchingStatus, setMatchingStatus] = useState<string>("");
  const [inviteCopied, setInviteCopied] = useState<boolean>(false);

  // Active chat controls states
  const [chatMessage, setChatMessage] = useState<string>("");
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState<boolean>(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [shareContactRevealed, setShareContactRevealed] = useState<boolean>(false);

  // Multimedia simulations
  const [audioFreqs, setAudioFreqs] = useState<number[]>([15, 40, 20, 60, 45, 10, 30, 70, 50, 12, 40]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const avatarsList = ["🦊", "🐉", "🐙", "🧙", "🦾", "👾", "🕶️", "👤", "🐯", "🦉"];
  const availableTastes = [
    "Privacidad", 
    "Música", 
    "Filosofía", 
    "Gaming", 
    "Criptomonedas", 
    "Física Cuántica", 
    "IA Conciencia"
  ];

  // Sync scroll on chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRoom?.messages]);

  // Audio wave animation simulation when audio is active
  useEffect(() => {
    let audioTimer: any;
    if (isAudioCallActive) {
      audioTimer = setInterval(() => {
        setAudioFreqs(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
      }, 150);
    }
    return () => clearInterval(audioTimer);
  }, [isAudioCallActive]);

  // Camera video silhouette stream
  useEffect(() => {
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log("Play interrupted", e));
        }
      } catch (err) {
        console.warn("Camera hardware access rejected or unavailable: using vector simulation instead.", err);
      }
    };

    if (isCameraActive && activeRoom?.closenessLevel && activeRoom.closenessLevel >= 3) {
      startCamera();
      
      // Canvas rendering filter loop to obscure identity using high-contrast green pixel blocks or ASCII matrix style matrix!
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const draw = () => {
          if (ctx) {
            ctx.fillStyle = "#09090b"; // zinc-950
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // If we have live camera access, draw with severe green outline filter
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              // Extract pixels and apply heavy cyberpunk threshold
              try {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;
                const thresh = 110;
                for (let i = 0; i < data.length; i += 4) {
                  const r = data[i];
                  const g = data[i+1];
                  const b = data[i+2];
                  const v = (0.2126*r + 0.7152*g + 0.0722*b);
                  
                  // Pixelate blocks or render monochrome silhouettes
                  if (v < thresh) {
                    // dark region
                    data[i] = 16;     // dark gray red
                    data[i+1] = 185;  // emerald green
                    data[i+2] = 129;
                  } else {
                    // highlight regions
                    data[i] = 255;
                    data[i+1] = 255;
                    data[i+2] = 255;
                  }
                }
                ctx.putImageData(imgData, 0, 0);

                // Overlay scanlines
                ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
                for (let y = 0; y < canvas.height; y += 4) {
                  ctx.fillRect(0, y, canvas.width, 2);
                }
              } catch (e) {
                // cross-origin safety fallback
              }
            } else {
              // Draw generic animated vector radar map to look high tech and hyper cool
              const t = Date.now() * 0.002;
              ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
              ctx.lineWidth = 2;
              
              // Draw Radar lines
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 2, Math.abs(Math.sin(t)) * 80 + 30, 0, Math.PI * 2);
              ctx.stroke();

              ctx.strokeStyle = "#ffffff";
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
              ctx.stroke();

              // Draw Matrix-like texts
              ctx.fillStyle = "#10b981";
              ctx.font = "bold 10px monospace";
              ctx.fillText("SILUETA SEGURA // CAPA ENCRIPTADA", 20, 25);
              ctx.fillText(`PING NODOS: OK`, 20, canvas.height - 25);
              ctx.fillText(`CERCANÍA: ${activeRoom?.closenessPoints}%`, canvas.width - 110, canvas.height - 25);
            }
          }
          animationFrameId = requestAnimationFrame(draw);
        };
        draw();
      }
    } else {
      // Clean up camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, activeRoom?.closenessLevel, activeRoom?.closenessPoints]);

  const toggleInterest = (taste: string) => {
    if (selectedInterests.includes(taste)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(prev => prev.filter(i => i !== taste));
      }
    } else {
      setSelectedInterests(prev => [...prev, taste]);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/invite/room_${Math.random().toString(36).substring(2, 9)}`;
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  // Search Match with fallback simulation
  const handleStartMatching = () => {
    if (!inputName.trim()) return;
    onSetUserProfile(inputName.trim(), selectedAvatar, selectedInterests);
    setIsSearching(true);
    setMatchingStatus("CONECTANDO A UN NODO DE MATCHMAKING ANONIMO...");

    const steps = [
      "Buscando canales residenciales cifrados...",
      "Cruzando filtros de intereses en común...",
      "Estableciendo proxy socket seguro...",
      "Identidades desinfectadas. Enlazando túnel de chat..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setMatchingStatus(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        submitJoinRequest();
      }
    }, 900);
  };

  const submitJoinRequest = async () => {
    try {
      const response = await fetch("/api/match/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          name: inputName,
          avatar: selectedAvatar,
          interests: selectedInterests
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.room) {
          onSetActiveRoom(data.room);
          onRefreshState();
        }
      }
    } catch (e) {
      console.error("Match error", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Leave active Match Room
  const handleLeaveRoom = async () => {
    if (!activeRoom) return;
    try {
      await fetch("/api/match/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: activeRoom.id, userId: currentUserId })
      });
      onSetActiveRoom(null);
      setIsCameraActive(false);
      setIsAudioCallActive(false);
      setShareContactRevealed(false);
      onRefreshState();
    } catch (err) {
      console.error(err);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeRoom) return;

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeRoom.id,
          sender: userName || "Tú",
          content: chatMessage.trim()
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.room) {
          onSetActiveRoom(data.room);
          setChatMessage("");
          // Quickly refresh state to sync points
          onRefreshState();
        }
      }
    } catch (e) {
      console.error("Error sending message", e);
    }
  };

  // Trigger Gemini Icebreaker Question
  const handleGetAIIcebreaker = async () => {
    if (!activeRoom || isGeneratingIcebreaker) return;
    setIsGeneratingIcebreaker(true);

    try {
      const response = await fetch("/api/ai/icebreaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeRoom.id,
          interests: activeRoom.interests
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.room) {
          onSetActiveRoom(data.room);
          onRefreshState();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  // Vote to immediately bypass and step up safety levels
  const handleVoteUpgrade = async () => {
    if (!activeRoom) return;
    try {
      const response = await fetch("/api/chat/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeRoom.id,
          userId: currentUserId,
          action: "vote"
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.room) {
          onSetActiveRoom(data.room);
          onRefreshState();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render Setup / Entrance Screen
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-zinc-950 font-sans selection:bg-emerald-400 selection:text-black scrollbar-thin">
        {/* Welcome Blocky Header */}
        <div className="text-left mb-6 border-b border-zinc-800 pb-4">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1.5 block">NÚCLEO DE CONTACTO ANONIMO</span>
          <h2 className="text-4xl font-black tracking-tighter leading-none text-white uppercase">SISTEMA MATCH</h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Conexión de canal único cifrada. Destraba capas de audio y video aumentando tu grado de confianza.</p>
        </div>

        {isSearching ? (
          /* Matchmaking Loading Block */
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-white animate-spin"></div>
              <Cpu className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-lg font-black italic text-white uppercase tracking-tight mb-2">Canalizando de forma Segura...</h3>
            <p className="text-xs font-mono text-emerald-400 animate-pulse text-center max-w-[280px]">
              {matchingStatus}
            </p>
            <div className="mt-8 p-3 bg-zinc-900/90 border border-zinc-800 rounded text-[10px] font-mono text-zinc-500 max-w-[320px] text-center">
              🔐 MÁSCARA PROXY ACTIVADA: El enrutador local está enviando peticiones redundantes para ocultar tu geolocalización.
            </div>
          </div>
        ) : (
          /* Lobby Form */
          <div className="space-y-5">
            {/* SecLink Box with Unique Link copy */}
            <div className="bg-zinc-900/40 border-2 border-zinc-800 p-3.5 rounded-lg flex items-center justify-between">
              <div className="flex-1 pr-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ENLACE SÚPER ANÓNIMO</span>
                <p className="text-xs font-mono tracking-tight text-emerald-400 truncate mt-0.5">anonsphere.sh/invite/x{currentUserId.slice(-6)}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="bg-white hover:bg-zinc-200 text-black p-2 rounded cursor-pointer transition active:scale-95 shrink-0 flex items-center gap-1 text-[11px] font-bold"
                id="btn-copy-instant-invite"
                title="Copiar invitación instantánea"
              >
                {inviteCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>Copiar</span>
              </button>
            </div>

            {/* Input Alias */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">Identidad de Sesión Anónima</label>
              <input
                type="text"
                maxLength={25}
                placeholder="Ingresa tu Alias Hacker..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 text-sm font-bold uppercase placeholder:text-zinc-700 text-white focus:outline-none focus:border-white transition rounded"
                id="input-setup-username"
              />
            </div>

            {/* Selector Avatar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">Avatar Cifrado ({selectedAvatar})</label>
              <div className="grid grid-cols-5 gap-2 bg-zinc-900/30 p-2 border border-zinc-800 rounded">
                {avatarsList.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedAvatar(item)}
                    className={`text-xl p-2 rounded transition-all ${
                      selectedAvatar === item 
                        ? "bg-white border-2 border-white scale-110 shadow-lg text-black" 
                        : "bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
                    }`}
                    id={`avatar-btn-${item}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Gustos / Temas para hacer match de forma directa */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline mb-1">
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">Intereses de Acoplamiento ({selectedInterests.length})</label>
                <span className="text-[10px] text-zinc-500 font-mono">Selecciona al menos uno</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {availableTastes.map(taste => {
                  const isChecked = selectedInterests.includes(taste);
                  return (
                    <button
                      key={taste}
                      type="button"
                      onClick={() => toggleInterest(taste)}
                      className={`text-xs font-bold px-3 py-2 border transition-all rounded ${
                        isChecked 
                          ? "bg-white text-black border-white shadow-md font-extrabold" 
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                      id={`interest-tag-${taste}`}
                    >
                      # {taste.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Large Matching Trigger Button (Bold Typography Style) */}
            <button
              onClick={handleStartMatching}
              className="w-full bg-white hover:bg-emerald-400 text-black font-black uppercase text-sm py-4 tracking-wider transition-all rounded shadow-md mt-4 active:scale-[0.98] flex items-center justify-center gap-2"
              id="btn-trigger-matchmakers"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              BUSCAR ACOPLAMIENTO DE SEGURIDAD
            </button>
          </div>
        )}
      </div>
    );
  }

  // Calculate matching dynamic levels
  const partner = activeRoom.user1.id === currentUserId ? activeRoom.user2 : activeRoom.user1;
  const closenessPoints = activeRoom.closenessPoints;
  const level = activeRoom.closenessLevel; // 1 to 4

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Header of the match room */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] relative shrink-0">
            {partner.avatar}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-[8px] font-bold text-black font-mono">
              ★
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm uppercase tracking-tight truncate max-w-[140px]">
                {partner.name}
              </h3>
              {partner.isSimulated && (
                <span className="text-[8px] font-mono bg-zinc-800 text-zinc-500 px-1 rounded uppercase font-semibold">BOT_ENC</span>
              )}
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">
              INTERESES: {activeRoom.interests.join(", ")}
            </p>
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={handleLeaveRoom}
          className="text-xs font-mono text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 px-3 py-1.5 rounded transition uppercase tracking-tight active:scale-95"
          id="btn-leave-chat-room"
        >
          DESCONECTAR
        </button>
      </div>

      {/* CLoseness Level Meter - High Impact Bold Aesthetics */}
      <div className="bg-zinc-950 p-3 border-b border-zinc-800 shrink-0 select-none">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
            Nivel {level} / 4 de Ocultación de Perfil
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-1 rounded">
            PROXIMIDAD: {closenessPoints}%
          </span>
        </div>

        {/* Grid segmented progress indicators */}
        <div className="grid grid-cols-4 gap-1.5 h-3">
          <div className={`h-full border transition-all rounded-sm ${closenessPoints >= 5 ? "bg-white border-white shadow-[0_0_8px_white]" : "bg-zinc-900 border-zinc-800"}`} />
          <div className={`h-full border transition-all rounded-sm ${closenessPoints >= 30 ? "bg-emerald-400 border-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-zinc-900 border-zinc-800"}`} />
          <div className={`h-full border transition-all rounded-sm ${closenessPoints >= 70 ? "bg-blue-400 border-blue-400 shadow-[0_0_8px_#3b82f6]" : "bg-zinc-900 border-zinc-800"}`} />
          <div className={`h-full border transition-all rounded-sm ${closenessPoints >= 95 ? "bg-red-500 border-red-500 shadow-[0_0_8px_crimson]" : "bg-zinc-900 border-zinc-800"}`} />
        </div>

        <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1">
          <span>T1 Texto</span>
          <span className={level >= 2 ? "text-emerald-400" : ""}>T2 Audio</span>
          <span className={level >= 3 ? "text-blue-400" : ""}>T3 Silueta</span>
          <span className={level >= 4 ? "text-red-400" : ""}>T4 Identidad</span>
        </div>
      </div>

      {/* Active multimedia box based on unlocked layers */}
      {(isAudioCallActive || isCameraActive) && (
        <div className="bg-zinc-900 border-b border-zinc-800 shrink-0 p-3 font-mono text-xs text-center space-y-3 relative">
          
          {/* Audio call active stream with wavy oscillators */}
          {isAudioCallActive && (
            <div className="flex flex-col items-center justify-center py-2 relative bg-zinc-950 border border-zinc-800 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Canal de Audio Cifrado Symmetrical AES</span>
              </div>
              
              {/* Oscillator animation */}
              <div className="flex items-end justify-center gap-1 h-12 w-4/5 px-2">
                {audioFreqs.map((freq, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${freq}%` }}
                    className="w-1.5 bg-emerald-500 rounded-t transition-all duration-150"
                  />
                ))}
              </div>
              <p className="text-[8px] text-zinc-500 uppercase tracking-tight mt-1">Microphone access requested: Transmitting live encrypted data streams</p>
            </div>
          )}

          {/* Silhouette secure camera filter */}
          {isCameraActive && level >= 3 && (
            <div className="flex flex-col items-center justify-center bg-zinc-950 border border-zinc-800 rounded p-2 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 animate-pulse" />
                <span>DESCIFRADO_DE_SILUETA</span>
              </div>
              
              {/* HTML canvas & hidden video tags */}
              <video ref={videoRef} className="hidden" playsInline muted />
              <canvas ref={canvasRef} width={280} height={150} className="w-full max-w-[325px] h-[130px] rounded border border-zinc-800 bg-neutral-950" />
            </div>
          )}
        </div>
      )}

      {/* Message Stream Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950 scrollbar-thin">
        {activeRoom.messages.map((msg) => {
          if (msg.type === "system") {
            return (
              <div key={msg.id} className="text-center font-mono my-2 px-4 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded text-zinc-400 text-[10px] uppercase leading-relaxed max-w-full">
                {msg.content}
              </div>
            );
          }

          if (msg.type === "icebreaker") {
            return (
              <div key={msg.id} className="bg-zinc-900 border-2 border-white text-white p-3.5 rounded-lg my-3 shadow-[0_0_15px_rgba(255,255,255,0.05)] border-l-4 border-l-emerald-400">
                <span className="font-mono text-[9px] text-emerald-400 font-bold block mb-1">🔮 MEDIACIÓN DE INTELIGENCIA GEMINI</span>
                <p className="text-xs italic tracking-wide text-zinc-100">{msg.content}</p>
                <span className="text-[8px] font-mono text-zinc-500 float-right mt-1 font-semibold">Cercanía +15 Puntos</span>
                <div className="clear-both"></div>
              </div>
            );
          }

          const isMe = msg.sender === userName;
          return (
            <div key={msg.id} className={`flex gap-3 items-end ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base shrink-0 select-none shadow">
                  {partner.avatar}
                </div>
              )}
              
              <div className={`max-w-[260px] p-3 rounded-lg ${
                isMe 
                  ? "bg-white text-black rounded-tr-none shadow-md font-medium" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none font-sans"
              }`}>
                <p className={`font-mono text-[9px] mb-0.5 select-none ${isMe ? "text-zinc-500" : "text-zinc-600"}`}>
                  {isMe ? "[TÚ]" : `[${msg.sender.toUpperCase()}]`} • {msg.timestamp}
                </p>
                <p className="text-xs break-all whitespace-pre-wrap">{msg.content}</p>
              </div>

              {isMe && (
                <div className="w-8 h-8 rounded-full bg-white border border-white flex items-center justify-center text-base shrink-0 text-black font-black select-none shadow">
                  {userAvatar}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Control/Action dock based on closeness levels */}
      <div className="border-t border-zinc-800 bg-zinc-950 p-2.5 flex items-center gap-2 shrink-0">
        
        {/* Ask AI for Deep Icebreaker Prompt using server-side Gemini SDK */}
        <button
          onClick={handleGetAIIcebreaker}
          disabled={isGeneratingIcebreaker}
          className="flex-1 h-10 border border-zinc-800 hover:border-emerald-400 rounded-lg text-zinc-400 hover:text-emerald-400 text-[10px] font-mono uppercase tracking-tight flex items-center justify-center gap-1.5 transition disabled:opacity-40 active:scale-95"
          id="btn-ai-icebreaker-trigger"
          title="Generar pregunta profunda con Inteligencia Artificial"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{isGeneratingIcebreaker ? "GENERANDO..." : "AI ROMPEHIELOS"}</span>
        </button>

        {/* Level 2: Toggle Audio Call */}
        {level >= 2 ? (
          <button
            onClick={() => setIsAudioCallActive(prev => !prev)}
            className={`h-10 px-3.5 rounded-lg border flex items-center justify-center transition active:scale-95 ${
              isAudioCallActive 
                ? "bg-emerald-500 border-emerald-400 text-black font-black" 
                : "border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-400"
            }`}
            id="btn-toggle-audio-channel"
            title={isAudioCallActive ? "Silenciar llamada cifrada de voz" : "Transmitir llamada cifrada de voz"}
          >
            <Mic className="w-4 h-4" />
          </button>
        ) : (
          <div className="h-10 px-3.5 rounded-lg border border-zinc-900 text-zinc-800 cursor-not-allowed flex items-center justify-center" title="Llamadas cerradas. Sube al Nivel 2.">
            <Mic className="w-4 h-4 opacity-30" />
          </div>
        )}

        {/* Level 3: Toggle Silhouette Camera Stream */}
        {level >= 3 ? (
          <button
            onClick={() => setIsCameraActive(prev => !prev)}
            className={`h-10 px-3.5 rounded-lg border flex items-center justify-center transition active:scale-95 ${
              isCameraActive 
                ? "bg-blue-500 border-blue-400 text-black font-black" 
                : "border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-400"
            }`}
            id="btn-toggle-camera-channel"
            title={isCameraActive ? "Apagar cámara de silueta" : "Transmitir cámara de silueta encriptada"}
          >
            <Camera className="w-4 h-4" />
          </button>
        ) : (
          <div className="h-10 px-3.5 rounded-lg border border-zinc-900 text-zinc-800 cursor-not-allowed flex items-center justify-center" title="Video bloqueado. Sube al Nivel 3.">
            <Camera className="w-4 h-4 opacity-30" />
          </div>
        )}

        {/* Proximity Boost Vote Button */}
        <button
          onClick={handleVoteUpgrade}
          className="h-10 px-3.5 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white rounded-lg flex items-center justify-center transition active:scale-95 text-[10px] font-mono uppercase font-bold"
          id="btn-vote-closeness-upgrade"
          title="Votar para acelerar proximidad y destrabar canales"
        >
          🔐 ACELERAR (+30)
        </button>
      </div>

      {/* Level 4 option - Contact Swap container */}
      {level >= 4 && (
        <div className="bg-zinc-900 p-3 border-t border-zinc-800 text-center font-mono shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">⚠️ NIVEL 4 ALCANZADO: INTERCAMBIO DIRECTO</span>
            <span className="text-[8px] bg-red-400/10 text-red-400 px-1 py-0.5 rounded">OPCIONAL</span>
          </div>
          {shareContactRevealed ? (
            <div className="bg-zinc-950 p-2 border border-zinc-800 rounded text-center text-xs text-white">
              <span className="text-[10px] text-zinc-500 block">ENLACE SÚPER SEGURO DE RETROACTIVO:</span>
              <p className="font-extrabold text-emerald-400 break-all select-all mt-1">anon.im/swap?token=928a-vc20-u19b-cifa</p>
            </div>
          ) : (
            <button
              onClick={() => setShareContactRevealed(true)}
              className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase rounded transition active:scale-[0.98]"
              id="btn-reveal-identity-level-4"
            >
              Revelar Enlace de Contacto Seguro y Anónimo
            </button>
          )}
        </div>
      )}

      {/* Message Submission Area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-black border-t border-zinc-800 flex gap-2.5 shrink-0">
        <input
          type="text"
          required
          maxLength={150}
          placeholder="TRANSMITE ANÓNIMAMENTE..."
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-mono text-base uppercase tracking-tight text-white placeholder:text-zinc-800 font-bold"
          id="chat-text-input"
        />
        <button
          type="submit"
          className="bg-white hover:bg-emerald-400 text-black font-black px-6 py-2 text-xs uppercase tracking-tight transition rounded active:scale-[0.97]"
          id="chat-send-btn"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
