import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function UsersTable({ users }) {
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    (u.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.country || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-gray-800">
              <th className="text-left pb-2 pr-4">User</th>
              <th className="text-left pb-2 pr-4">Country</th>
              <th className="text-right pb-2 pr-4">Meals</th>
              <th className="text-right pb-2 pr-4">Ads</th>
              <th className="text-right pb-2 pr-4">Streak</th>
              <th className="text-left pb-2">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-2.5 pr-4">
                  <p className="text-white font-medium truncate max-w-[160px]">{u.user_name || '—'}</p>
                  <p className="text-gray-500 text-xs truncate max-w-[160px]">{u.user_email}</p>
                </td>
                <td className="py-2.5 pr-4 text-gray-300">{u.country || '—'}</td>
                <td className="py-2.5 pr-4 text-right text-amber-400 font-semibold">{u.total_meals_provided || 0}</td>
                <td className="py-2.5 pr-4 text-right text-indigo-400">{u.total_ads_watched || 0}</td>
                <td className="py-2.5 pr-4 text-right text-green-400">{u.current_streak || 0}</td>
                <td className="py-2.5 text-gray-400 text-xs">{u.last_activity_date || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-600 py-8">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}