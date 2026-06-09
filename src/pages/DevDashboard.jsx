import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LogOut, BarChart2, Users, MessageSquare, RefreshCw, KeyRound } from 'lucide-react';
import MetricCard from '../components/dev/MetricCard';
import MessagesPanel from '../components/dev/MessagesPanel';
import UsersTable from '../components/dev/UsersTable';
import AccessCodesPanel from '../components/dev/AccessCodesPanel';

const SESSION_KEY = 'dev_portal_auth';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'codes', label: 'Access Codes', icon: KeyRound },
];

export default function DevDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [now] = useState(new Date());
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
          navigate('/');
          return;
        }
        setIsAuthorized(true);
      } catch {
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: allStats = [], refetch: refetchStats, isFetching } = useQuery({
    queryKey: ['devAllStats'],
    queryFn: () => base44.entities.UserStats.list('-last_activity_date', 500),
    refetchInterval: 60000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['devMessages'],
    queryFn: () => base44.entities.DevMessage.list('-created_date', 200),
    refetchInterval: 15000,
  });

  const { data: feedingLogs = [] } = useQuery({
    queryKey: ['devFeedingLogs'],
    queryFn: () => base44.entities.DailyFeedingLog.list('-created_date', 1000),
  });

  // Compute metrics
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now - 86400000).toISOString().split('T')[0];
  const weekAgo = new Date(now - 7 * 86400000).toISOString().split('T')[0];

  const registeredUsers = allStats.filter(u => u.registration_completed).length;
  const dailyActive = allStats.filter(u => u.last_activity_date === today).length;
  const yesterdayActive = allStats.filter(u => u.last_activity_date === yesterday).length;
  const weeklyActive = allStats.filter(u => u.last_activity_date >= weekAgo).length;
  const totalMeals = allStats.reduce((s, u) => s + (u.total_meals_provided || 0), 0);
  const totalAds = allStats.reduce((s, u) => s + (u.total_ads_watched || 0), 0);
  const avgStreak = allStats.length
    ? (allStats.reduce((s, u) => s + (u.current_streak || 0), 0) / allStats.length).toFixed(1)
    : 0;
  const unreadMessages = messages.filter(m => !m.is_read).length;
  const openMessages = messages.filter(m => m.status === 'open').length;

  // Country breakdown
  const countryCount = allStats.reduce((acc, u) => {
    if (u.country) acc[u.country] = (acc[u.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Daily feeding trend (last 7 days)
  const trendDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000).toISOString().split('T')[0];
    const count = feedingLogs.filter(l => l.date === d || (l.created_date || '').startsWith(d)).length;
    return { date: d.slice(5), count };
  });
  const trendMax = Math.max(...trendDays.map(d => d.count), 1);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate('/Splash');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-800 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">🐕</div>
          <div>
            <h1 className="font-bold text-white leading-none">Feed a Stray</h1>
            <p className="text-gray-500 text-xs">Developer Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchStats()}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6">
        <div className="flex gap-1">
          {TABS.map(t => {
            const Icon = t.icon;
            const badge = t.id === 'messages' && unreadMessages > 0 ? unreadMessages : null;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all relative ${
                  tab === t.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto">
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard icon="👤" label="Registered Users" value={registeredUsers} color="indigo" delay={0} />
              <MetricCard icon="🔥" label="Daily Active" value={dailyActive} sub={`${yesterdayActive} yesterday`} color="amber" delay={0.05} />
              <MetricCard icon="📅" label="Weekly Active" value={weeklyActive} color="green" delay={0.1} />
              <MetricCard icon="💬" label="Open Messages" value={openMessages} sub={`${unreadMessages} unread`} color="rose" delay={0.15} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard icon="🍚" label="Total Meals" value={totalMeals.toLocaleString()} color="amber" delay={0.2} />
              <MetricCard icon="📺" label="Total Ads Watched" value={totalAds.toLocaleString()} color="sky" delay={0.25} />
              <MetricCard icon="⚡" label="Avg Streak" value={avgStreak + ' days'} color="purple" delay={0.3} />
              <MetricCard icon="🌍" label="Countries" value={Object.keys(countryCount).length} color="green" delay={0.35} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Trend */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Feeding Activity — Last 7 Days</h3>
                <div className="flex items-end gap-2 h-32">
                  {trendDays.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{d.count}</span>
                      <div
                        className="w-full bg-indigo-600/70 rounded-t-md transition-all"
                        style={{ height: `${(d.count / trendMax) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
                      />
                      <span className="text-[10px] text-gray-600">{d.date}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Countries */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Countries by Users</h3>
                <div className="space-y-3">
                  {topCountries.map(([country, count]) => (
                    <div key={country}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{country}</span>
                        <span className="text-gray-400">{count}</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${(count / (topCountries[0]?.[1] || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {topCountries.length === 0 && <p className="text-gray-600 text-sm">No data yet</p>}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">All Users ({allStats.length})</h2>
              <span className="text-xs text-gray-500">{registeredUsers} registered</span>
            </div>
            <UsersTable users={allStats} />
          </motion.div>
        )}

        {/* MESSAGES TAB */}
        {tab === 'messages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">User Messages</h2>
              <span className="text-xs text-gray-500">{openMessages} open · {messages.length} total</span>
            </div>
            <MessagesPanel />
          </motion.div>
        )}

        {/* ACCESS CODES TAB */}
        {tab === 'codes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white">Feeder Access Codes</h2>
                <p className="text-gray-500 text-xs mt-0.5">Generate invite codes to share with people you want to give feeder access</p>
              </div>
            </div>
            <AccessCodesPanel />
          </motion.div>
        )}
      </div>
    </div>
  );
}