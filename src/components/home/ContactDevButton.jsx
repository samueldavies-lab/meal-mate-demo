import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactDevButton({ userEmail, userName }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await base44.entities.DevMessage.create({
      from_user_email: userEmail,
      from_user_name: userName,
      message: message.trim(),
      status: 'open',
      is_read: false,
    });
    setSent(true);
    setLoading(false);
    setTimeout(() => { setOpen(false); setSent(false); setMessage(''); }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-amber-700 text-sm font-medium hover:text-amber-900 transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        Contact Support
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-amber-900">Send a Message</h3>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sent ? (
                <div className="text-center py-6">
                  <span className="text-4xl">✅</span>
                  <p className="text-amber-800 font-medium mt-2">Message sent! We'll get back to you soon.</p>
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue or feedback..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || loading}
                    className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}