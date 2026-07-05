import { useEffect, useState, type FC } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import { Mail, Calendar, Award, BookOpen, BarChart2, RefreshCw } from 'lucide-react';

interface ProfileStats {
  total_topics: number;
  total_nodes: number;
  completed_nodes: number;
  average_quiz_score: number;
}

export const Profile: FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await api.get('/learning/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-[#3d27bc]">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  const completionPct = stats && stats.total_nodes > 0 
    ? Math.round((stats.completed_nodes / stats.total_nodes) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-['Outfit'] text-[#1a1a1a]">Your Study Profile</h2>
        <p className="text-sm text-[#787671]">Manage your credentials and track your metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Card */}
        <div className="md:col-span-2 lg:col-span-1 space-y-6 font-semibold">
          <GlassCard className="text-center space-y-4 bg-white border-[#e5e3df] p-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-3xl mx-auto shadow-lg shadow-purple-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1a1a1a]">{user?.name}</h3>
              <span className="text-[10px] text-[#3d27bc] font-bold bg-[#3d27bc]/5 px-2.5 py-1 rounded-full border border-[#3d27bc]/10">
                Platform Student
              </span>
            </div>

            <div className="border-t border-[#e5e3df] pt-4 text-left space-y-3 text-xs text-[#787671]">
              <div className="flex items-center space-x-2.5">
                <Mail size={16} className="text-[#787671]" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Calendar size={16} className="text-[#787671]" />
                <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Performance stats */}
        <div className="md:col-span-2 lg:col-span-2 space-y-6">
          <GlassCard className="space-y-6 bg-white border-[#e5e3df] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#787671] uppercase tracking-wider flex items-center space-x-2 border-b border-[#e5e3df] pb-3">
              <BarChart2 size={16} className="text-[#3d27bc]" />
              <span>Learning Analytics</span>
            </h3>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[#e5e3df] bg-[#f6f5f4] rounded-xl">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#787671]">Courses Explored</p>
                <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{stats?.total_topics || 0}</p>
              </div>

              <div className="p-4 border border-[#e5e3df] bg-[#f6f5f4] rounded-xl">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#787671]">Modules Completed</p>
                <p className="text-2xl font-bold text-[#1a1a1a] mt-1">
                  {stats?.completed_nodes || 0} <span className="text-xs text-[#787671] font-normal">/ {stats?.total_nodes || 0}</span>
                </p>
              </div>

              <div className="p-4 border border-[#e5e3df] bg-[#f6f5f4] rounded-xl">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#787671]">Completion Ratio</p>
                <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{completionPct}%</p>
              </div>

              <div className="p-4 border border-[#e5e3df] bg-[#f6f5f4] rounded-xl">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#787671]">Quiz Accuracy</p>
                <p className="text-2xl font-bold text-[#1a1a1a] mt-1">
                  {stats?.average_quiz_score ? `${stats.average_quiz_score}%` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Progress Visualizer */}
            <div className="space-y-2 border-t border-[#e5e3df] pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#787671] font-semibold">Overall Progress</span>
                <span className="text-[#1a1a1a] font-bold">{completionPct}%</span>
              </div>
              <div className="w-full bg-[#f6f5f4] rounded-full h-2.5 overflow-hidden border border-[#e5e3df]">
                <div 
                  className="bg-gradient-to-r from-[#3d27bc] to-[#7b3ff2] h-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Achievement Badges */}
          <GlassCard className="space-y-4 bg-white border-[#e5e3df] p-6 shadow-sm">
            <h4 className="text-xs font-bold text-[#787671] uppercase tracking-wider">Your Achievements</h4>
            <div className="flex flex-wrap gap-3">
              {stats && stats.total_topics > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1.5 border border-[#3d27bc]/20 bg-[#3d27bc]/5 rounded-lg">
                  <BookOpen size={14} className="text-[#3d27bc]" />
                  <span className="text-xs font-semibold text-[#3d27bc]">Pathfinder Initiated</span>
                </div>
              )}
              {stats && stats.completed_nodes > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1.5 border border-pink-200 bg-pink-50 rounded-lg">
                  <Award size={14} className="text-pink-600" />
                  <span className="text-xs font-semibold text-pink-700">Scholar of Neura</span>
                </div>
              )}
              {stats && stats.average_quiz_score >= 80 && (
                <div className="flex items-center space-x-2 px-3 py-1.5 border border-emerald-200 bg-emerald-50 rounded-lg">
                  <Award size={14} className="text-[#1aae39]" />
                  <span className="text-xs font-semibold text-emerald-700">High Achiever</span>
                </div>
              )}
              {(!stats || stats.total_topics === 0) && (
                <p className="text-xs text-[#787671] italic py-2">Start exploring courses to unlock achievements!</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
