import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, ChevronRight, X, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Conversation } from '../lib/supabase';

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isLoading: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoading,
  isOpenMobile,
  onCloseMobile
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setDeleteConfirmId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#f8fafc] border-r border-gray-200 w-72 shrink-0 select-none">
      {/* New Chat Button */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#0B3D6B] hover:bg-[#093054] text-white py-2.5 px-4 rounded-xl font-medium transition shadow-xs text-sm"
        >
          <Plus className="w-4 h-4 text-[#FF9933]" />
          <span>+ New Chat</span>
        </button>
      </div>

      {/* Chat History Header */}
      <div className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
        <span>Chat History</span>
        <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
          {conversations.length}
        </span>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0B3D6B]" />
            <span className="text-xs">Loading history...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#0B3D6B]" />
            <p className="text-xs font-medium text-gray-600">No previous chats</p>
            <p className="text-[11px] text-gray-400 mt-1">Start a new conversation to save your chat history automatically.</p>
          </div>
        ) : (
          conversations.map(conv => {
            const isActive = conv.id === activeConversationId;
            const isDeleting = deleteConfirmId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  if (!isDeleting) {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }
                }}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition ${
                  isActive
                    ? 'bg-[#0B3D6B] text-white shadow-xs font-medium'
                    : 'text-gray-700 hover:bg-gray-100/80 bg-white border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF9933]' : 'text-gray-400'}`} />
                  <span className="truncate text-xs">{conv.title || 'New Conversation'}</span>
                </div>

                {/* Delete / Confirm UI */}
                {isDeleting ? (
                  <div className="flex items-center gap-1 z-10" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => confirmDelete(e, conv.id)}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700 text-[10px] px-1.5 font-bold"
                      title="Confirm Delete"
                    >
                      Delete
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-[10px]"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDeleteClick(e, conv.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition ${
                      isActive ? 'hover:bg-white/20 text-white/80 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-red-600'
                    }`}
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 bg-white text-[11px] text-gray-500 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#138808]" />
        <span>Secure BIS Cloud Synced</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-slideRight">
            <div className="absolute top-2 right-2 z-20">
              <button
                onClick={onCloseMobile}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
