import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Award, Clock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import LoadingScreen from '../components/LoadingScreen';

interface Topic {
  id: number;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  progress_percentage: number;
  total_nodes: number;
  completed_nodes: number;
}

interface Stats {
  total_topics: number;
  total_nodes: number;
  completed_nodes: number;
  in_progress_nodes: number;
  average_quiz_score: number;
  recent_activity: Array<{
    topic_title: string;
    node_title: string;
    completed_at: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingTopicId, setGeneratingTopicId] = useState<number | null>(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const topicsResponse = await api.get('/learning/topics');
      setTopics(topicsResponse.data.topics);

      const statsResponse = await api.get('/learning/stats');
      setStats(statsResponse.data);
      
      // Check if any topic is currently generating
      const generating = topicsResponse.data.topics.find(
        (t: Topic) => t.status === 'generating'
      );
      if (generating) {
        setIsGenerating(true);
        setGeneratingTopicId(generating.id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for generating topic status
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isGenerating && generatingTopicId) {
      // Simulate dynamic loading steps for engagement
      const stepInterval = setInterval(() => {
        setGenerationStep((prev) => (prev < 5 ? prev + 1 : prev));
      }, 5000);

      interval = setInterval(async () => {
        try {
          const response = await api.get(`/learning/roadmap/${generatingTopicId}`);
          const { topic } = response.data;
          
          if (topic.status === 'completed') {
            setIsGenerating(false);
            setGeneratingTopicId(null);
            setGenerationStep(0);
            clearInterval(stepInterval);
            fetchData(); // Refresh list
            navigate(`/learning/${topic.id}`);
          } else if (topic.status === 'failed') {
            setIsGenerating(false);
            setGeneratingTopicId(null);
            setGenerationStep(0);
            clearInterval(stepInterval);
            setError("Agent generation failed. Please try a different topic.");
            fetchData();
          }
        } catch (err) {
          console.error('Error polling topic status:', err);
        }
      }, 3000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isGenerating, generatingTopicId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setError(null);
    setIsGenerating(true);
    setGenerationStep(0);

    try {
      const response = await api.post('/learning/generate', { topic: topicInput });
      setGeneratingTopicId(response.data.topic_id);
      setTopicInput('');
      fetchData(); // Fetch the new topic into list
    } catch (err: any) {
      console.error('Failed to trigger generation:', err);
      setError(err.response?.data?.error || 'Failed to start learning path generation.');
      setIsGenerating(false);
    }
  };

  const handleCancel = async () => {
    if (!generatingTopicId) return;
    try {
      await api.post(`/learning/topic/${generatingTopicId}/cancel`);
    } catch (err) {
      console.error('Failed to cancel generation:', err);
    } finally {
      setIsGenerating(false);
      setGeneratingTopicId(null);
      setGenerationStep(0);
      fetchData();
    }
  };

  const handleDelete = async (topicId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating to learning space
    if (!window.confirm("Are you sure you want to delete this study pathway?")) return;
    
    try {
      await api.delete(`/learning/topic/${topicId}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Loading Overlay */}
      {isGenerating && (
        <LoadingScreen 
          message={`NeuraFlow agents are planning your path for "${topics.find(t => t.id === generatingTopicId)?.title || 'your topic'}"...`} 
          step={generationStep} 
          onCancel={handleCancel}
        />
      )}

      {/* Hero Search Section */}
      <GlassCard className="relative overflow-hidden border-[#e5e3df] bg-white p-8 shadow-sm">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-3xl font-extrabold font-['Outfit'] text-[#1a1a1a] leading-tight tracking-tight">
            Learn Any Topic. <br/>
            <span className="text-[#3d27bc]">
              Powered by Multi-Agent AI.
            </span>
          </h2>
          <p className="text-[#37352f] text-xs md:text-sm leading-relaxed">
            Enter any subject you want to master. Our specialized AI agents will research, organize a roadmap, build custom textbooks, draft summaries, generate quizzes, and construct interview practice questions.
          </p>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50 border border-red-200 p-3.5 rounded-lg">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="e.g., Quantum Computing, Organic Chemistry, Linear Regression..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 glass-input text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-lg bg-[#3d27bc] hover:bg-[#3e28bd] text-white font-semibold text-xs transition-all duration-150 shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Initialize Path</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </GlassCard>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center space-x-4 bg-white border-[#e5e3df] p-5 shadow-sm">
          <div className="p-3 rounded-lg bg-[#ffe8d4] text-[#dd5b00]">
            <Brain size={20} />
          </div>
          <div>
            <p className="text-[10px] text-[#787671] font-bold uppercase tracking-wider">Total Pathways</p>
            <h3 className="text-xl font-bold font-['Outfit'] text-[#1a1a1a] mt-0.5">{stats?.total_topics || 0}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4 bg-white border-[#e5e3df] p-5 shadow-sm">
          <div className="p-3 rounded-lg bg-[#e6e0f5] text-[#391c57]">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] text-[#787671] font-bold uppercase tracking-wider">Chapters Completed</p>
            <h3 className="text-xl font-bold font-['Outfit'] text-[#1a1a1a] mt-0.5">
              {stats?.completed_nodes || 0} <span className="text-xs text-[#787671] font-normal">/ {stats?.total_nodes || 0}</span>
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4 bg-white border-[#e5e3df] p-5 shadow-sm">
          <div className="p-3 rounded-lg bg-[#d9f3e1] text-[#1aae39]">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-[#787671] font-bold uppercase tracking-wider">Average Quiz Score</p>
            <h3 className="text-xl font-bold font-['Outfit'] text-[#1a1a1a] mt-0.5">
              {stats?.average_quiz_score ? `${stats.average_quiz_score}%` : 'N/A'}
            </h3>
          </div>
        </GlassCard>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Learning Paths */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#787671]">Your Study Pathways</h3>

          <div className="space-y-3">
            {topics.length === 0 ? (
              <div className="text-center py-12 border border-[#e5e3df] rounded-xl bg-white p-6">
                <Brain size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-[#1a1a1a] font-bold text-sm">No learning paths yet</p>
                <p className="text-xs text-[#787671] mt-1">Search for a topic above to initiate your first course!</p>
              </div>
            ) : (
              topics.map((topic) => (
                <GlassCard
                  key={topic.id}
                  hoverEffect
                  onClick={() => topic.status === 'completed' && navigate(`/learning/${topic.id}`)}
                  className={`p-5 bg-white border-[#e5e3df] flex items-center justify-between gap-6 ${
                    topic.status === 'completed' ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-base font-bold text-[#1a1a1a] font-['Outfit'] truncate hover:text-[#3d27bc] transition-colors">
                        {topic.title}
                      </h4>
                      {topic.status === 'completed' && (
                        <button
                          onClick={(e) => handleDelete(topic.id, e)}
                          title="Delete Pathway"
                          className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] text-[#787671] font-semibold">
                      <span>Created {new Date(topic.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{topic.total_nodes} Chapters</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 flex-shrink-0">
                    {topic.status === 'generating' ? (
                      <span className="text-[10px] text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full animate-pulse font-bold uppercase tracking-wider">
                        Generating...
                      </span>
                    ) : topic.status === 'failed' ? (
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          Failed
                        </span>
                        <button
                          onClick={(e) => handleDelete(topic.id, e)}
                          title="Delete Pathway"
                          className="p-1.5 text-gray-400 hover:text-red-600 border border-[#e5e3df] hover:border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#1a1a1a]">{topic.progress_percentage}%</p>
                          <p className="text-[9px] text-[#787671] uppercase tracking-wider font-semibold">Completed</p>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-24 bg-[#f6f5f4] rounded-full h-2 overflow-hidden border border-[#e5e3df]">
                          <div
                            className="bg-gradient-to-r from-[#3d27bc] to-[#7b3ff2] h-full"
                            style={{ width: `${topic.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#787671] flex items-center space-x-2">
            <Clock size={16} />
            <span>Recent Activity</span>
          </h3>

          <GlassCard className="space-y-6 bg-white border-[#e5e3df] p-5 shadow-sm">
            {!stats?.recent_activity || stats.recent_activity.length === 0 ? (
              <p className="text-xs text-[#787671] text-center py-6">No recent completed chapters</p>
            ) : (
              <div className="relative border-l border-[#e5e3df] pl-4 space-y-6 ml-2">
                {stats.recent_activity.map((activity, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline bullet */}
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#3d27bc] border border-white" />
                    
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#1a1a1a]">
                        Completed <span className="text-[#3d27bc]">{activity.node_title}</span>
                      </p>
                      <p className="text-[10px] text-[#787671] font-semibold">{activity.topic_title}</p>
                      <p className="text-[9px] text-gray-400">
                        {new Date(activity.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
