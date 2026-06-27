import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LogOut, BarChart2, Users, MessageSquare, RefreshCw, KeyRound, GripVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Line } from 'recharts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
    const authed = sessionStorage.getItem(SESSION_KEY);
    if (!authed) {
      navigate('/');
      return;
    }
    setIsAuthorized(true);
    setIsLoading(false);
  }, [navigate]);

  const { data: allStats = [], refetch: refetchStats, isFetching } = useQuery({
    queryKey: ['devAllStats'],
    queryFn: () => base44.entities.UserStats.list('-last_activity_date', 500),
    refetchInterval: 10000,
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

  const { data: dailyActivity = [], isFetching: isActivityFetching } = useQuery({
    queryKey: ['devDailyActivity'],
    queryFn: () => base44.entities.DailyActivity.list('-date', 90),
    refetchInterval: 10000,
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
  const totalServerHours = Math.floor(totalAds / 5) * 3;
  const totalServerDays = Math.floor(totalServerHours / 24);
  const remainingServerHours = totalServerHours % 24;
  const supporterUsers = allStats.filter(u => (u.total_ads_watched || 0) > 0 && (u.total_meals_provided || 0) === 0);
  const supporterAds = supporterUsers.reduce((s, u) => s + (u.total_ads_watched || 0), 0);
  const regularAds = totalAds - supporterAds;
  const devSupportAds = dailyActivity.reduce((s, r) => s + (r.dev_support_ads || 0), 0);
  const regularRevenue = +(regularAds * 0.022).toFixed(2);
  const regularProfit = +(Math.floor(regularAds / 5) * 0.022).toFixed(2);
  const supporterRevenue = +(supporterAds * 0.022).toFixed(2);
  const devSupportRevenue = +(devSupportAds * 0.022).toFixed(2);
  const devSupportProfit = +(devSupportAds * 0.022).toFixed(2);
  const totalRevenue = +((totalAds + devSupportAds) * 0.022).toFixed(2);
  const totalProfit = +(regularProfit + devSupportProfit).toFixed(2);
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

  // Draggable card order (persisted to localStorage)
  const defaultTopOrder = ['registeredUsers','dailyActive','weeklyActive','openMessages'];
  const defaultMidOrder = ['totalMeals','totalAds','serverHours','avgStreak','countries'];
  const defaultRevOrder = ['regularAds','devSupport','totalRevenue','totalProfit'];
  const [topOrder, setTopOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dev_order_top') || 'null') || defaultTopOrder; }
    catch { return defaultTopOrder; }
  });
  const [midOrder, setMidOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dev_order_mid') || 'null') || defaultMidOrder; }
    catch { return defaultMidOrder; }
  });
  const [revOrder, setRevOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dev_order_rev') || 'null') || defaultRevOrder; }
    catch { return defaultRevOrder; }
  });
  useEffect(() => { localStorage.setItem('dev_order_top', JSON.stringify(topOrder)); }, [topOrder]);
  useEffect(() => { localStorage.setItem('dev_order_mid', JSON.stringify(midOrder)); }, [midOrder]);
  useEffect(() => { localStorage.setItem('dev_order_rev', JSON.stringify(revOrder)); }, [revOrder]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const setters = { top: setTopOrder, mid: setMidOrder, rev: setRevOrder };
    const setter = setters[result.source.droppableId];
    if (!setter) return;
    setter(prev => {
      const next = Array.from(prev);
      const [removed] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, removed);
      return next;
    });
  }, []);

  const topCards = [
    { id: 'registeredUsers', el: <MetricCard icon="👤" label="Registered Users" value={registeredUsers} color="indigo" delay={0} /> },
    { id: 'dailyActive', el: <MetricCard icon="🔥" label="Daily Active" value={dailyActive} sub={`${yesterdayActive} yesterday`} color="amber" delay={0.05} /> },
    { id: 'weeklyActive', el: <MetricCard icon="📅" label="Weekly Active" value={weeklyActive} color="green" delay={0.1} /> },
    { id: 'openMessages', el: <MetricCard icon="💬" label="Open Messages" value={openMessages} sub={`${unreadMessages} unread`} color="rose" delay={0.15} /> },
  ];
  const sortedTop = [...topCards].sort((a, b) => topOrder.indexOf(a.id) - topOrder.indexOf(b.id));

  const midCards = [
    { id: 'totalMeals', el: <MetricCard icon="🍚" label="Total Meals" value={totalMeals.toLocaleString()} color="amber" delay={0.2} /> },
    { id: 'totalAds', el: <MetricCard icon="📺" label="Total Ads Watched" value={totalAds.toLocaleString()} color="sky" delay={0.25} /> },
    { id: 'serverHours', el: <MetricCard icon="⚡" label="Server Hours" value={totalServerDays > 0 ? `${totalServerDays}d ${remainingServerHours}h` : `${totalServerHours}h`} sub="from all ad views" color="indigo" delay={0.27} /> },
    { id: 'avgStreak', el: <MetricCard icon="⚡" label="Avg Streak" value={avgStreak + ' days'} color="purple" delay={0.3} /> },
    { id: 'countries', el: <MetricCard icon="🌍" label="Countries" value={Object.keys(countryCount).length} color="green" delay={0.35} /> },
  ];
  const sortedMid = [...midCards].sort((a, b) => midOrder.indexOf(a.id) - midOrder.indexOf(b.id));

  const revCards = [
    { id: 'regularAds', el: <MetricCard icon="📺" label="Regular Ads" value={regularAds.toLocaleString()} sub={`${regularAds > 0 ? `$${regularRevenue} rev / $${regularProfit} profit (1 in 5)` : 'no data'}`} color="amber" delay={0.3} /> },
    { id: 'devSupport', el: <MetricCard icon="💙" label="Dev Support Ads" value={devSupportAds.toLocaleString()} sub={`${devSupportAds > 0 ? `$${devSupportRevenue} rev / $${devSupportProfit} profit (100%)` : 'no data'}`} color="blue" delay={0.33} /> },
    { id: 'totalRevenue', el: <MetricCard icon="💰" label="Total Revenue" value={`$${totalRevenue}`} color="green" delay={0.34} /> },
    { id: 'totalProfit', el: <MetricCard icon="📈" label="Total Profit" value={`$${totalProfit}`} sub={`${totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(0)}% margin` : ''}`} color="green" delay={0.36} /> },
  ];
  const sortedRev = [...revCards].sort((a, b) => revOrder.indexOf(a.id) - revOrder.indexOf(b.id));

  // Daily activity data (last 30 days)
  const activityByDate = {};
  for (const r of dailyActivity) {
    activityByDate[r.date.slice(5)] = r;
  }

  const chartDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000).toISOString().split('T')[0];
    const realUsers = allStats.filter(u => u.last_activity_date === d).length;
    const feedCount = feedingLogs.filter(l => l.date === d || (l.created_date || '').startsWith(d)).length;
    const dateStr = d.slice(5);

    let users = realUsers;

    const record = activityByDate[dateStr];
    let rawAds = record ? (record.ads_watched || 0) : 0;
    const rawDevAds = record ? (record.dev_support_ads || 0) : 0;

    return { date: dateStr, users, feeds: feedCount, rawAds, rawDevAds };
  });

  for (const day of chartDays) {
    day.devAds = day.rawDevAds;
    day.ads = day.rawAds;
    day.mealAds = Math.max(0, day.ads - day.devAds);
  }

  function linearRegression(data, key) {
    const n = data.length;
    const indices = data.map((_, i) => i);
    const values = data.map(d => d[key]);
    const sumX = indices.reduce((s, x) => s + x, 0);
    const sumY = values.reduce((s, y) => s + y, 0);
    const sumXY = indices.reduce((s, x, i) => s + x * values[i], 0);
    const sumX2 = indices.reduce((s, x) => s + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return indices.map(x => +(slope * x + intercept).toFixed(1));
  }

  const trendUsers = linearRegression(chartDays, 'users');
  const chartData = chartDays.map((d, i) => ({ ...d, trend: trendUsers[i] }));

  // Auto-record today's snapshot + ad count metadata (preserving values written by portal pages)
  useEffect(() => {
    if (allStats.length === 0) return;
    const todayStr = now.toISOString().split('T')[0];
    const existing = dailyActivity.find(r => r.date === todayStr);

    const payload = {
      date: todayStr,
      active_users: dailyActive,
      regular_ads: regularAds,
      supporter_ads: supporterAds,
      ads_watched: existing?.ads_watched || 0,
      dev_support_ads: existing?.dev_support_ads || 0,
    };

    if (existing) {
      base44.entities.DailyActivity.update(existing.id, payload).catch(() => {});
    } else {
      base44.entities.DailyActivity.create(payload).catch(() => {});
    }
  }, [dailyActivity, allStats]);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate('/');
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
            {(isFetching || isActivityFetching) ? (
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="top" direction="horizontal">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {sortedTop.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className="relative group">
                              <div {...provided.dragHandleProps} className="absolute -top-1 -left-1 z-10 p-0.5 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-3 h-3 text-gray-400" />
                              </div>
                              {card.el}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <Droppable droppableId="mid" direction="horizontal">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {sortedMid.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className="relative group">
                              <div {...provided.dragHandleProps} className="absolute -top-1 -left-1 z-10 p-0.5 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-3 h-3 text-gray-400" />
                              </div>
                              {card.el}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">💰 Revenue &amp; Profit</h3>
                  <Droppable droppableId="rev" direction="horizontal">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {sortedRev.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="relative group">
                                <div {...provided.dragHandleProps} className="absolute -top-1 -left-1 z-10 p-0.5 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-3 h-3 text-gray-400" />
                                </div>
                                {card.el}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users Chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Active Users — Last 30 Days</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} interval={4} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="users" fill="#6366F1" name="Active Users" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="trend" stroke="#10B981" strokeWidth={2} dot={false} name="Trend" />
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Ads Chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Number of Ads Watched — Last 30 Days</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} interval={4} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="devAds" stackId="ads" fill="#3B82F6" name="Dev Support Ads" />
                    <Bar dataKey="mealAds" stackId="ads" fill="#F59E0B" name="Dog Meal Ads" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Top Countries */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
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