export type UserRole = 'ADMIN' | 'INVESTOR';
export type UserStatus = 'PENDING' | 'APPROVED' | 'BLOCKED';

export interface UserContext {
  id: number;
  role: UserRole;
  status: UserStatus;
}

export interface CreateConversationInput {
  userId: number;
}

export interface CreateMessageInput {
  convoId: number;
  text: string;
  userId: number;
}

export interface MessageData {
  id: number;
  text: string;
  createdAt: Date;
}

export interface ConversationData {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string;
  };
  messages: MessageData[];
  createdAt: Date;
}