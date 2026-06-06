import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Copy, Check, X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FEED-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  return code;
}

export default function AccessCodesPanel() {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const { data: codes = [] } = useQuery({
    queryKey: ['accessCodes'],
    queryFn: () => base44.entities.AccessCode.list('-created_date', 100),
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.AccessCode.create({
      code: generateCode(),
      label: label.trim() || null,
      is_used: false,
      is_active: true,
    }),
    onSuccess: () => {
      setLabel('');
      queryClient.invalidateQueries({ queryKey: ['accessCodes'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => base44.entities.AccessCode.update(id, { is_active: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessCodes'] }),
  });

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const active = codes.filter(c => c.is_active);
  const inactive = codes.filter(c => !c.is_active);

  return (
    <div>
      {/* Generate */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Label (e.g. 'Maria from Cairo')"
          value={label}
          onChange={e => setLabel(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          {createMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate Code
        </button>
      </div>

      {/* Active codes */}
      <div className="space-y-2 mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Active ({active.length})</p>
        {active.length === 0 && <p className="text-gray-600 text-sm">No active codes. Generate one above.</p>}
        {active.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono text-emerald-400 font-semibold tracking-widest text-sm">{c.code}</p>
              {c.label && <p className="text-gray-400 text-xs mt-0.5">{c.label}</p>}
              {c.is_used && (
                <p className="text-amber-400 text-xs mt-0.5">
                  Used {c.used_by_email ? `by ${c.used_by_email}` : ''} {c.used_at ? `· ${new Date(c.used_at).toLocaleDateString()}` : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_used ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {c.is_used ? 'used' : 'unused'}
              </span>
              <button
                onClick={() => copyCode(c.code, c.id)}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-700"
                title="Copy code"
              >
                {copiedId === c.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deactivateMutation.mutate(c.id)}
                className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-gray-700"
                title="Deactivate"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Deactivated ({inactive.length})</p>
          <div className="space-y-1.5">
            {inactive.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-2.5 opacity-50">
                <p className="font-mono text-gray-500 text-sm tracking-widest flex-1">{c.code}</p>
                {c.label && <p className="text-gray-600 text-xs">{c.label}</p>}
                <span className="text-xs text-gray-600">deactivated</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}