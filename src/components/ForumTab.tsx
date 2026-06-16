import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Plus, 
  Edit2, 
  Trash2, 
  CornerDownRight, 
  CheckCircle,
  HelpCircle,
  X,
  AlertTriangle
} from "lucide-react";
import { Topic, ForumPost, Comment } from "../types";

interface ForumTabProps {
  topics: Topic[];
  posts: ForumPost[];
  currentUserId: string;
  userName: string;
  onRefreshState: () => void;
  currentUserProgress?: { xp: number; level: number; achievements: string[] };
}

export default function ForumTab({
  topics,
  posts,
  currentUserId,
  userName,
  onRefreshState,
  currentUserProgress
}: ForumTabProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("3"); // default to Privacidad - Huida Digital Completa
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  // Topic Editor states
  const [isEditingTopic, setIsEditingTopic] = useState<boolean>(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string>("");
  const [topicDesc, setTopicDesc] = useState<string>("");
  const [topicCat, setTopicCat] = useState<string>("");

  // New Post state
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);

  // Comment state
  const [newCommentContent, setNewCommentContent] = useState<string>("");

  // Action Error state to hold 403 locks
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    // If selected topic becomes missing due to deletion, point to first available
    if (topics.length > 0 && !topics.some(t => t.id === selectedTopicId)) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  // Topic actions
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !topicDesc.trim()) return;

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingTopicId ? "edit" : "create",
          id: editingTopicId,
          name: topicName.trim(),
          description: topicDesc.trim(),
          category: topicCat.trim() || "General",
          userId: currentUserId
        })
      });
      if (response.ok) {
        setIsEditingTopic(false);
        setEditingTopicId(null);
        setTopicName("");
        setTopicDesc("");
        setTopicCat("");
        setActionError(null);
        onRefreshState();
      } else {
        const errData = await response.json();
        setActionError(errData.error || "Error al guardar el tema.");
        setIsEditingTopic(false);
      }
    } catch (err) {
      console.error("Error saving topic", err);
    }
  };

  const handleStartEditTopic = (topic: Topic) => {
    if (currentUserProgress?.level && currentUserProgress.level < 4) {
      setActionError("🔒 Rango Insuficiente. Editar categorías de discusión globales requiere ser Nivel 4: Espectro de Red.");
      return;
    }
    setEditingTopicId(topic.id);
    setTopicName(topic.name);
    setTopicDesc(topic.description);
    setTopicCat(topic.category);
    setIsEditingTopic(true);
  };

  const handleStartCreateTopic = () => {
    if (currentUserProgress?.level && currentUserProgress.level < 4) {
      setActionError("🔒 Rango Insuficiente. Crear categorías globales (temas) requiere ser Nivel 4 (Espectro de Red). ¡Participa en la comunidad para ganar XP!");
      return;
    }
    setEditingTopicId(null);
    setTopicName("");
    setTopicDesc("");
    setTopicCat("General");
    setIsEditingTopic(true);
  };

  const handleDeleteTopic = async (id: string, name: string) => {
    if (currentUserProgress?.level && currentUserProgress.level < 4) {
      setActionError("🔒 Rango Insuficiente. Eliminar categorías globales (temas) requiere ser Nivel 4 (Espectro de Red).");
      return;
    }
    if (!confirm(`¿Está seguro de eliminar el tema "${name}"? Se borrarán sus foros y comentarios.`)) {
      return;
    }
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id, userId: currentUserId })
      });
      if (response.ok) {
        setActionError(null);
        onRefreshState();
      } else {
        const errData = await response.json();
        setActionError(errData.error || "Error al eliminar el tema.");
      }
    } catch (err) {
      console.error("Error deleting topic", err);
    }
  };

  // Post Actions
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          author: userName || "Anónimo",
          userId: currentUserId
        })
      });
      if (response.ok) {
        setNewPostTitle("");
        setNewPostContent("");
        setIsCreatingPost(false);
        setActionError(null);
        onRefreshState();
      } else {
        const errData = await response.json();
        setActionError(errData.error || "Error al crear la transmisión.");
        setIsCreatingPost(false);
      }
    } catch (err) {
      console.error("Error creating post", err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", userId: currentUserId })
      });
      if (response.ok) {
        setActionError(null);
        onRefreshState();
      } else {
        const errData = await response.json();
        setActionError(errData.error || "Error al dar like.");
      }
    } catch (err) {
      console.error("Error liking post", err);
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    try {
      const response = await fetch(`/api/forum/posts/${postId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          author: userName || "Anónimo",
          commentContent: newCommentContent.trim(),
          userId: currentUserId
        })
      });
      if (response.ok) {
        setNewCommentContent("");
        setActionError(null);
        onRefreshState();
      } else {
        const errData = await response.json();
        setActionError(errData.error || "Error al añadir comentario.");
      }
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const filteredPosts = posts.filter(p => p.topicId === selectedTopicId);
  const currentTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-zinc-100 selection:bg-emerald-400 selection:text-black">
      {/* Upper bar with Theme Info */}
      <div className="bg-zinc-900/40 p-3 border-b border-zinc-800 flex justify-between items-center shrink-0 font-mono text-[9px] text-zinc-500">
        <span>ENLACE LOCK: crypt.sh/forum-v19</span>
        <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1 py-0.5 rounded">FOROS ENCRIPTADOS</span>
      </div>

      {actionError && (
        <div className="bg-red-950/80 border-b border-red-500 text-red-200 p-3 text-xs flex justify-between items-center shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-white ml-2 text-[10px] font-bold tracking-tighter uppercase whitespace-nowrap">
            [CERRAR]
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Topics Side Panel in Bold Typography Theme style */}
        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col bg-zinc-950/80 overflow-y-auto max-h-[220px] md:max-h-none shrink-0 scrollbar-thin">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">TEMAS PRINCIPALES</h2>
            <button
              onClick={handleStartCreateTopic}
              className="text-[10px] font-mono font-bold uppercase text-emerald-400 hover:text-white bg-emerald-400/10 border border-emerald-500/20 hover:border-emerald-500 px-2 py-1 rounded transition-all flex items-center gap-1 active:scale-95"
              id="btn-create-topic-trigger"
            >
              <Plus className="w-3 h-3" /> Añadir
            </button>
          </div>

          <div className="p-2 space-y-1.5 flex-1">
            {topics.map((topic, index) => {
              const isSelected = topic.id === selectedTopicId;
              const formattedIndex = String(index + 1).padStart(2, "0");
              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setActivePostId(null);
                  }}
                  className={`group p-3 rounded border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900/60"
                  }`}
                  id={`topic-item-${topic.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-mono ${isSelected ? "text-emerald-600 font-bold" : "text-zinc-500"}`}>
                      {formattedIndex} // {topic.category.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStartEditTopic(topic)}
                        className={`p-1 rounded transition-colors ${isSelected ? "hover:bg-zinc-100 text-zinc-700 hover:text-black" : "hover:bg-zinc-800 text-zinc-400 hover:text-white"}`}
                        title="Modificar Tema"
                        id={`btn-edit-topic-${topic.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id, topic.name)}
                        className={`p-1 rounded transition-colors ${isSelected ? "hover:bg-zinc-100 text-red-700 hover:text-red-900" : "hover:bg-zinc-800 text-zinc-400 hover:text-red-400"}`}
                        title="Eliminar Tema"
                        id={`btn-delete-topic-${topic.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className={`text-sm font-bold tracking-tight mt-1 ${isSelected ? "text-black" : "text-zinc-100"}`}>
                    {topic.name}
                  </h3>
                  <p className={`text-[10px] line-clamp-2 mt-1 leading-relaxed ${isSelected ? "text-zinc-700" : "text-zinc-400"}`}>
                    {topic.description}
                  </p>
                  {(() => {
                    const uniqueUsers = new Set<string>();
                    posts.filter(p => p.topicId === topic.id).forEach(post => {
                      if (post.author) uniqueUsers.add(post.author);
                      post.comments?.forEach(c => {
                        if (c.author) uniqueUsers.add(c.author);
                      });
                    });
                    const numUsers = uniqueUsers.size;
                    return numUsers > 0 ? (
                      <span className={`text-[8px] inline-flex items-center gap-1 font-mono font-black border px-1.5 py-0.5 mt-2 rounded uppercase tracking-wider animate-pulse ${
                        isSelected 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 pointer-events-none" 
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 pointer-events-none"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-emerald-400'}`}></span>
                        Activo ({numUsers} {numUsers === 1 ? 'Usuario' : 'Usuarios'})
                      </span>
                    ) : (
                      <span className={`text-[8px] inline-flex items-center gap-1 font-mono border px-1.5 py-0.5 mt-2 rounded uppercase tracking-wider ${
                        isSelected 
                          ? "bg-zinc-100 text-zinc-500 border-zinc-200 pointer-events-none" 
                          : "bg-zinc-900 text-zinc-500 border-zinc-800 pointer-events-none"
                      }`}>
                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></span>
                        Inactivo
                      </span>
                    );
                  })()}
                </div>
              );
            })}

            {topics.length === 0 && (
              <div className="p-8 text-center text-zinc-600 font-mono text-[10px]">
                No hay temas. Crea uno para empezar.
              </div>
            )}
          </div>
        </div>

        {/* Right Forum Posts Feed */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
          {/* Header of selected topic */}
          {currentTopic && (
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/10 flex justify-between items-start shrink-0">
              <div className="flex-1 pr-2">
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">{currentTopic.category}</span>
                <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight uppercase">
                  {currentTopic.name}
                </h2>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{currentTopic.description}</p>
              </div>

              {!isCreatingPost && (
                <button
                  onClick={() => {
                    if (currentUserProgress && currentUserProgress.level < 3) {
                      setActionError("🔒 Acceso Restringido. Publicar en los foros de discusión requiere ser Nivel 3 (Sombra Digital) para garantizar inmunidad en la red.");
                    } else {
                      setIsCreatingPost(true);
                    }
                  }}
                  className={`text-xs font-black px-4 py-2 hover:bg-emerald-400 transition-colors uppercase tracking-tight shrink-0 flex items-center gap-1 active:scale-95 ${
                    currentUserProgress && currentUserProgress.level < 3
                      ? "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
                      : "bg-white text-black cursor-pointer"
                  }`}
                  id="btn-trigger-create-post"
                >
                  {currentUserProgress && currentUserProgress.level < 3 ? "🔒 Bloqueado (Nvl 3)" : <><Plus className="w-4 h-4" /> Nuevo Post</>}
                </button>
              )}
            </div>
          )}

          {/* New Post Panel Container */}
          {isCreatingPost ? (
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 overflow-y-auto max-h-[300px] shrink-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Publicar en este Canal</h3>
                <button 
                  onClick={() => setIsCreatingPost(false)}
                  className="text-zinc-500 hover:text-white"
                  id="btn-cancel-post"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Título del Post (Sé directo)</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., CÓMO DETECTAR TELEMETRÍA EN CONTRAL CONTROL"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded font-mono text-xs uppercase placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400"
                    id="input-post-title"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Contenido de la Transmisión</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Introduce el código cibernético o argumento..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400 resize-none"
                    id="input-post-content"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPost(false)}
                    className="border border-zinc-800 text-zinc-400 text-[10px] font-mono uppercase px-3 py-1.5 hover:text-white"
                    id="btn-discard-post"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 text-black text-[10px] font-black uppercase px-4 py-1.5 hover:bg-emerald-400 transition-colors"
                    id="btn-submit-post"
                  >
                    Transmitir Cifrado
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Posts List Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {filteredPosts.map((post) => {
              const isExpanded = activePostId === post.id;
              return (
                <div
                  key={post.id}
                  className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition"
                  id={`post-card-${post.id}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">
                        Autor: <span className="text-zinc-300 font-bold">{post.author}</span> • {post.timestamp}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">
                        ID: {post.id.slice(-6)}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-zinc-100 uppercase tracking-tight mb-2">
                      {post.title}
                    </h4>

                    <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed pb-3 border-b border-zinc-800/60">
                      {post.content}
                    </p>

                    {/* Interaction Bar */}
                    <div className="flex items-center gap-4 pt-3 text-[10px] font-mono">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-all active:scale-95"
                        id={`btn-like-post-${post.id}`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-red-400/20 text-red-400" />
                        <span>{post.likes} COINCIDEN</span>
                      </button>

                      <button
                        onClick={() => setActivePostId(isExpanded ? null : post.id)}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-all active:scale-95"
                        id={`btn-expand-post-${post.id}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{post.comments.length} COMENTARIOS</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Comments Panel with Bold Styling */}
                  {isExpanded && (
                    <div className="bg-zinc-950 p-4 border-t border-zinc-800 space-y-3">
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="bg-zinc-900/60 p-2.5 border-l-2 border-emerald-400 text-xs">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="font-mono text-[9px] text-zinc-400 font-bold">{comment.author}</span>
                              <span className="text-[8px] font-mono text-zinc-600">{comment.timestamp}</span>
                            </div>
                            <p className="text-zinc-300 leading-relaxed">{comment.content}</p>
                          </div>
                        ))}

                        {post.comments.length === 0 && (
                          <p className="text-[10px] text-zinc-600 italic font-mono text-center py-2">
                            No hay respuestas en este nodo de transmisión. Sé el primero.
                          </p>
                        )}
                      </div>

                      {/* Reply Entry box */}
                      {currentUserProgress && currentUserProgress.level < 2 ? (
                        <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-zinc-500 shrink-0">
                          <span>🔒 Enviar comentarios requiere Rango Nivel 2 (Criptógrafo). Tienes {currentUserProgress.xp} XP.</span>
                          <span className="text-emerald-400">Participa en Match para subir</span>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2 pt-2 border-t border-zinc-900">
                          <input
                            type="text"
                            required
                            placeholder="TRANSMITIR COMENTARIO ANÓNIMO..."
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-white text-zinc-200 placeholder:text-zinc-700"
                            id={`input-comment-${post.id}`}
                          />
                          <button
                            type="submit"
                            className="bg-white text-black text-xs font-black px-4 hover:bg-emerald-400 transition"
                            id={`btn-submit-comment-${post.id}`}
                          >
                            ENVIAR
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
                Ninguna transmisión registrada en esta frecuencia.
                <br />
                ¡Sé el primero e inicia la discusión!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pop-Up Modal for editing or creating a topic. Uses heavy text blocky style to preserve Bold theme. */}
      {isEditingTopic && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-4 border-white text-white p-6 max-w-md w-full shadow-[0_0_50px_rgba(255,255,255,0.15)]">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-4">
              <h3 className="text-xl font-black italic tracking-tight">
                {editingTopicId ? "EDITAR CANAL DE DISCUSIÓN" : "CREAR NUEVO CANAL"}
              </h3>
              <button 
                onClick={() => setIsEditingTopic(false)}
                className="text-zinc-400 hover:text-white p-1"
                id="btn-close-topic-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Nombre del Tema</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., CRIPTO-ANARQUÍA URBANA"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-zinc-700 p-2 text-sm font-bold uppercase placeholder:text-zinc-600 focus:outline-none focus:border-white text-zinc-100"
                  id="input-topic-name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Descripción de la Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Canales alternativos de subsistencia fuera de la red bancaria..."
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-zinc-700 p-2 text-sm font-medium placeholder:text-zinc-600 focus:outline-none focus:border-white text-zinc-100"
                  id="input-topic-desc"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Categoría General</label>
                <select
                  value={topicCat}
                  onChange={(e) => setTopicCat(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-zinc-700 p-2 text-sm font-medium focus:outline-none focus:border-white text-zinc-100 uppercase font-mono"
                  id="select-topic-category"
                >
                  <option value="Privacidad">PRIVACIDAD EXTREMA</option>
                  <option value="Música">MÚSICA CYBERPUNK</option>
                  <option value="Filosofía">FILOSOFÍA Y CIENCIA</option>
                  <option value="Gaming">RETRO GAMING</option>
                  <option value="General">OTRO / GENERAL</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTopic(false)}
                  className="flex-1 border-2 border-zinc-700 py-2.5 text-xs font-mono uppercase font-bold text-zinc-400 hover:text-white"
                  id="btn-cancel-topic-save"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-black py-2.5 text-xs font-black uppercase tracking-tight hover:bg-emerald-400 transition"
                  id="btn-save-topic-submit"
                >
                  {editingTopicId ? "Guardar Cambios" : "Verificar Canal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
