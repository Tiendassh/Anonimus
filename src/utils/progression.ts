export interface LevelConfig {
  level: number;
  name: string;
  badge: string;
  minXp: number;
  unlocks: string[];
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: "Sombra Básica",
    badge: "👤",
    minXp: 0,
    unlocks: ["Lectura del foro de seguridad", "Chat de match básico"]
  },
  {
    level: 2,
    name: "Criptógrafo",
    badge: "🕵️",
    minXp: 100,
    unlocks: ["Comentar en publicaciones", "Invocar al oráculo IA Gemini"]
  },
  {
    level: 3,
    name: "Sombra Digital",
    badge: "👁️‍🗨️",
    minXp: 300,
    unlocks: ["Crear publicaciones (posts)", "Usar acelerador de proximidad"]
  },
  {
    level: 4,
    name: "Espectro de Red",
    badge: "🌌",
    minXp: 600,
    unlocks: ["Crear y gestionar categorías globales (temas)", "Visualizar logs avanzados del sistema"]
  }
];

export interface AchievementConfig {
  id: string;
  name: string;
  desc: string;
  icon: string;
  xpValue: number;
}

export const ACHIEVEMENTS: AchievementConfig[] = [
  { id: "welcome", name: "Primera Huella", desc: "Sincronizaste con los nodos principales de la red", icon: "🌐", xpValue: 10 },
  { id: "shield_master", name: "Inmunidad Activa", desc: "Activaste o configuraste filtros en el Escudo de Privacidad", icon: "🛡️", xpValue: 10 },
  { id: "first_match", name: "Clave Compartida", desc: "Estableciste un túnel privado de chat exitoso con match", icon: "🔗", xpValue: 25 },
  { id: "first_chat", name: "Eco Seguro", desc: "Sintonizaste tu primer mensaje cifrado en un canal", icon: "💬", xpValue: 5 },
  { id: "first_post", name: "Transmisor", desc: "Creaste tu primera publicación (post) en el foro", icon: "📡", xpValue: 25 },
  { id: "first_comment", name: "Rompimiento Silencioso", desc: "Inyectaste comentario constructivo en un post", icon: "✏️", xpValue: 15 },
  { id: "ai_breaker", name: "Alquimia Inteligente", desc: "Invocaste al mediador de IA Gemini para desvelar un icebreaker", icon: "🔮", xpValue: 15 },
  { id: "voter", name: "Aceleración Mutua", desc: "Votaste a favor de acortar la distancia de confianza en canal", icon: "⚡", xpValue: 15 },
  { id: "closeness_max", name: "Cero Absoluto", desc: "Alcanzaste cercanía Nivel 4 y revelación opcional de contacto", icon: "🔓", xpValue: 50 },
  { id: "level_2", name: "Rango: Nivel 2", desc: "Ascendiste exitosamente al rango de Criptógrafo", icon: "🎖️", xpValue: 20 },
  { id: "level_3", name: "Rango: Nivel 3", desc: "Ascendiste exitosamente al rango de Sombra Digital", icon: "🎖️", xpValue: 40 },
  { id: "level_4", name: "Rango: Nivel 4", desc: "Ascendiste exitosamente al rango supremo de Espectro de Red", icon: "👑", xpValue: 80 }
];
