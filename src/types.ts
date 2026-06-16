export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface ForumPost {
  id: string;
  topicId: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  category: string;
  isCustom?: boolean;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  type: "text" | "system" | "icebreaker";
  timestamp: string;
}

export interface MatchRoom {
  id: string;
  interests: string[];
  user1: { id: string; name: string; avatar: string; readyForNextLevel: boolean; isSimulated?: boolean };
  user2: { id: string; name: string; avatar: string; readyForNextLevel: boolean; isSimulated?: boolean };
  messages: Message[];
  closenessLevel: number;
  closenessPoints: number;
  unlockedAudio: boolean;
  unlockedCamera: boolean;
  unlockedIdentity: boolean;
  createdAt: string;
}

export interface AppState {
  topics: Topic[];
  posts: ForumPost[];
  rooms: MatchRoom[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  interests: string[];
}

export type AppTab = "match" | "forum" | "shield" | "topics";
