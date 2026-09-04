/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Database helper functions with fallback simulation if Supabase isn't configured yet
export async function getConversations(userId: string): Promise<Conversation[]> {
  if (!supabase || !isSupabaseConfigured) {
    // Fallback localStorage simulation for preview/guest mode
    try {
      const stored = localStorage.getItem(`pramaan_conversations_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
  return data || [];
}

export async function createConversation(userId: string, title: string = 'New Conversation'): Promise<Conversation> {
  if (!supabase || !isSupabaseConfigured) {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      user_id: userId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    try {
      const existing = await getConversations(userId);
      const updated = [newConv, ...existing];
      localStorage.setItem(`pramaan_conversations_${userId}`, JSON.stringify(updated));
    } catch {}
    return newConv;
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: userId, title }])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
  return data;
}

export async function getMessages(conversationId: string): Promise<ChatMessageRecord[]> {
  if (!supabase || !isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem(`pramaan_messages_${conversationId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  return data || [];
}

export async function saveMessageRecord(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessageRecord> {
  const msg: ChatMessageRecord = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    conversation_id: conversationId,
    role,
    content,
    created_at: new Date().toISOString()
  };

  if (!supabase || !isSupabaseConfigured) {
    try {
      const existing = await getMessages(conversationId);
      const updated = [...existing, msg];
      localStorage.setItem(`pramaan_messages_${conversationId}`, JSON.stringify(updated));

      // Update conversation updated_at
      const userId = localStorage.getItem('pramaan_current_user_id') || 'guest';
      const convs = await getConversations(userId);
      const conv = convs.find(c => c.id === conversationId);
      if (conv) {
        conv.updated_at = new Date().toISOString();
        if (role === 'user' && (conv.title === 'New Conversation' || !conv.title)) {
          conv.title = content.length > 45 ? content.substring(0, 45) + '...' : content;
        }
        localStorage.setItem(`pramaan_conversations_${userId}`, JSON.stringify(convs));
      }
    } catch {}
    return msg;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, role, content }])
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    throw error;
  }

  // Update conversation updated_at and auto-title if first user message
  const updatePayload: any = { updated_at: new Date().toISOString() };
  if (role === 'user') {
    // Check if conversation title is default
    const { data: convData } = await supabase
      .from('conversations')
      .select('title')
      .eq('id', conversationId)
      .single();

    if (convData && (convData.title === 'New Conversation' || !convData.title)) {
      updatePayload.title = content.length > 45 ? content.substring(0, 45) + '...' : content;
    }
  }

  await supabase
    .from('conversations')
    .update(updatePayload)
    .eq('id', conversationId);

  return data;
}

export async function deleteConversationRecord(conversationId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    try {
      const userId = localStorage.getItem('pramaan_current_user_id') || 'guest';
      const convs = await getConversations(userId);
      const updated = convs.filter(c => c.id !== conversationId);
      localStorage.setItem(`pramaan_conversations_${userId}`, JSON.stringify(updated));
      localStorage.removeItem(`pramaan_messages_${conversationId}`);
    } catch {}
    return;
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}
