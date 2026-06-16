import React, { useState, useEffect } from "react";
import { Shield, EyeOff, Server, Disc, ChevronRight, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

interface ShieldTabProps {
  currentUserId: string;
  currentUserProgress?: { xp: number; level: number; achievements: string[] };
  onTriggerAction?: (actionId: string) => void;
}

export default function ShieldTab({ currentUserId, currentUserProgress, onTriggerAction }: ShieldTabProps) {
  const [shieldActive, setShieldActive] = useState(true);
  const [dohActive, setDohActive] = useState(true);
  const [httpMasking, setHttpMasking] = useState(true);
  const [proxyCascade, setProxyCascade] = useState(true);
  const [selectedMainNode, setSelectedMainNode] = useState("Reikiavik, Islandia");
  const [ping, setPing] = useState(48);
  const [logs, setLogs] = useState<string[]>([
    "▶️ Inicializando módulo de ocultación de hosting...",
    "🛡️ Shield activo: Ofuscación SSL/TLS de cabeceras habilitado.",
    "🌐 Nodo de salida establecido en Túnel Cifrado AES-256-GCM.",
    "🔒 DNS over HTTPS (DoH) resolviendo con Quad9.",
    "✅ Conexión anidada en 3 saltos: Viena -> Reikiavik -> Servidor local.",
  ]);

  // Handle randomly updating latencies and logs for realism
  useEffect(() => {
    const timer = setInterval(() => {
      setPing(prev => Math.max(30, Math.min(120, prev + Math.floor(Math.random() * 11) - 5)));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev.slice(0, 15)]);
  };

  const handleToggleShield = () => {
    const next = !shieldActive;
    setShieldActive(next);
    addLog(
      next
        ? "🛡️ MÓDULO PRINCIPAL SHIELD: Activado. Hosting oculto mediante máscara distribuida."
        : "⚠️ ADVERTENCIA: Shield principal desactivado. Tu IP de origen es parcialmente visible en metadatos del cliente."
    );
    if (onTriggerAction) onTriggerAction("rotate_shield");
  };

  const handleToggleDoh = () => {
    const next = !dohActive;
    setDohActive(next);
    addLog(
      next
        ? "🔒 DoH: Activado. Redirigiendo peticiones DNS de chat a puertos cifrados 443."
        : "⚠️ DoH: Desactivado. Operadores locales podrían registrar peticiones de resolución web."
    );
    if (onTriggerAction) onTriggerAction("toggle_doh");
  };

  const handleToggleHttpMasking = () => {
    const next = !httpMasking;
    setHttpMasking(next);
    addLog(
      next
        ? "🎭 Masking HTTP: Cabeceras de agente alteradas. Evitando huella digital móvil."
        : "⚠️ Masking HTTP: Desactivado. Navegador revelando identificador nativo."
    );
    if (onTriggerAction) onTriggerAction("toggle_masking");
  };

  const handleToggleProxyCascade = () => {
    const next = !proxyCascade;
    setProxyCascade(next);
    addLog(
      next
        ? "🔄 Cascade Proxy: Triplicando saltos de re-enrutamiento. Latencia modificada."
        : "⚠️ Cascade Proxy: Conexión directa activada. Latencia optimizada pero seguridad reducida."
    );
    if (onTriggerAction) onTriggerAction("toggle_cascade");
  };

  const rotateNode = () => {
    const nodes = [
      "Reikiavik, Islandia",
      "Zúrich, Suiza",
      "Ámsterdam, Países Bajos",
      "Estocolmo, Suecia",
      "Helsinki, Finlandia"
    ];
    const currentIdx = nodes.indexOf(selectedMainNode);
    const nextNode = nodes[(currentIdx + 1) % nodes.length];
    setSelectedMainNode(nextNode);
    addLog(`🔄 Rotando nodo de tunel de salida hacia: [${nextNode}]`);
    setPing(Math.floor(Math.random() * 60) + 40);
    if (onTriggerAction) onTriggerAction("rotate_shield");
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto font-mono text-xs select-none">
      {/* Title */}
      <div className="flex items-center gap-2.5 mb-4 shrink-0">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-widest">VPN & Hosting Shield</h2>
          <p className="text-[10px] text-neutral-400 font-sans">Sistema de ocultación y túneles seguros para tu anonimato</p>
        </div>
      </div>

      {/* Connection Status Box */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Estado de Ofuscación</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
            shieldActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}>
            {shieldActive ? "HOSTING ENCRIPTADO" : "CONEXIÓN EXPUESTA"}
          </span>
        </div>

        {/* Path visualization */}
        <div className="flex items-center justify-between bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-900 text-[10px] mb-3">
          <div className="text-center">
            <p className="text-neutral-500 pb-0.5">TÚ (Cliente)</p>
            <p className="text-emerald-400 font-semibold">[ID_CIFA]</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600 animate-pulse" />
          <div className="text-center">
            <p className="text-neutral-500 pb-0.5">NODO INTERMEDIO</p>
            <p className={proxyCascade ? "text-emerald-400" : "text-neutral-500 line-through"}>
              {proxyCascade ? "Zúrich (SSL)" : "Salto Omitido"}
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600 animate-pulse" />
          <div className="text-center">
            <p className="text-neutral-500 pb-0.5">TÚNEL DE SALIDA</p>
            <p className="text-emerald-400 font-semibold truncate max-w-[80px]">
              {selectedMainNode.split(",")[0]}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-neutral-950/40 p-2 rounded border border-neutral-900">
            <p className="text-neutral-500">Tasa de Cifrado</p>
            <p className="font-bold text-neutral-200">AES-256-GCM SSL</p>
          </div>
          <div className="bg-neutral-950/40 p-2 rounded border border-neutral-900">
            <p className="text-neutral-500">Latencia / Ping</p>
            <p className="font-bold text-emerald-400">{ping} ms (Estable)</p>
          </div>
        </div>
      </div>

      {/* Manual Configuration Panel */}
      <h3 className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Parámetros de Seguridad</h3>
      <div className="space-y-2 mb-4">
        {/* Toggle 1: Total host hiding */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-900 hover:bg-neutral-900/60 transition-all">
          <div className="flex items-center gap-2">
            <EyeOff className={`w-4 h-4 ${shieldActive ? "text-emerald-400" : "text-neutral-500"}`} />
            <div>
              <p className="font-medium text-neutral-200 text-[11px]">Enmascarar Servidor Principal</p>
              <p className="text-[9px] text-neutral-500 font-sans">Usa proxies inversos para que la IP del servidor sea irrastreable</p>
            </div>
          </div>
          <button
            onClick={handleToggleShield}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              shieldActive ? "bg-emerald-500" : "bg-neutral-800"
            }`}
            id="shield-toggle-active"
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              shieldActive ? "transform translate-x-5" : ""
            }`}></div>
          </button>
        </div>

        {/* Toggle 2: DNS over HTTPS */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-900 hover:bg-neutral-900/60 transition-all">
          <div className="flex items-center gap-2">
            <Server className={`w-4 h-4 ${dohActive ? "text-emerald-400" : "text-neutral-500"}`} />
            <div>
              <p className="font-medium text-neutral-200 text-[11px]">DNS over HTTPS (DoH)</p>
              <p className="text-[9px] text-neutral-500 font-sans">Evita que tu proveedor de internet registre el tráfico de la app</p>
            </div>
          </div>
          <button
            onClick={handleToggleDoh}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              dohActive ? "bg-emerald-500" : "bg-neutral-800"
            }`}
            id="shield-toggle-doh"
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              dohActive ? "transform translate-x-5" : ""
            }`}></div>
          </button>
        </div>

        {/* Toggle 3: HTTP Host Masking */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-900 hover:bg-neutral-900/60 transition-all">
          <div className="flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${httpMasking ? "text-emerald-400" : "text-neutral-500"}`} />
            <div>
              <p className="font-medium text-neutral-200 text-[11px]">Inyección de HTTPS Falso (Masking)</p>
              <p className="text-[9px] text-neutral-500 font-sans">Genera peticiones ruidosas imitando tráfico de redes sociales</p>
            </div>
          </div>
          <button
            onClick={handleToggleHttpMasking}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              httpMasking ? "bg-emerald-500" : "bg-neutral-800"
            }`}
            id="shield-toggle-masking"
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              httpMasking ? "transform translate-x-5" : ""
            }`}></div>
          </button>
        </div>

        {/* Toggle 4: Cascade network proxy */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-900 hover:bg-neutral-900/60 transition-all">
          <div className="flex items-center gap-2">
            <Disc className={`w-4 h-4 ${proxyCascade ? "text-emerald-400" : "text-neutral-500"}`} />
            <div>
              <p className="font-medium text-neutral-200 text-[11px]">Salto Multifásico (Cascade Tunnel)</p>
              <p className="text-[9px] text-neutral-500 font-sans">Multiplica el tráfico por 3 capas redundantes antes de la entrega</p>
            </div>
          </div>
          <button
            onClick={handleToggleProxyCascade}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              proxyCascade ? "bg-emerald-500" : "bg-neutral-800"
            }`}
            id="shield-toggle-cascade"
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              proxyCascade ? "transform translate-x-5" : ""
            }`}></div>
          </button>
        </div>
      </div>

      {/* Button to rotate hosting shield node */}
      <button
        onClick={rotateNode}
        className="w-full py-2.5 bg-neutral-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all mb-4 flex items-center justify-center gap-2 shrink-0 active:scale-95"
        id="btn-rotate-shield-node"
      >
        <Server className="w-3.5 h-3.5" />
        Rotar Canal de Salida Secure VPN
      </button>

      {/* Real-Time Security Log Console */}
      <h3 className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Logs del Canal Cifrado</h3>
      <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-900 max-h-[110px] overflow-y-auto font-mono text-[9px] text-zinc-400 leading-relaxed scrollbar-thin">
        {logs.map((log, index) => (
          <div key={index} className="border-b border-neutral-900/40 py-1 font-mono tracking-wide">
            <span className="text-emerald-600 font-semibold">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>{" "}
            {log}
          </div>
        ))}
      </div>

      {/* Advanced Level-4 diagnostics details */}
      {currentUserProgress?.level && currentUserProgress.level >= 4 ? (
        <div className="mt-3 bg-emerald-950/20 text-emerald-400 p-2.5 rounded border border-emerald-500/30 text-[9px] font-mono leading-normal">
          ⚡ MODO ESPECTRO DE RED (NIVEL 4): Acceso completo a metadatos de enrutamiento habilitado. Nodos intermedios estables. Servidor virtualizado a salvo.
        </div>
      ) : (
        <div className="mt-3 bg-neutral-900/60 text-zinc-500 p-2.5 rounded text-[9px] font-mono leading-normal text-center border border-neutral-800">
          🔒 Consola de diagnóstico avanzada bloqueada. Alcanza el Nivel 4 (Espectro de Red) para descifrar telemetría interna del host.
        </div>
      )}
    </div>
  );
}
