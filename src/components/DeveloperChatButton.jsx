import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, AlertCircle, Minimize2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function DeveloperChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    getUser();
  }, []);

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['userMessages', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allMessages = await base44.entities.DevMessage.list('-created_date', 50);
      return allMessages.filter(m => m.from_user_email === user.email);
    },
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const unreadCount = messages.filter(m => m.reply && !m.is_read).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await base44.entities.DevMessage.create({
        from_user_email: user?.email || 'anonymous',
        from_user_name: user?.full_name || 'Anonymous',
        message: message.trim(),
      });
      toast.success('Message sent! Thanks for your feedback.');
      setMessage('');
      refetch();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (msg) => {
    if (msg.reply && !msg.is_read) {
      try {
        await base44.entities.DevMessage.update(msg.id, { is_read: true });
        refetch();
      } catch {
        // silent fail
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          messages.forEach(msg => markAsRead(msg));
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ position: 'fixed' }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[600px]"
            style={{ position: 'fixed' }}
          >
            {/* Header */}
            <div className="bg-indigo-600 text-white p-4 border-b border-indigo-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Support Chat</h3>
                <p className="text-sm text-indigo-100">Report bugs, ask questions, or share feedback</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-indigo-700 rounded transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="p-1 hover:bg-indigo-700 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Log */}
            {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white rounded-lg px-3 py-2 max-w-xs text-sm break-words">
                        <p className="text-xs font-semibold text-indigo-100 mb-1">{msg.from_user_name || 'You'}</p>
                        {msg.message}
                      </div>
                    </div>

                    {/* Dev Reply */}
                    {msg.reply && (
                      <div className="flex justify-start items-start gap-2">
                        {msg.is_read ? null : (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          </motion.div>
                        )}
                        <div className="bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 max-w-xs text-sm break-words">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Samuel</p>
                          {msg.reply}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            )}

            {/* Input Form */}
            {!isMinimized && (
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                rows={2}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}