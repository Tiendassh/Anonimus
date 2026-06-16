import React, { useState, useEffect } from "react";
import { AppState, MatchRoom, Topic, ForumPost, AppTab } from "./types";
import DeviceWrapper from "./components/DeviceWrapper";
import MatchTab from "./components/MatchTab";
import ForumTab from "./components/ForumTab";
import ShieldTab from "./components/ShieldTab";
import { 
  ShieldCheck, 
  Settings, 
  HelpCircle, 
  Users, 
  MessageSquare, 
  Disc, 
  Shield, 
  Edit3, 
  Trash2,
  Plus
} from "lucide-react";

export default function App() {
  const [tab, setTab] = useState<AppTab>("match");
  const [loading, setLoading] = useState<boolean>(true);
  const [appState, setAppState] = useState<AppState>({
    topics: [],
    posts: [],
    rooms: []
  });

  // Keep a persistent single randomized user ID and details for the session
  const [currentUserId] = useState<string>(() => {
    return "usr_" + Math.random().toString(36).substring(2, 9);
  });
  const [userName, setUserName] = useState<string>("Ciber Nómada");
  const [userAvatar, setUserAvatar] = useState<string>("🦊");
  const [userInterests, setUserInterests] = useState<string[]>(["Privacidad"]);

  // Tracks the current active chat room
  const [activeRoom, setActiveRoom] = useState<MatchRoom | null>(null);

  // Load and refresh state from backend
  const refreshState = async () => {
    try {
      const response = await fetch("/api/state");
      if (response.ok) {
        const data: AppState = await response.json();
        setAppState(data);

        // Keep active room in sync if in a chat
        if (activeRoom) {
          const updatedActive = data.rooms.find(r => r.id === activeRoom.id);
          if (updatedActive) {
            setActiveRoom(updatedActive);
          } else {
            // Room was disbanded or closed
            setActiveRoom(null);
          }
        }
      }
    } catch (e) {
      console.error("Error refreshing state", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
    // Poll state every 4 seconds to simulate other client interactions in backend
    const interval = setInterval(() => {
      refreshState();
    }, 4500);

    return () => clearInterval(interval);
  }, [activeRoom?.id]);

  const handleSetUserProfile = (name: string, avatar: string, tastes: string[]) => {
    setUserName(name);
    setUserAvatar(avatar);
    setUserInterests(tastes);
  };

  // Dedicated Topics Panel state (for the topics list editor tab option)
  const [isCreatingTopic, setIsCreatingTopic] = useState<boolean>(false);
  const [newTName, setNewTName] = useState<string>("");
  const [newTDesc, setNewTDesc] = useState<string>("");
  const [newTCat, setNewTCat] = useState<string>("Privacidad");

  const handleAddNewTopicViaTab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTName.trim() || !newTDesc.trim()) return;

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newTName.trim(),
          description: newTDesc.trim(),
          category: newTCat
        })
      });
      if (response.ok) {
        setNewTName("");
        setNewTDesc("");
        setNewTCat("Privacidad");
        setIsCreatingTopic(false);
        refreshState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopicViaTab = async (id: string, name: string) => {
    if (!confirm(`¿Se eliminará el tema "${name}" de forma permanente?`)) return;
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
      });
      if (response.ok) {
        refreshState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DeviceWrapper>
      <div className="flex-1 flex flex-col bg-zinc-950 text-white overflow-hidden font-sans">
        
        {/* Main Bold Header (ANONYMA) */}
        <header className="p-5 border-b border-zinc-800 bg-zinc-950 flex justify-between items-end shrink-0 select-none">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
              Secure Link: crypt.sh/x92-v01
            </span>
            <h1 className="text-5xl font-black tracking-tighter leading-none text-white">
              ANONYMA
            </h1>
          </div>
          
          <div className="text-right">
            <div className="text-[8px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded inline-block mb-1">
              HOSTING MASKED: ACTIVE
            </div>
            <div className="flex gap-2 items-center justify-end">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">LIVE: 142</span>
            </div>
          </div>
        </header>

        {/* Navigation Tabs (Bold Aesthetic Pairs) */}
        <nav className="flex border-b border-zinc-800 bg-black text-[10px] font-mono tracking-tight font-black uppercase shrink-0">
          <button 
            onClick={() => setTab("match")}
            className={`flex-1 text-center py-3.5 border-r border-zinc-800 transition-all ${
              tab === "match" 
                ? "bg-white text-black font-extrabold" 
                : "text-zinc-400 hover:text-white"
            }`}
            id="tab-btn-match"
          >
            01 // COUPLING MATCH
          </button>
          
          <button 
            onClick={() => setTab("forum")}
            className={`flex-1 text-center py-3.5 border-r border-zinc-800 transition-all ${
              tab === "forum" 
                ? "bg-white text-black font-extrabold" 
                : "text-zinc-400 hover:text-white"
            }`}
            id="tab-btn-forums"
          >
            02 // CHAT FORUMS
          </button>

          <button 
            onClick={() => setTab("topics")}
            className={`flex-1 text-center py-3.5 border-r border-zinc-800 transition-all ${
              tab === "topics" 
                ? "bg-white text-black font-extrabold" 
                : "text-zinc-400 hover:text-white"
            }`}
            id="tab-btn-topics"
          >
            03 // LISTA DE TEMAS
          </button>

          <button 
            onClick={() => setTab("shield")}
            className={`flex-1 text-center py-3.5 transition-all ${
              tab === "shield" 
                ? "bg-white text-black font-extrabold" 
                : "text-zinc-400 hover:text-white"
            }`}
            id="tab-btn-shield"
          >
            04 // HOST SHIELD
          </button>
        </nav>

        {/* Content Panel Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 font-mono text-xs">
              <div className="relative mb-4">
                <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
              </div>
              <span className="text-zinc-400 font-semibold tracking-wider">CARGANDO SERVICIO ANONYMA...</span>
            </div>
          ) : (
            <>
              {tab === "match" && (
                <MatchTab
                  topics={appState.topics}
                  currentUserId={currentUserId}
                  userName={userName}
                  userAvatar={userAvatar}
                  userInterests={userInterests}
                  activeRoom={activeRoom}
                  onSetUserProfile={handleSetUserProfile}
                  onSetActiveRoom={setActiveRoom}
                  onRefreshState={refreshState}
                />
              )}

              {tab === "forum" && (
                <ForumTab
                  topics={appState.topics}
                  posts={appState.posts}
                  currentUserId={currentUserId}
                  userName={userName}
                  onRefreshState={refreshState}
                />
              )}

              {tab === "topics" && (
                /* Dedicated screen listing topics with custom edit controls to satisfy "lista de temas a editar" thoroughly */
                <div className="flex-1 flex flex-col p-5 overflow-y-auto bg-zinc-950 scrollbar-thin">
                  <div className="flex justify-between items-baseline mb-4 border-b border-zinc-800 pb-3">
                    <div>
                      <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-wider">LISTA DE TEMAS EN SISTEMA</h2>
                      <p className="text-[10px] text-zinc-500 font-mono">Modifica, edita o elimina parámetros de discusión</p>
                    </div>
                    {!isCreatingTopic && (
                      <button
                        onClick={() => setIsCreatingTopic(true)}
                        className="bg-white text-black text-xs font-black px-4 py-2 hover:bg-emerald-400 transition uppercase tracking-tight flex items-center gap-1"
                        id="btn-add-topic-tab"
                      >
                        <Plus className="w-4 h-4" /> Nuevo Tema
                      </button>
                    )}
                  </div>

                  {isCreatingTopic && (
                    <form onSubmit={handleAddNewTopicViaTab} className="bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl mb-6 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Añadir Nuevo Canal de Conversación</span>
                        <button 
                          type="button" 
                          onClick={() => setIsCreatingTopic(false)}
                          className="text-zinc-500 hover:text-white font-mono text-xs"
                          id="btn-close-topic-form-tab"
                        >
                          Cerrar [X]
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Nombre Temático</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., INTELIGENCIA EMOCIONAL SINTÉTICA"
                          value={newTName}
                          onChange={(e) => setNewTName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs font-bold text-white uppercase focus:outline-none focus:border-white"
                          id="input-topic-name-tab"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Filtro de Descripción</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., Discusión sobre si los bots cibernéticos de chat merecen considerarse amigos..."
                          value={newTDesc}
                          onChange={(e) => setNewTDesc(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs text-white focus:outline-none focus:border-white"
                          id="input-topic-desc-tab"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Categoría Temática</label>
                        <select
                          value={newTCat}
                          onChange={(e) => setNewTCat(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-white"
                          id="select-topic-cat-tab"
                        >
                          <option value="Privacidad">PRIVACIDAD EXTREMA</option>
                          <option value="Música">MÚSICA CYBERPUNK</option>
                          <option value="Filosofía">FILOSOFÍA Y CIENCIA</option>
                          <option value="Gaming">RETRO GAMING</option>
                          <option value="General">OTROS HOBBIES</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="bg-emerald-500 text-black text-xs font-black uppercase px-5 py-2.5 hover:bg-emerald-400"
                          id="btn-submit-topic-tab"
                        >
                          Guardar Canal en DB
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingTopic(false)}
                          className="border border-zinc-800 text-zinc-400 text-xs font-mono uppercase px-4 py-2.5 hover:text-white"
                          id="btn-discard-topic-tab"
                        >
                          Descartar
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of current topics inside Tab */}
                  <div className="grid grid-cols-1 gap-3">
                    {appState.topics.map((item, index) => (
                      <div 
                        key={item.id}
                        className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex items-start justify-between gap-4 hover:border-zinc-700 transition"
                        id={`topic-item-row-${item.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="text-[8px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              ID: {item.id}
                            </span>
                            {(() => {
                              const uniqueUsers = new Set<string>();
                              appState.posts.filter(p => p.topicId === item.id).forEach(post => {
                                if (post.author) uniqueUsers.add(post.author);
                                post.comments?.forEach(c => {
                                  if (c.author) uniqueUsers.add(c.author);
                                });
                              });
                              const numUsers = uniqueUsers.size;
                              return numUsers > 0 ? (
                                <span className="text-[8px] font-mono font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                  Activo ({numUsers} {numUsers === 1 ? 'Usuario' : 'Usuarios'})
                                </span>
                              ) : (
                                <span className="text-[8px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                                  Inactivo
                                </span>
                              );
                            })()}
                          </div>
                          <h4 className="text-sm font-extrabold text-zinc-100 uppercase tracking-tight">
                            {index + 1}. {item.name}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                          <button
                            onClick={() => {
                              // Pivot user to forum tab with this topic selected
                              setTab("forum"); 
                              // we let ForumTab handle the active editing through its own loaded hooks!
                            }}
                            className="bg-white hover:bg-emerald-400 text-black font-mono text-[9px] font-black uppercase px-2.5 py-1.5 rounded transition flex items-center gap-1"
                            id={`btn-manage-topic-pivot-${item.id}`}
                          >
                            <Edit3 className="w-3 h-3" /> Editar
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTopicViaTab(item.id, item.name)}
                            className="border border-dashed border-red-500/20 hover:border-red-500 text-red-400 hover:bg-red-500/10 font-mono text-[9px] font-bold uppercase px-2.5 py-1.5 rounded transition"
                            id={`btn-delete-topic-via-tab-${item.id}`}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {appState.topics.length === 0 && (
                      <div className="p-12 text-center text-zinc-600 font-mono text-xs border border-zinc-800/80 rounded-xl">
                        Aún no se han configurado canales temáticos en el enrutador virtual.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === "shield" && (
                <ShieldTab />
              )}
            </>
          )}
        </div>
        
        {/* Network Status Footer */}
        <footer className="bg-black border-t border-zinc-800 px-5 py-3.5 flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold tracking-widest text-emerald-400 uppercase">ANON_PROTO_V9</span>
          </div>
          <div>
            IP_MASK: <span className="text-zinc-300 font-semibold uppercase font-mono bg-zinc-900 px-1 rounded inline-block">109.112.55.* [PROXIED]</span>
          </div>
        </footer>
      </div>
    </DeviceWrapper>
  );
}
