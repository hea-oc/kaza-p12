'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuth } from '@/app/context/AuthContext';

interface Conversation {
  id: string;
  user_name: string;
  user_picture?: string;
  last_message: string;
  timestamp: string;
  unread: boolean;
}

interface Message {
  id: string;
  sender_name: string;
  text: string;
  timestamp: string;
  is_own: boolean;
}

function formatDateSeparator(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// Stocke dans localStorage quand l'utilisateur a ouvert chaque conversation
function getLastRead(convId: string): string | null {
  try { return localStorage.getItem(`msg_read_${convId}`); } catch { return null; }
}
// On sauvegarde le timestamp de la conversation (pas l'heure actuelle)
// pour éviter le bug avec des timestamps futurs dans la DB
function markAsRead(convId: string, convTimestamp: string) {
  try { localStorage.setItem(`msg_read_${convId}`, convTimestamp); } catch {}
}
function isConvUnread(conv: Conversation): boolean {
  if (!conv.last_message) return false;
  const lastRead = getLastRead(conv.id);
  if (!lastRead) return true;
  return new Date(conv.timestamp) > new Date(lastRead);
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !token) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          // Calculer les non-lus depuis localStorage
          setUnreadIds(new Set(data.filter(isConvUnread).map((c: Conversation) => c.id)));
          if (data.length > 0) {
            setSelectedConversation(data[0]);
            fetchMessages(data[0].id);
            markAsRead(data[0].id, data[0].timestamp);
            setUnreadIds(prev => { const s = new Set(prev); s.delete(data[0].id); return s; });
          }
        }
      } catch {
        setConversations([
          {
            id: '1',
            user_name: 'Utilisateur',
            user_picture: undefined,
            last_message: 'Bonjour, votre appartement est-il disponible pour le week-end du 12 au 14 octobre ?',
            timestamp: new Date().toISOString(),
            unread: true,
          },
        ]);
      }
      setPageLoading(false);
    };

    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (conversationId: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const sorted = [...data].sort((a: Message, b: Message) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sorted);
      }
    } catch {
      // silencieux si l'API n'est pas disponible
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
    setMobileView('chat');
    markAsRead(conv.id, conv.timestamp);
    setUnreadIds(prev => { const s = new Set(prev); s.delete(conv.id); return s; });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: String(Date.now()),
      sender_name: user?.name || 'Vous',
      text: messageText,
      timestamp: new Date().toISOString(),
      is_own: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          text: newMessage.text,
        }),
      });
    } catch {
      // silencieux si l'API n'est pas disponible
    }
  };

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-kasa-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex w-full px-4 py-8 gap-6 max-w-6xl mx-auto min-h-0">

        {/* Liste conversations */}
        <div className={`w-full md:w-80 shrink-0 flex flex-col ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <Link
            href="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm mb-4 inline-flex items-center gap-1 w-fit"
          >
            ← Retour
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

          <div className="bg-white rounded-2xl overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-sm p-4">Aucune conversation</p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left transition-colors border-b last:border-b-0 ${
                    selectedConversation?.id === conv.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative w-12 h-12 rounded bg-gray-300 shrink-0 flex items-center justify-center overflow-hidden">
                      {conv.user_picture ? (
                        <Image src={conv.user_picture} alt={conv.user_name} fill className="object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {conv.user_name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{conv.user_name}</p>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {conv.last_message || 'Aucun message'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-xs text-gray-500">
                        {new Date(conv.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {unreadIds.has(conv.id) && <div className="w-2 h-2 rounded-full bg-kasa-red" />}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`flex-1 flex flex-col min-h-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <div className="bg-white rounded-2xl flex flex-col flex-1 overflow-hidden p-6">

              {/* Bouton retour mobile uniquement */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm mb-4 inline-flex items-center gap-1 w-fit"
              >
                ← Retour
              </button>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 py-2 min-h-0">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center mt-8">
                    Soyez le premier à écrire !
                  </p>
                ) : (
                  messages.map((msg, idx) => {
                    const showSeparator =
                      idx === 0 || !isSameDay(messages[idx - 1].timestamp, msg.timestamp);

                    return (
                      <div key={msg.id}>
                        {showSeparator && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatDateSeparator(msg.timestamp)}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}

                        {msg.is_own ? (
                          // Message envoyé (droite, bulle rouge)
                          <div className="flex justify-end gap-3">
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-1 mb-1">
                                <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                                <span className="text-xs text-gray-400">•</span>
                                <p className="text-xs text-gray-500">
                                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <div className="bg-kasa-dark-red text-white px-4 py-3 rounded-2xl inline-block max-w-sm">
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded bg-gray-400 shrink-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {user?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Message reçu (gauche, bulle grise)
                          <div className="flex gap-3">
                            <div className="relative w-8 h-8 rounded bg-gray-400 shrink-0 flex items-center justify-center overflow-hidden">
                              {selectedConversation.user_picture ? (
                                <Image
                                  src={selectedConversation.user_picture}
                                  alt={selectedConversation.user_name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold text-white">
                                  {selectedConversation.user_name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {selectedConversation.user_name}
                                </p>
                                <span className="text-xs text-gray-400">•</span>
                                <p className="text-xs text-gray-500">
                                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <p className="text-gray-700 text-sm max-w-sm leading-relaxed bg-gray-100 px-4 py-3 rounded-2xl">
                                {msg.text}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Champ d'envoi */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <input
                  type="text"
                  aria-label="Écrire un message"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Envoyer un message"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-kasa-dark-red"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-kasa-dark-red text-white w-10 h-10 rounded-lg hover:opacity-90 transition flex items-center justify-center text-lg"
                >
                  ↑
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
