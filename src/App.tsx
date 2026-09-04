/**
 * BIS Sahayak - Main Application Root
 * Smart India Hackathon - Pramaan Standards Intelligence
 * Bureau of Indian Standards (BIS) AI-Powered Intelligent Assistant with Persistent Chat History
 */

import React, { useState, useEffect } from 'react';
import { UserRole, LanguageCode } from './types';
import { Conversation, getConversations, deleteConversationRecord } from './lib/supabase';
import { UtilityBar } from './components/UtilityBar';
import { GovHeader } from './components/GovHeader';
import { GovFooter } from './components/GovFooter';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { ConsumerView } from './components/ConsumerView';
import { IndustryDashboard } from './components/IndustryDashboard';
import { AuthModal } from './components/AuthModal';
import { ExportModal } from './components/ExportModal';

export function App() {
  const [role, setRole] = useState<UserRole>('consumer');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User & Chat History State
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(() => {
    try {
      const storedId = localStorage.getItem('pramaan_current_user_id');
      const storedEmail = localStorage.getItem('pramaan_current_user_email');
      if (storedId && storedEmail) {
        return { id: storedId, email: storedEmail };
      }
    } catch {}
    return { id: 'guest-user-12345', email: 'citizen.guest@gov.in' };
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load saved preferences on startup if available
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('bis_role') as UserRole;
      const savedLang = localStorage.getItem('bis_lang') as LanguageCode;
      const savedContrast = localStorage.getItem('bis_contrast');

      if (savedRole && (savedRole === 'consumer' || savedRole === 'industry')) {
        setRole(savedRole);
      } else {
        setIsRoleModalOpen(true);
      }

      if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'or')) {
        setLang(savedLang);
      }

      if (savedContrast === 'true') {
        setHighContrast(true);
      }
    } catch (e) {
      console.warn('localStorage not available in iframe environment', e);
    }
  }, []);

  // Fetch conversations when user changes
  useEffect(() => {
    if (currentUser) {
      fetchConversations(currentUser.id);
    }
  }, [currentUser]);

  const fetchConversations = async (userId: string) => {
    setIsLoadingHistory(true);
    try {
      const data = await getConversations(userId);
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectRole = (newRole: UserRole) => {
    setRole(newRole);
    setIsRoleModalOpen(false);
    try {
      localStorage.setItem('bis_role', newRole);
    } catch (e) {}
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    try {
      localStorage.setItem('bis_lang', newLang);
    } catch (e) {}
  };

  const handleToggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bis_contrast', String(next));
      } catch (e) {}
      return next;
    });
  };

  const handleToggleRole = () => {
    const nextRole = role === 'consumer' ? 'industry' : 'consumer';
    setRole(nextRole);
    try {
      localStorage.setItem('bis_role', nextRole);
    } catch (e) {}
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversationRecord(id);
      if (currentUser) {
        await fetchConversations(currentUser.id);
      }
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleLoginSuccess = (user: { id: string; email: string }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('pramaan_current_user_id', user.id);
      localStorage.setItem('pramaan_current_user_email', user.email);
    } catch (e) {}
    setActiveConversationId(null);
  };

  const handleLogout = () => {
    const guestUser = { id: 'guest-user-12345', email: 'citizen.guest@gov.in' };
    setCurrentUser(guestUser);
    try {
      localStorage.setItem('pramaan_current_user_id', guestUser.id);
      localStorage.setItem('pramaan_current_user_email', guestUser.email);
    } catch (e) {}
    setActiveConversationId(null);
    setConversations([]);
  };

  // Font sizing wrapper class
  const fontClass =
    fontSize === 'xlarge'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-base leading-normal'
      : 'text-sm leading-normal';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${fontClass} ${
        highContrast ? 'bg-black text-yellow-300' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* 1. Top Government Utility Bar (NIC Standards) */}
      <UtilityBar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        highContrast={highContrast}
        onToggleHighContrast={handleToggleHighContrast}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* 2. Official Government & BIS Header */}
      <GovHeader
        role={role}
        lang={lang}
        onToggleRole={handleToggleRole}
        highContrast={highContrast}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* 3. Main Workspace Area */}
      <main id="main-content" className="flex-1 w-full flex flex-col overflow-hidden">
        {role === 'consumer' ? (
          <ConsumerView
            lang={lang}
            highContrast={highContrast}
            fontSize={fontSize}
            onSwitchToIndustry={() => handleSelectRole('industry')}
            currentUser={currentUser}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
            isLoadingHistory={isLoadingHistory}
            isMobileSidebarOpen={isMobileSidebarOpen}
            onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
            onRefreshConversations={() => currentUser && fetchConversations(currentUser.id)}
          />
        ) : (
          <IndustryDashboard
            lang={lang}
            highContrast={highContrast}
            fontSize={fontSize}
          />
        )}
      </main>

      {/* 4. Official Government Footer */}
      <GovFooter lang={lang} highContrast={highContrast} />

      {/* 5. Role Selection Gate Modal */}
      <RoleSelectorModal
        currentRole={role}
        lang={lang}
        isOpen={isRoleModalOpen}
        onSelectRole={handleSelectRole}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* 6. User Authentication & Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* 7. Standalone Prototype & Executable Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;
