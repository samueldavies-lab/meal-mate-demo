import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, CheckCircle, X } from 'lucide-react';

export default function MessagesPanel() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data: messages = [] } = useQuery({
    queryKey: ['devMessages'],
    queryFn: () => base44.entities.DevMessage.list('-created_date', 100),
    refetchInterval: 15000,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }) => {
      await base44.entities.DevMessage.update(id, {
        reply,
        replied_at: new Date().toISOString(),
        status: 'replied',
        is_read: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devMessages'] });
      setReplyText('');
      setSelected(null);
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id) => base44.entities.DevMessage.update(id, { status: 'closed', is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devMessages'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.DevMessage.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devMessages'] }),
  });

  const statusColor = {
    open: 'bg-amber-500/20 text-amber-300',
    replied: 'bg-green-500/20 text-green-300',
    closed: 'bg-gray-500/20 text-gray-400',
  };

  const open = messages.filter(m => m.status === 'open');
  const other = messages.filter(m => m.status !== 'open');

  return (
    <div className="flex h-full gap-4">
      {/* List */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-2 overflow-y-auto max-h-[600px] pr-1">
        {open.length === 0 && other.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No messages yet</p>
        )}
        {[...open, ...other].map(msg => (
          <button
            key={msg.id}
            onClick={() => { setSelected(msg); markReadMutation.mutate(msg.id); setReplyText(''); }}
            className={`w-full text-left rounded-xl p-3 border transition-all ${
              selected?.id === msg.id
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 bg-gray-800/60 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm font-medium truncate">{msg.from_user_name || msg.from_user_email}</span>
              {!msg.is_read && <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0" />}
            </div>
            <p className="text-gray-400 text-xs truncate">{msg.message}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor[msg.status]}`}>
              {msg.status}
            </span>
          </button>
        ))}
      </div>

      {/* Detail */}
      {selected ? (
        <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-2xl p-5 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white font-semibold">{selected.from_user_name || 'User'}</p>
              <p className="text-gray-400 text-xs">{selected.from_user_email}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => closeMutation.mutate(selected.id)}
                className="text-xs text-gray-400 hover:text-white border border-gray-600 rounded-lg px-3 py-1 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Close
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <p className="text-gray-200 text-sm leading-relaxed">{selected.message}</p>
          </div>

          {selected.reply && (
            <div className="bg-indigo-900/30 border border-indigo-700/30 rounded-xl p-4 mb-4">
              <p className="text-xs text-indigo-400 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Your reply</p>
              <p className="text-gray-200 text-sm">{selected.reply}</p>
            </div>
          )}

          {selected.status !== 'closed' && (
            <div className="mt-auto">
              <textarea
                rows={3}
                placeholder="Type your reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={() => replyMutation.mutate({ id: selected.id, reply: replyText })}
                disabled={!replyText.trim()}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" /> Send Reply
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex items-center justify-center text-gray-600">
          <div className="text-center">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a message to reply</p>
          </div>
        </div>
      )}
    </div>
  );
}