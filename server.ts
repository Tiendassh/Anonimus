import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simulated DB structure
interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface ForumPost {
  id: string;
  topicId: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  category: string;
  created_by?: string;
  isCustom?: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  type: "text" | "system" | "icebreaker";
  timestamp: string;
}

interface MatchRoom {
  id: string;
  interests: string[];
  user1: { id: string; name: string; avatar: string; readyForNextLevel: boolean };
  user2: { id: string; name: string; avatar: string; readyForNextLevel: boolean; isSimulated?: boolean };
  messages: Message[];
  closenessLevel: number; // 1 to 4
  closenessPoints: number; // 0 to 100
  unlockedAudio: boolean;
  unlockedCamera: boolean;
  unlockedIdentity: boolean;
  createdAt: string;
}

interface AppState {
  topics: Topic[];
  posts: ForumPost[];
  rooms: MatchRoom[];
  lobby: { id: string; name: string; avatar: string; interests: string[] }[];
  userProgress?: Record<string, { xp: number; level: number; achievements: string[] }>;
}

const STATE_FILE = path.join(process.cwd(), "src", "db_simulated.json");

const defaultState: AppState = {
  topics: [
    { id: "1", name: "La Inteligencia Artificial y el Alma", description: "¿Podrá una IA llegar a sentir o tener conciencia real?", category: "Filosofía" },
    { id: "2", name: "Producción de Música Cyberpunk", description: "Técnicas de síntesis y hardware retro para sci-fi", category: "Música" },
    { id: "3", name: "Huida Digital Completa", description: "Cómo salir de las Big Tech de forma segura y anónima", category: "Privacidad" },
    { id: "4", name: "Videojuegos Retro de los 90s", description: "Joyas ocultas de la era de 16 y 32 bits", category: "Gaming" }
  ],
  posts: [
    {
      id: "post1",
      topicId: "3",
      title: "Uso de Proxies en cascada y DNS sobre HTTPS",
      content: "Amigos, les comparto mi configuración básica: DoH activo en navegador, routing DNS forzado y tres saltos cifrados. Esto evita que el ISP rastree los metadatos de las peticiones iniciales. ¿Alguien ha probado enrutamiento Onion directamente?",
      author: "Lobo Solitario",
      likes: 12,
      timestamp: "Hace 2 horas",
      comments: [
  { id: "c1", author: "Zorro Veloz", content: "El problema es la latencia de la red Onion. Para chats rápidos a veces se cuelga.", timestamp: "Hace 1 hora" },
  { id: "c2", author: "Ciber Gato", content: "Excelente aporte. Recomiendo usar DNS de Quad9 para mayor seguridad.", timestamp: "Hace 40 mins" }
]
    },
    {
      id: "post2",
      topicId: "1",
      title: "El test de Turing quedó obsoleto",
      content: "Hoy en día las inteligencias artificiales conversan mejor que la mitad de mis contactos. Ya no necesitamos medir si parece humana, sino qué es lo que realmente procesa adentro.",
      author: "León Errante",
      likes: 8,
      timestamp: "Hace 5 horas",
      comments: [
  { id: "c3", author: "Búho Sabio", content: "Totalmente de acuerdo, el test de Turing mide imitación, no comprensión.", timestamp: "Hace 3 horas" }
]
    }
  ],
  rooms: [],
  lobby: [],
  userProgress: {}
};

// Ensure directories exist
const dbDir = path.dirname(STATE_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function loadState(): AppState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.userProgress) {
        parsed.userProgress = {};
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error loading simulated state, using defaults:", e);
  }
  // Store default state initially
  saveState(defaultState);
  return defaultState;
}

function saveState(state: AppState) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving simulated state:", e);
  }
}

// Simulated automated responses inside chat rooms when paired with a simulated user
const SIMULATED_RESPONSES: Record<string, string[]> = {
  default: [
    "Vaya, qué interesante lo que comentas. ¿Crees que la privacidad es la lucha más importante en esta era?",
    "Opino muy parecido. Por cierto, ¿viste la lista de temas en el foro secundario? Me gusta la idea de desbloquear el audio aquí pronto.",
    "Jaja genial. Qué bueno que todo sea anónimo, uno habla con más soltura del tema sin miedo al prejuicio.",
    "Para destrabar el nivel 2 (Audio) necesitamos un poco más de cercanía conversational. ¿Te gustaría intentar contestar la propuesta del rompehielos de IA?",
    "Me encanta esta app porque puedo ser yo mismo al 100%. ¿Qué música escuchas normalmente cuando quieres concentrarte?",
    "Interesante... Mi alias viene de que me encanta la noche. ¿Eres más activo de noche o de día?",
    "Totalmente. ¡Vamos a ver si desbloqueamos el nivel de cámara para ver nuestras siluetas cifradas!"
  ],
  Música: [
    "Uff, la música cyberpunk con sintetizadores analógicos es de otro mundo. ¿Productor favorito? Me encanta Perturbator.",
    "¡Eso suena genial! A veces uso FL Studio para mezclar pads ambientales oscuros.",
    "Para descifrar el audio, dime: ¿prefieres ritmos rápidos o ritmos lentos y melancólicos?",
  ],
  Privacidad: [
    "Mantener la privacidad en la red es un derecho, no un crimen. ¡Me alegra que coincidamos en este gusto!",
    "Exacto, una VPN confiable y anonimato completo en foros de discusión es clave.",
    "¿Has probado compilar sistemas operativos limpios sin telemetría?"
  ],
  Filosofía: [
    "Si una inteligencia simula sentimientos a la perfección, ¿importa si realmente los siente? Esa es la duda existencial actual.",
    "Me vuela la cabeza pensar en el alma artificial. ¿Crees que estamos viviendo en una simulación?",
    "La filosofía existencialista nos enseña que creamos nuestro propio significado. Y aquí, anónimamente, es genial debatirlo."
  ]
};

// Automatically run simulated answers to keep app highly active and alive in development / previews
function triggerSimulatedResponse(roomId: string, interest: string) {
  setTimeout(() => {
    const state = loadState();
    const roomIndex = state.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return;
    const room = state.rooms[roomIndex];
    if (!room.user2 || !room.user2.isSimulated) return;

    // Pick a fitting response
    const pool = SIMULATED_RESPONSES[interest] || SIMULATED_RESPONSES.default;
    const messageIndex = Math.floor(Math.random() * pool.length);
    const content = pool[messageIndex];

    const newMsg: Message = {
      id: "sim_" + Math.random().toString(36).substring(2, 9),
      sender: room.user2.name,
      content,
      type: "text",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.messages.push(newMsg);

    // Also slowly increase points if chatting
    room.closenessPoints = Math.min(100, room.closenessPoints + 8);
    updateClosenessUnlocks(room);

    state.rooms[roomIndex] = room;
    saveState(state);
  }, 3500); // Wait 3.5s to feel natural
}

function updateClosenessUnlocks(room: MatchRoom) {
  // Level threshold mapping
  // Level 1: 0 - 30 points (Text only)
  // Level 2: 30 - 70 points (Audio call unlocked)
  // Level 3: 70 - 95 points (Camera stream unlocked)
  // Level 4: 95+ points (Full identity/contacts revealed option)
  
  const originalLevel = room.closenessLevel;
  
  if (room.closenessPoints >= 95) {
    room.closenessLevel = 4;
    room.unlockedIdentity = true;
    room.unlockedCamera = true;
    room.unlockedAudio = true;
  } else if (room.closenessPoints >= 70) {
    room.closenessLevel = 3;
    room.unlockedCamera = true;
    room.unlockedAudio = true;
  } else if (room.closenessPoints >= 30) {
    room.closenessLevel = 2;
    room.unlockedAudio = true;
  } else {
    room.closenessLevel = 1;
  }

  if (room.closenessLevel > originalLevel) {
    room.messages.push({
      id: "sys_" + Math.random().toString(36).substring(2, 9),
      sender: "SISTEMA",
      content: `⚠️ ¡Nivel de Cercanía aumentado! Has desbloqueado el Nivel ${room.closenessLevel}: ${
        room.closenessLevel === 2 ? "Llamadas de Audio Cifradas 🎙️" :
        room.closenessLevel === 3 ? "Transmisión de Cámara (Siluetas) 📷" :
        "Revelación de Contacto Opcional 🔐"
      }`,
      type: "system",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
}

// ----------------------------------------
// LEVEL & EXPERIENCE PROGRESSION SYSTEM
// ----------------------------------------
function addXp(
  state: AppState, 
  userId: string, 
  points: number, 
  achievementId?: string
): { xp: number; level: number; leveledUp: boolean; unlockedAchievement?: string } {
  if (!state.userProgress) {
    state.userProgress = {};
  }
  if (!state.userProgress[userId]) {
    state.userProgress[userId] = {
      xp: 0,
      level: 1,
      achievements: ["welcome"]
    };
  }

  const user = state.userProgress[userId];
  const oldLevel = user.level;
  user.xp += points;

  // Level thresholds: 
  // Level 1: 0 - 100 XP
  // Level 2: 100 - 300 XP
  // Level 3: 300 - 600 XP
  // Level 4: 600+ XP
  let calculatedLevel = 1;
  if (user.xp >= 600) {
    calculatedLevel = 4;
  } else if (user.xp >= 300) {
    calculatedLevel = 3;
  } else if (user.xp >= 100) {
    calculatedLevel = 2;
  }

  let leveledUp = false;
  if (calculatedLevel > oldLevel) {
    user.level = calculatedLevel;
    leveledUp = true;
    
    // Automatically grant level achievement milestone
    const milestoneAchievement = `level_${calculatedLevel}`;
    if (!user.achievements.includes(milestoneAchievement)) {
      user.achievements.push(milestoneAchievement);
    }
  }

  let unlockedAchievement: string | undefined = undefined;
  if (achievementId && !user.achievements.includes(achievementId)) {
    user.achievements.push(achievementId);
    unlockedAchievement = achievementId;
  }

  return {
    xp: user.xp,
    level: user.level,
    leveledUp,
    unlockedAchievement
  };
}

// ----------------------------------------
// API ENDPOINTS
// ----------------------------------------

// Fetch the entire application database state
app.get("/api/state", (req, res) => {
  const state = loadState();
  res.json(state);
});

// Fetch specific user's progress or create default
app.get("/api/user/progress", (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: "userId query parameter must be provided" });
  }

  const state = loadState();
  if (!state.userProgress) {
    state.userProgress = {};
  }
  if (!state.userProgress[userId]) {
    state.userProgress[userId] = {
      xp: 0,
      level: 1,
      achievements: ["welcome"]
    };
    saveState(state);
  }

  res.json({ success: true, progress: state.userProgress[userId] });
});

// Award XP for client-side actions
app.post("/api/user/action", (req, res) => {
  const { userId, actionId } = req.body;
  if (!userId || !actionId) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  const state = loadState();
  let points = 0;
  let achievementId: string | undefined = undefined;

  switch (actionId) {
    case "rotate_shield":
      points = 10;
      achievementId = "shield_master";
      break;
    case "toggle_doh":
    case "toggle_masking":
    case "toggle_cascade":
      points = 5;
      break;
    case "welcome_sync":
      points = 10;
      achievementId = "welcome";
      break;
    default:
      points = 0;
  }

  let result: { xp: number; level: number; leveledUp: boolean; unlockedAchievement?: string } = { xp: 0, level: 1, leveledUp: false, unlockedAchievement: undefined };
  if (points > 0) {
    result = addXp(state, userId, points, achievementId);
    saveState(state);
  } else {
    if (state.userProgress && state.userProgress[userId]) {
      result.xp = state.userProgress[userId].xp;
      result.level = state.userProgress[userId].level;
    }
  }

  res.json({
    success: true,
    progress: state.userProgress?.[userId] || { xp: 0, level: 1, achievements: ["welcome"] },
    ...result
  });
});

// Edit & Add/Delete Topics
app.post("/api/topics", (req, res) => {
  const { action, id, name, description, category, userId } = req.body;
  const state = loadState();

  // Enforce level lock (Level 4 needed to manage topics)
  if (userId) {
    if (!state.userProgress) {
      state.userProgress = {};
    }
    const currentLvl = state.userProgress[userId]?.level || 1;
    if (currentLvl < 4) {
      return res.status(403).json({ 
        error: "🔒 Acceso Restringido. Crear, modificar o eliminar categorías requiere ser Nivel 4: Espectro de Red." 
      });
    }
  }

  if (action === "create") {
    const newTopic: Topic = {
      id: "topic_" + Math.random().toString(36).substring(2, 9),
      name: name || "Nuevo Tema",
      description: description || "Sin descripción",
      category: category || "General",
      isCustom: true
    };
    state.topics.push(newTopic);
    
    let xpStatus = null;
    if (userId) {
      xpStatus = addXp(state, userId, 40);
    }
    
    saveState(state);
    return res.json({ success: true, topic: newTopic, state, xpStatus });
  }

  if (action === "edit") {
    const idx = state.topics.findIndex(t => t.id === id);
    if (idx !== -1) {
      state.topics[idx] = {
        ...state.topics[idx],
        name: name || state.topics[idx].name,
        description: description || state.topics[idx].description,
        category: category || state.topics[idx].category
      };
      saveState(state);
      return res.json({ success: true, topic: state.topics[idx], state });
    }
  }

  if (action === "delete") {
    state.topics = state.topics.filter(t => t.id !== id);
    // Also clean up associated forum posts to remain tidy
    state.posts = state.posts.filter(p => p.topicId !== id);
    saveState(state);
    return res.json({ success: true, state });
  }

  res.status(400).json({ error: "Acción inválida" });
});

// Forum posts endpoints
app.post("/api/forum/posts", (req, res) => {
  const { topicId, title, content, author, userId } = req.body;
  if (!topicId || !title || !content) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const state = loadState();

  // Enforce level lock (Level 3 needed to create posts)
  if (userId) {
    if (!state.userProgress) {
      state.userProgress = {};
    }
    const currentLvl = state.userProgress[userId]?.level || 1;
    if (currentLvl < 3) {
      return res.status(403).json({ 
        error: "🔒 Acceso Restringido. Crear nuevas transmisiones (posts) requiere ser Nivel 3: Sombra Digital." 
      });
    }
  }

  const newPost: ForumPost = {
    id: "post_" + Math.random().toString(36).substring(2, 9),
    topicId,
    title,
    content,
    author: author || "Anónimo",
    likes: 0,
    timestamp: "Hace unos instantes",
    comments: []
  };

  state.posts.push(newPost);
  
  let xpStatus = null;
  if (userId) {
    xpStatus = addXp(state, userId, 25, "first_post");
  }

  saveState(state);
  res.json({ success: true, post: newPost, state, xpStatus });
});

// Post action: like or add comment
app.post("/api/forum/posts/:id/action", (req, res) => {
  const { id } = req.params;
  const { action, author, commentContent, userId } = req.body;
  const state = loadState();

  const postIndex = state.posts.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post no encontrado" });
  }

  const post = state.posts[postIndex];

  // Enforce Level 2 lock for writing comments
  if (action === "comment" && userId) {
    if (!state.userProgress) {
      state.userProgress = {};
    }
    const currentLvl = state.userProgress[userId]?.level || 1;
    if (currentLvl < 2) {
      return res.status(403).json({ 
        error: "🔒 Acceso Restringido. Añadir comentarios a las transmisiones requiere ser Nivel 2: Criptógrafo." 
      });
    }
  }

  let xpStatus = null;

  if (action === "like") {
    post.likes += 1;
    if (userId) {
      xpStatus = addXp(state, userId, 5);
    }
  } else if (action === "comment") {
    if (!commentContent) return res.status(400).json({ error: "Comentario vacío" });
    const newComment: Comment = {
      id: "comment_" + Math.random().toString(36).substring(2, 9),
      author: author || "Sombra Anónima",
      content: commentContent,
      timestamp: "Hace un momento"
    };
    post.comments.push(newComment);
    if (userId) {
      xpStatus = addXp(state, userId, 15, "first_comment");
    }
  }

  state.posts[postIndex] = post;
  saveState(state);
  res.json({ success: true, post, state, xpStatus });
});

// Join Matchmaker Hub
app.post("/api/match/join", (req, res) => {
  const { userId, name, avatar, interests } = req.body;
  if (!userId || !name || !interests || interests.length === 0) {
    return res.status(400).json({ error: "Faltan datos de usuario o gustos" });
  }

  const state = loadState();

  // Clean stale/duplicate user rooms first or checks
  const existingRoom = state.rooms.find(r => 
    (r.user1.id === userId || (r.user2 && r.user2.id === userId)) &&
    r.closenessPoints < 100
  );

  if (existingRoom) {
    let xpStatus = null;
    if (userId) {
      xpStatus = addXp(state, userId, 5);
      saveState(state);
    }
    return res.json({ success: true, room: existingRoom, state, xpStatus });
  }

  // Look in current online lobby for compatible interests
  const opponentIndex = state.lobby.findIndex(l => 
    l.id !== userId && l.interests.some(i => interests.includes(i))
  );

  if (opponentIndex !== -1) {
    // Found someone! Establish a direct encrypted chat room!
    const opponent = state.lobby[opponentIndex];
    state.lobby.splice(opponentIndex, 1); // Remove competitor

    const sharedInterests = interests.filter((i: string) => opponent.interests.includes(i));

    const newRoom: MatchRoom = {
      id: "room_" + Math.random().toString(36).substring(2, 9),
      interests: sharedInterests,
      user1: { id: userId, name, avatar, readyForNextLevel: false },
      user2: { id: opponent.id, name: opponent.name, avatar: opponent.avatar, readyForNextLevel: false },
      messages: [
        {
          id: "sys_init",
          sender: "SISTEMA",
          content: `🔐 Canales cifrados vinculados exitosamente. Tienen en común: ${sharedInterests.join(", ")}. Nivel 1 activo (Sólo texto).`,
          type: "system",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      closenessLevel: 1,
      closenessPoints: 5,
      unlockedAudio: false,
      unlockedCamera: false,
      unlockedIdentity: false,
      createdAt: new Date().toISOString()
    };

    state.rooms.push(newRoom);
    
    let xpStatus = null;
    if (userId) {
      xpStatus = addXp(state, userId, 25, "first_match");
    }
    
    saveState(state);
    return res.json({ success: true, room: newRoom, state, xpStatus });
  }

  // If no one is matching in real-time, generate a simulated matching user in 1.5 seconds so they can test instantly!
  // This is great for developer preview and individual testing.
  const anonNames = ["Hacker Cuántico", "Sombra Verde", "Nómada Cifrado", "Eco Espectral", "Alfa Bit", "Gato Sigiloso", "Estrella Encriptada"];
  const anonAvatars = ["🦊", "🐉", "🐙", "🧙", "🦾", "👾", "🕶️"];
  const randomOpponentName = anonNames[Math.floor(Math.random() * anonNames.length)];
  const randomOpponentAvatar = anonAvatars[Math.floor(Math.random() * anonAvatars.length)];
  const matchedInterest = interests[0]; // Share at least one

  const newRoomSimulated: MatchRoom = {
    id: "room_sim_" + Math.random().toString(36).substring(2, 9),
    interests: [matchedInterest],
    user1: { id: userId, name, avatar, readyForNextLevel: false },
    user2: { 
      id: "simulated_user_" + Math.random().toString(36).substring(2, 9), 
      name: randomOpponentName, 
      avatar: randomOpponentAvatar, 
      readyForNextLevel: false,
      isSimulated: true 
    },
    messages: [
      {
        id: "sys_init",
        sender: "SISTEMA",
        content: `🔗 Conexión de proxy segura establecida. Encontraste un match anónimo con interés común en: ${matchedInterest}. Hablen de forma privada y aumenten la cercanía del canal.`,
        type: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: "sys_intro",
        sender: randomOpponentName,
        content: `¡Hola! Qué loco poder conversar así con alguien con gustos similares. Vi que a ambos nos interesa "${matchedInterest}". ¿A qué nivel te gustaría llegar hoy?`,
        type: "text",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    closenessLevel: 1,
    closenessPoints: 12,
    unlockedAudio: false,
    unlockedCamera: false,
    unlockedIdentity: false,
    createdAt: new Date().toISOString()
  };

  state.rooms.push(newRoomSimulated);
  
  let xpStatus = null;
  if (userId) {
    xpStatus = addXp(state, userId, 25, "first_match");
  }
  
  saveState(state);
  return res.json({ success: true, room: newRoomSimulated, state, xpStatus });
});

// Exit or close match room
app.post("/api/match/leave", (req, res) => {
  const { roomId, userId } = req.body;
  const state = loadState();
  state.rooms = state.rooms.filter(r => r.id !== roomId);
  // Also clean up any lobby users
  state.lobby = state.lobby.filter(l => l.id !== userId);
  saveState(state);
  res.json({ success: true, state });
});

// Send Chat Message and dynamically increase intimacy score
app.post("/api/chat/send", (req, res) => {
  const { roomId, sender, content, userId } = req.body;
  if (!roomId || !sender || !content) {
    return res.status(400).json({ error: "Faltan datos del mensaje" });
  }

  const state = loadState();
  const roomIndex = state.rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) {
    return res.status(404).json({ error: "Sala no encontrada" });
  }

  const room = state.rooms[roomIndex];
  const newMsg: Message = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    sender,
    content,
    type: "text",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  room.messages.push(newMsg);

  // Growth calculations for proximity
  // Each message grows the safety/closeness level by 6 points
  room.closenessPoints = Math.min(100, room.closenessPoints + 6);
  updateClosenessUnlocks(room);

  // Award +5 XP for sending chat message
  let xpStatus = null;
  if (userId) {
    xpStatus = addXp(state, userId, 5, "first_chat");
  }

  // If closeness reaches high points, award a massive points boost & milestone badge
  if (room.closenessPoints >= 100) {
    if (room.user1.id) addXp(state, room.user1.id, 50, "closeness_max");
    if (room.user2.id && !room.user2.isSimulated) addXp(state, room.user2.id, 50, "closeness_max");
  }

  state.rooms[roomIndex] = room;
  saveState(state);

  // Trigger simulated answer if user2 is simulated
  if (room.user2 && room.user2.isSimulated) {
    triggerSimulatedResponse(room.id, room.interests[0] || "default");
  }

  res.json({ success: true, room, state, xpStatus });
});

// Handle level/layer increase, votes or icebreaker requests
app.post("/api/chat/action", (req, res) => {
  const { roomId, userId, action } = req.body;
  const state = loadState();
  const roomIndex = state.rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) {
    return res.status(404).json({ error: "Sala no encontrada" });
  }

  const room = state.rooms[roomIndex];

  // Enforce Level 3 lock for proximity accelerator votes
  if (action === "vote" && userId) {
    if (!state.userProgress) {
      state.userProgress = {};
    }
    const currentLvl = state.userProgress[userId]?.level || 1;
    if (currentLvl < 3) {
      return res.status(403).json({ 
        error: "🔒 Acceso Restringido. Utilizar el acelerador de proximidad requiere ser Nivel 3 (Sombra Digital)." 
      });
    }
  }

  let xpStatus = null;

  if (action === "vote") {
    // Vote to immediately boost closeness (bypassing text volume)
    if (room.user1.id === userId) room.user1.readyForNextLevel = true;
    if (room.user2.id === userId) room.user2.readyForNextLevel = true;

    // Simulate opponent accepting vote quickly if opponent is simulated
    if (room.user2.isSimulated) {
      room.user2.readyForNextLevel = true;
    }

    if (userId) {
      xpStatus = addXp(state, userId, 15, "voter");
    }

    if (room.user1.readyForNextLevel && room.user2.readyForNextLevel) {
      // Both agreed! Grant substantial closeness points boost!
      room.closenessPoints = Math.min(100, room.closenessPoints + 30);
      room.user1.readyForNextLevel = false;
      room.user2.readyForNextLevel = false;

      room.messages.push({
        id: "sys_voted_" + Math.random().toString(36).substring(2, 9),
        sender: "SISTEMA",
        content: "🤝 ¡Ambas partes votaron a favor de acortar distancias! +30 Puntos de Acercamiento otorgados.",
        type: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      updateClosenessUnlocks(room);
      
      // Award extra points to both parties
      if (room.user1.id) addXp(state, room.user1.id, 20);
      if (room.user2.id && !room.user2.isSimulated) addXp(state, room.user2.id, 20);
    } else {
      room.messages.push({
        id: "sys_vote_req_" + Math.random().toString(36).substring(2, 9),
        sender: "SISTEMA",
        content: `🔑 Un usuario ha solicitado desbloquear la siguiente capa de cercanía. Esperando aceptación de la contraparte...`,
        type: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  // Award closeness_max if level upgraded
  if (room.closenessPoints >= 100) {
    if (room.user1.id) addXp(state, room.user1.id, 50, "closeness_max");
    if (room.user2.id && !room.user2.isSimulated) addXp(state, room.user2.id, 50, "closeness_max");
  }

  state.rooms[roomIndex] = room;
  saveState(state);
  res.json({ success: true, room, state, xpStatus });
});

// Call server-side Gemini wrapper to generate icebreaker prompt based on common interests
app.post("/api/ai/icebreaker", async (req, res) => {
  const { roomId, interests, userId } = req.body;
  if (!roomId || !interests) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const state = loadState();

  // Enforce Level 2 lock for Gemini AI requests
  if (userId) {
    if (!state.userProgress) {
      state.userProgress = {};
    }
    const currentLvl = state.userProgress[userId]?.level || 1;
    if (currentLvl < 2) {
      return res.status(403).json({ 
        error: "🔒 Acceso Restringido. Pedir ayuda del mediador IA Gemini requiere ser Nivel 2 (Criptógrafo)." 
      });
    }
  }

  let prompt = `Eres un mediador anónimo y seguro en una red de anonimato y chat llamada 'AnonSphere'.
Genera una pregunta profunda, atrapante y divertida para romper el hielo ('icebreaker') entre dos personas anónimas que comparten este interés común: ${interests.join(", ")}.
Debe ser en español, breve (máximo 140 caracteres), un tono cyberpunk, rebelde o intrigante, que les incite a filosofar o compartir secretos de forma segura sin revelar identidades reales. No uses formato markdown largo ni emojis exagerados (usa 1 o 2 discretos).`;

  try {
    let responseText = "Si tuvieras que ocultar tu hosting de la propia realidad, ¿en qué nodo elegirías nacer de nuevo? 🌌 Prueben debatir esto.";
    
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });
      if (response && response.text) {
        responseText = response.text.trim();
      }
    }

    const roomIndex = state.rooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
      state.rooms[roomIndex].messages.push({
        id: "ice_" + Math.random().toString(36).substring(2, 9),
        sender: "🔮 IA ICEBREAKER",
        content: responseText,
        type: "icebreaker",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      // Give points boost for requesting AI assistant!
      state.rooms[roomIndex].closenessPoints = Math.min(100, state.rooms[roomIndex].closenessPoints + 15);
      updateClosenessUnlocks(state.rooms[roomIndex]);

      let xpStatus = null;
      if (userId) {
        xpStatus = addXp(state, userId, 15, "ai_breaker");
      }

      saveState(state);
      return res.json({ success: true, room: state.rooms[roomIndex], state, xpStatus });
    }

    res.json({ success: true, generatedText: responseText });
  } catch (error: any) {
    console.error("Error generating icebreaker via Gemini SDK", error);
    res.json({ success: false, error: error.message });
  }
});


// ----------------------------------------
// DEV & STATIC SERVER MOUNTING
// ----------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

bootstrap();
