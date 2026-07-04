import { useState, useEffect, type FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, CheckCircle2, 
  HelpCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, EyeOff, Lock, Clock
} from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';


interface Material {
  beginner_notes: string;
  detailed_notes: string;
  revision_notes: string;
}

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Quiz {
  id: number;
  node_id: number;
  title: string;
  questions: Question[];
}

interface InterviewQA {
  id: number;
  question: string;
  answer: string;
}

interface Illustration {
  id: number;
  topic_id: number;
  section_name: string;
  concept: string;
  illustration_type: string;
  caption: string;
  prompt: string;
  image_url: string | null;
  display_order: number;
  is_hidden: boolean;
  created_at: string;
}

const IllustrationPlaceholder: FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-[#e5e3df] rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center border-b border-[#fafaf9] pb-3">
        <div className="h-4 bg-[#f0ecf8] rounded-md w-1/3"></div>
        <div className="h-3.5 bg-[#f0ecf8] rounded-full w-8"></div>
      </div>
      <div className="h-48 bg-[#fafaf9] border border-dashed border-[#e5e3df] rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2 text-[#787671]">
          <RefreshCw className="animate-spin text-[#3d27bc]" size={20} />
          <span className="text-[10px] font-semibold">AI Agent Sketching Diagram...</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-[#f0ecf8] rounded-md w-3/4"></div>
        <div className="h-3 bg-[#f0ecf8] rounded-md w-1/2"></div>
      </div>
    </div>
  );
};

interface IllustrationCardProps {
  illustration: Illustration;
  onRegenerate: (id: number) => void;
  onHide: () => void;
  onFullscreen: (url: string) => void;
}

const IllustrationCard: FC<IllustrationCardProps> = ({ 
  illustration, 
  onRegenerate, 
  onHide, 
  onFullscreen 
}) => {
  if (!illustration.image_url) {
    return <IllustrationPlaceholder />;
  }

  const apiBase = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
  const imageUrl = `${apiBase}${illustration.image_url}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${illustration.concept.replace(/\s+/g, '_')}_illustration.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-[#e5e3df] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
      <div className="flex justify-between items-center border-b border-[#fafaf9] pb-3">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#3d27bc] bg-[#e6e0f5] px-2 py-0.5 rounded-full">
            {illustration.illustration_type}
          </span>
          <h4 className="text-xs font-bold text-[#1a1a1a] mt-1">{illustration.concept}</h4>
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => onRegenerate(illustration.id)}
            title="Regenerate Illustration"
            className="p-1.5 rounded-lg border border-[#e5e3df] hover:border-[#3d27bc]/40 text-[#787671] hover:text-[#3d27bc] hover:bg-[#e6e0f5]/10 transition-all cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>
          <button 
            onClick={onHide}
            title="Hide Illustration"
            className="p-1.5 rounded-lg border border-[#e5e3df] hover:border-red-300 text-[#787671] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          >
            <EyeOff size={13} />
          </button>
        </div>
      </div>

      <div className="relative group overflow-hidden border border-[#e5e3df] rounded-xl bg-white aspect-[3/2] flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={illustration.caption} 
          loading="lazy" 
          className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
          onClick={() => onFullscreen(imageUrl)}
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 pointer-events-none group-hover:pointer-events-auto">
          <button 
            onClick={() => onFullscreen(imageUrl)}
            className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-[#1a1a1a] font-bold text-[10px] rounded-lg transition-all shadow-md cursor-pointer pointer-events-auto"
          >
            Preview Fullscreen
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="px-3.5 py-1.5 bg-[#3d27bc] hover:bg-[#3e28bd] text-white font-bold text-[10px] rounded-lg transition-all shadow-md cursor-pointer pointer-events-auto"
          >
            Download
          </button>
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <p className="text-[11px] text-[#37352f] leading-relaxed italic">
          "{illustration.caption}"
        </p>
      </div>
    </div>
  );
};

const CustomNode: FC<NodeProps> = ({ data }) => {
  const nodeData = data as any;
  const isCompleted = nodeData.is_completed;
  const isUnlocked = nodeData.is_unlocked;
  const quizScore = nodeData.quiz_score;

  let cardStyle = "border-[#e5e3df] bg-white hover:border-[#3d27bc]/40 text-[#1a1a1a]";
  let statusBadge = null;

  if (!isUnlocked) {
    cardStyle = "border-[#e5e3df] bg-gray-50 opacity-60 text-gray-500 cursor-not-allowed";
    statusBadge = (
      <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-gray-200/50 px-1.5 py-0.5 rounded">
        <Lock size={10} /> Locked
      </span>
    );
  } else if (isCompleted) {
    cardStyle = "border-[#1aae39]/30 bg-[#d9f3e1]/40 hover:bg-[#d9f3e1]/60 text-[#1aae39]";
    statusBadge = (
      <span className="flex items-center gap-1 text-[9px] font-bold text-[#1aae39] bg-[#d9f3e1] px-1.5 py-0.5 rounded">
        ✓ Completed
      </span>
    );
  } else {
    cardStyle = "border-[#3d27bc]/30 bg-[#e6e0f5]/15 hover:bg-[#e6e0f5]/25 text-[#3d27bc] active-glow";
    statusBadge = (
      <span className="flex items-center gap-1 text-[9px] font-bold text-[#3d27bc] bg-[#e6e0f5] px-1.5 py-0.5 rounded">
        ● Study Now
      </span>
    );
  }

  const difficultyColors = {
    Beginner: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    Intermediate: "bg-amber-50 text-amber-600 border border-amber-100",
    Advanced: "bg-rose-50 text-rose-600 border border-rose-100"
  }[nodeData.difficulty as string] || "bg-gray-50 text-gray-600";

  return (
    <div className="relative">
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: '#3d27bc', width: '8px', height: '8px', border: '2px solid white' }} 
      />
      
      <GlassCard className={`p-4 w-[210px] rounded-xl text-left border shadow-sm transition-all duration-200 ${cardStyle}`}>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${difficultyColors}`}>
              {nodeData.difficulty}
            </span>
            {statusBadge}
          </div>

          <div>
            <h4 className="text-xs font-bold font-['Outfit'] truncate">
              {nodeData.order}. {nodeData.title}
            </h4>
            <p className="text-[9px] text-[#787671] line-clamp-2 mt-0.5 leading-relaxed">
              {nodeData.description}
            </p>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-[#e5e3df]/40 text-[9px] text-[#787671] font-semibold">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {nodeData.estimated_time}
            </span>
            {quizScore !== null && (
              <span className="text-[#1aae39] font-bold">
                Quiz: {quizScore}%
              </span>
            )}
          </div>
        </div>
      </GlassCard>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: '#3d27bc', width: '8px', height: '8px', border: '2px solid white' }} 
      />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode
};

export const LearningSpace: FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  
  // Topic and Roadmap state
  const [topic, setTopic] = useState<{ id: number; title: string; status: string } | null>(null);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<any>([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  
  // Selected Node detailed content state
  const [material, setMaterial] = useState<Material | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [interviews, setInterviews] = useState<InterviewQA[]>([]);
  const [nodeProgress, setNodeProgress] = useState<{ is_completed: boolean; quiz_score: number | null }>({
    is_completed: false,
    quiz_score: null
  });

  // Progressive Generation Jobs status
  const [jobs, setJobs] = useState<Record<string, any>>({});

  // UI state
  const [activeTab, setActiveTab] = useState<'beginner' | 'detailed' | 'revision' | 'quiz' | 'interview'>('beginner');
  const [isLoading, setIsLoading] = useState(true);
  const [isNodeLoading, setIsNodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  
  // Quiz running state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Interview QA reveal state
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  // Illustrations State
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [showIllustrations, setShowIllustrations] = useState<boolean>(() => {
    const saved = localStorage.getItem('nf_show_illustrations');
    return saved !== null ? saved === 'true' : true;
  });
  const [illustrationDensity, setIllustrationDensity] = useState<'minimal' | 'balanced' | 'detailed'>(() => {
    const saved = localStorage.getItem('nf_illustration_density');
    return (saved as 'minimal' | 'balanced' | 'detailed') || 'balanced';
  });
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('nf_show_illustrations', String(showIllustrations));
  }, [showIllustrations]);

  useEffect(() => {
    localStorage.setItem('nf_illustration_density', illustrationDensity);
  }, [illustrationDensity]);

  const fetchIllustrations = async () => {
    try {
      const response = await api.get(`/learning/topic/${topicId}/illustrations`);
      setIllustrations(response.data.illustrations || []);
    } catch (err) {
      console.error('Failed to fetch illustrations:', err);
    }
  };

  // Poll for generating illustrations
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const hasGenerating = illustrations.some(ill => !ill.image_url && !ill.is_hidden);
    if (hasGenerating) {
      interval = setInterval(async () => {
        try {
          const response = await api.get(`/learning/topic/${topicId}/illustrations`);
          const currentList = response.data.illustrations || [];
          setIllustrations(currentList);
          
          const stillGenerating = currentList.some((ill: Illustration) => !ill.image_url && !ill.is_hidden);
          if (!stillGenerating) {
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error polling illustrations:', err);
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [illustrations, topicId]);

  const handleRegenerateIllustration = async (illustrationId: number) => {
    try {
      setIllustrations(prev => prev.map(ill => ill.id === illustrationId ? { ...ill, image_url: null } : ill));
      await api.post(`/learning/illustration/${illustrationId}/regenerate`);
      
      const pollInterval = setInterval(async () => {
        try {
          const res = await api.get(`/learning/topic/${topicId}/illustrations`);
          const updated = res.data.illustrations.find((i: Illustration) => i.id === illustrationId);
          if (updated && updated.image_url) {
            setIllustrations(res.data.illustrations);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Failed to poll illustration status:', err);
          clearInterval(pollInterval);
        }
      }, 3000);
      setTimeout(() => clearInterval(pollInterval), 30000);
    } catch (err) {
      console.error('Failed to regenerate illustration:', err);
    }
  };

  const handleToggleHideIllustration = async (illustrationId: number, currentlyHidden: boolean) => {
    try {
      const nextHidden = !currentlyHidden;
      setIllustrations(prev => prev.map(ill => ill.id === illustrationId ? { ...ill, is_hidden: nextHidden } : ill));
      await api.post(`/learning/illustration/${illustrationId}/hide`, { is_hidden: nextHidden });
    } catch (err) {
      console.error('Failed to hide illustration:', err);
      setIllustrations(prev => prev.map(ill => ill.id === illustrationId ? { ...ill, is_hidden: currentlyHidden } : ill));
    }
  };

  // Fetch roadmap tree on mount
  const fetchRoadmap = async () => {
    try {
      const response = await api.get(`/roadmap/${topicId}`);
      setTopic(response.data.topic);
      setFlowNodes(response.data.nodes || []);
      setFlowEdges(response.data.edges || []);
      
      if (response.data.topic?.status === 'completed') {
        setIsLoading(false);
      } else if (response.data.topic?.status === 'failed') {
        setError('Roadmap generation failed. Please try again.');
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setError('Failed to load learning roadmap. Please check the ID.');
      setIsLoading(false);
    }
  };

  // Initial mount + Poll roadmap until completed
  useEffect(() => {
    fetchRoadmap();
    fetchIllustrations();
  }, [topicId]);

  useEffect(() => {
    let topicInterval: ReturnType<typeof setInterval>;
    if (topic?.status === 'generating' || isLoading) {
      topicInterval = setInterval(async () => {
        try {
          const response = await api.get(`/roadmap/${topicId}`);
          setTopic(response.data.topic);
          setFlowNodes(response.data.nodes || []);
          setFlowEdges(response.data.edges || []);
          
          if (response.data.topic?.status === 'completed') {
            setIsLoading(false);
            clearInterval(topicInterval);
          } else if (response.data.topic?.status === 'failed') {
            setError('Roadmap generation failed. Please try again.');
            setIsLoading(false);
            clearInterval(topicInterval);
          }
        } catch (err) {
          console.error('Error polling topic status:', err);
          clearInterval(topicInterval);
        }
      }, 2000);
    }

    return () => {
      if (topicInterval) clearInterval(topicInterval);
    };
  }, [topicId, topic?.status, isLoading]);

  // Fetch job statuses for the node
  const fetchNodeStatus = async () => {
    if (!selectedNodeId) return;
    try {
      const res = await api.get(`/generation/node/${selectedNodeId}/status`);
      setJobs(res.data.jobs || {});
    } catch (err) {
      console.error('Failed to fetch job statuses:', err);
    }
  };

  // Polling for job updates when panel is open
  useEffect(() => {
    if (!isSidePanelOpen || !selectedNodeId) return;
    
    fetchNodeStatus();

    const interval = setInterval(() => {
      const activeNotes = jobs.notes?.status === 'running' || jobs.notes?.status === 'pending';
      const activeAssessment = jobs.assessment?.status === 'running' || jobs.assessment?.status === 'pending';
      const activeIllustrations = jobs.illustrations?.status === 'running' || jobs.illustrations?.status === 'pending';
      const notesMissing = !jobs.notes;

      if (activeNotes || activeAssessment || activeIllustrations || notesMissing) {
        fetchNodeStatus();
        
        // Reload details when notes complete
        if (jobs.notes?.status === 'completed' && !material) {
          fetchNodeDetails();
        }
        
        // Reload illustrations and quiz once their respective jobs complete
        if (jobs.assessment?.status === 'completed' && !quiz) {
          fetchNodeDetails();
        }

        if (jobs.illustrations?.status === 'completed') {
          fetchIllustrations();
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedNodeId, isSidePanelOpen, jobs.notes?.status, jobs.assessment?.status, jobs.illustrations?.status]);

  const handleRetryJob = async (jobType: string) => {
    if (!selectedNodeId) return;
    try {
      const res = await api.post(`/generation/node/${selectedNodeId}/retry/${jobType}`);
      setJobs(res.data.jobs || {});
      
      // Clear local states to trigger loading animations immediately
      if (jobType === 'notes') {
        setMaterial(null);
      } else if (jobType === 'assessment') {
        setQuiz(null);
        setInterviews([]);
      }
    } catch (err) {
      console.error(`Failed to retry job ${jobType}:`, err);
    }
  };

  // Fetch node contents when selected node changes
  const fetchNodeDetails = async () => {
    if (!selectedNodeId) return;
    setIsNodeLoading(true);
    setError(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setRevealedAnswers({});
    
    try {
      const contentRes = await api.get(`/learning/node/${selectedNodeId}/content`);
      if (contentRes.status === 202) {
        setMaterial(null);
        setInterviews([]);
        setNodeProgress({ is_completed: false, quiz_score: null });
      } else {
        setMaterial({
          beginner_notes: contentRes.data.beginner_notes,
          detailed_notes: contentRes.data.detailed_notes,
          revision_notes: contentRes.data.revision_notes
        });
        setInterviews(contentRes.data.interview_questions);
        setNodeProgress(contentRes.data.progress);
      }

      // Fetch quiz
      try {
        const quizRes = await api.get(`/learning/node/${selectedNodeId}/quiz`);
        if (quizRes.status === 200) {
          setQuiz(quizRes.data);
        } else {
          setQuiz(null);
        }
      } catch {
        setQuiz(null);
      }
      
    } catch (err) {
      console.error('Error fetching node content:', err);
      setError('Failed to fetch materials for this node.');
    } finally {
      setIsNodeLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeDetails();
  }, [selectedNodeId]);

  const handleMarkCompleted = async () => {
    if (!selectedNodeId) return;
    try {
      const nextCompleted = !nodeProgress.is_completed;
      if (nextCompleted) {
        await api.post(`/roadmap/node/${selectedNodeId}/complete`, {});
      } else {
        await api.post(`/learning/node/${selectedNodeId}/progress`, {
          is_completed: false,
          quiz_score: nodeProgress.quiz_score
        });
      }
      
      // Refresh roadmap
      const roadmapRes = await api.get(`/roadmap/${topicId}`);
      setFlowNodes(roadmapRes.data.nodes || []);
      setFlowEdges(roadmapRes.data.edges || []);
      
      // Refresh local progress
      const contentRes = await api.get(`/learning/node/${selectedNodeId}/content`);
      setNodeProgress(contentRes.data.progress);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleQuizOptionChange = (questionId: number, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleQuizSubmit = async () => {
    if (!quiz || !selectedNodeId) return;
    
    if (Object.keys(quizAnswers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_answer) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / quiz.questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    try {
      await api.post(`/roadmap/node/${selectedNodeId}/complete`, {
        quiz_score: scorePct
      });
      
      const roadmapRes = await api.get(`/roadmap/${topicId}`);
      setFlowNodes(roadmapRes.data.nodes || []);
      setFlowEdges(roadmapRes.data.edges || []);
      
      const contentRes = await api.get(`/learning/node/${selectedNodeId}/content`);
      setNodeProgress(contentRes.data.progress);
    } catch (err) {
      console.error('Failed to save quiz progress:', err);
    }
  };

  const toggleAnswerReveal = (qaId: number) => {
    setRevealedAnswers(prev => ({ ...prev, [qaId]: !prev[qaId] }));
  };

  const renderMarkdownContent = (markdownText: string) => {
    // If illustrations job failed, show option to retry
    if (jobs.illustrations?.status === 'failed') {
      return (
        <div className="space-y-4">
          <div className="prose max-w-none">
            <ReactMarkdown>{markdownText}</ReactMarkdown>
          </div>
          <div className="p-4 bg-red-50 border border-dashed border-red-200 rounded-xl text-center no-print">
            <p className="text-xs font-bold text-red-600 mb-1">Visual illustrations failed to plan</p>
            <button 
              onClick={() => handleRetryJob('illustrations')}
              className="px-3 py-1 bg-[#3d27bc] text-white text-[10px] font-bold rounded-lg hover:bg-[#3e28bd] cursor-pointer"
            >
              Retry Illustrations
            </button>
          </div>
        </div>
      );
    }

    if (!showIllustrations) {
      return (
        <div className="prose max-w-none">
          <ReactMarkdown>{markdownText}</ReactMarkdown>
        </div>
      );
    }

    const maxOrder = {
      minimal: 2,
      balanced: 4,
      detailed: 6
    }[illustrationDensity] || 4;

    const filteredIllustrations = illustrations.filter(ill => {
      return !ill.is_hidden && ill.display_order <= maxOrder;
    });

    // If illustrations are still generating, show skeleton placeholder
    const isIllustrationsGenerating = jobs.illustrations?.status === 'running' || jobs.illustrations?.status === 'pending';
    if ((isIllustrationsGenerating || !jobs.illustrations) && filteredIllustrations.length === 0) {
      return (
        <div className="space-y-4">
          <div className="prose max-w-none">
            <ReactMarkdown>{markdownText}</ReactMarkdown>
          </div>
          <div className="my-8 no-print">
            <IllustrationPlaceholder />
          </div>
        </div>
      );
    }

    if (filteredIllustrations.length === 0) {
      return (
        <div className="prose max-w-none">
          <ReactMarkdown>{markdownText}</ReactMarkdown>
        </div>
      );
    }

    const regex = /^(##+ [^\n]+)$/gm;
    const parts = markdownText.split(regex);
    const renderedElements: React.ReactNode[] = [];
    const renderedIds = new Set<number>();

    if (parts[0]) {
      renderedElements.push(
        <div key="start" className="prose max-w-none">
          <ReactMarkdown>{parts[0]}</ReactMarkdown>
        </div>
      );
    }

    for (let i = 1; i < parts.length; i += 2) {
      const headingLine = parts[i];
      const content = parts[i + 1] || "";
      const headingTitle = headingLine.replace(/^##+\s+/, "").trim();

      renderedElements.push(
        <div key={`section-${i}`} className="prose max-w-none mt-6">
          <ReactMarkdown>{headingLine + "\n\n" + content}</ReactMarkdown>
        </div>
      );

      const sectionIllustrations = filteredIllustrations.filter(ill => 
        ill.section_name.toLowerCase().includes(headingTitle.toLowerCase()) ||
        headingTitle.toLowerCase().includes(ill.section_name.toLowerCase())
      );

      sectionIllustrations.forEach(ill => {
        renderedIds.add(ill.id);
        renderedElements.push(
          <div key={`ill-wrap-${ill.id}`} className="my-8 no-print">
            <IllustrationCard 
              illustration={ill}
              onRegenerate={handleRegenerateIllustration}
              onHide={() => handleToggleHideIllustration(ill.id, ill.is_hidden)}
              onFullscreen={setFullscreenImageUrl}
            />
          </div>
        );
      });
    }

    const remainingIllustrations = filteredIllustrations.filter(ill => !renderedIds.has(ill.id));
    if (remainingIllustrations.length > 0) {
      renderedElements.push(
        <div key="remaining-title" className="prose max-w-none mt-10 border-t border-[#e5e3df] pt-6">
          <h3 className="text-base font-bold text-[#1a1a1a]">Illustrations & Diagrams</h3>
        </div>
      );
      remainingIllustrations.forEach(ill => {
        renderedElements.push(
          <div key={`ill-wrap-${ill.id}`} className="my-8 no-print">
            <IllustrationCard 
              illustration={ill}
              onRegenerate={handleRegenerateIllustration}
              onHide={() => handleToggleHideIllustration(ill.id, ill.is_hidden)}
              onFullscreen={setFullscreenImageUrl}
            />
          </div>
        );
      });
    }

    return <div className="space-y-4">{renderedElements}</div>;
  };

  const handleNodeClick = (_event: React.MouseEvent, node: any) => {
    const isUnlocked = node.data.is_unlocked;
    if (!isUnlocked) {
      const prereqIds = node.data.prerequisites || [];
      const prereqNodes = flowNodes.filter((fn: any) => prereqIds.includes(Number(fn.id)));
      const prereqTitles = prereqNodes.map((fn: any) => fn.data.title).join(', ');
      
      alert(`Topic Locked! Please complete the prerequisite chapters first: \n${prereqTitles || 'Previous Chapter'}`);
      return;
    }

    setSelectedNodeId(Number(node.id));
    setIsSidePanelOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#3d27bc]">
        <RefreshCw className="animate-spin mb-4" size={40} />
        <p className="font-semibold text-[#787671] text-xs">Loading learning roadmap...</p>
      </div>
    );
  }

  const selectedNode = flowNodes.find(n => Number(n.id) === selectedNodeId);

  // Status flags for the selected node
  const isNotesGenerating = jobs.notes?.status === 'running' || jobs.notes?.status === 'pending';
  const isNotesFailed = jobs.notes?.status === 'failed';
  
  const isAssessmentGenerating = jobs.assessment?.status === 'running' || jobs.assessment?.status === 'pending';
  const isAssessmentFailed = jobs.assessment?.status === 'failed';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e5e3df] pb-5 no-print">
        <div className="space-y-1">
          <Link to="/dashboard" className="flex items-center space-x-2.5 text-[#787671] hover:text-[#3d27bc] text-xs font-semibold transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <h2 className="text-xl font-bold font-['Outfit'] text-[#1a1a1a]">{topic?.title}</h2>
        </div>
        <div className="text-xs text-[#787671] font-semibold bg-gray-100 px-3 py-1.5 rounded-full">
          💡 Click any unlocked node to view study guides, quizzes, and diagrams.
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 no-print">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main React Flow Canvas */}
      <GlassCard className="relative w-full h-[650px] border-[#e5e3df] bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 w-full h-full relative">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.5}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#c8c4d7" gap={16} size={1} />
            <Controls showInteractive={false} className="border border-[#e5e3df] rounded-lg overflow-hidden shadow-sm" />
          </ReactFlow>
        </div>
      </GlassCard>

      {/* Side Panel Overlay */}
      {isSidePanelOpen && selectedNodeId && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm no-print"
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}

      {/* Side Panel Content */}
      <div 
        className={`fixed top-0 right-0 h-screen z-50 w-full sm:w-[600px] md:w-[750px] bg-white border-l border-[#e5e3df] shadow-2xl transition-transform duration-300 transform no-print ${
          isSidePanelOpen && selectedNodeId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Side Panel Header */}
          <div className="flex justify-between items-center p-5 border-b border-[#e5e3df] bg-white">
            <div className="space-y-1">
              <span className="text-[10px] text-[#3d27bc] font-bold uppercase tracking-wider">
                Chapter {selectedNode?.data?.order} • {selectedNode?.data?.difficulty}
              </span>
              <h3 className="text-base font-bold text-[#1a1a1a] font-['Outfit']">{selectedNode?.data?.title}</h3>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleMarkCompleted}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all duration-150 cursor-pointer flex items-center space-x-1.5 ${
                  nodeProgress.is_completed
                    ? 'bg-[#d9f3e1] border border-[#1aae39]/30 text-[#1aae39] hover:bg-[#cbf1d5]'
                    : 'bg-white border border-[#e5e3df] hover:border-[#3d27bc]/30 hover:text-[#3d27bc] text-[#787671] shadow-sm'
                }`}
              >
                {nodeProgress.is_completed ? (
                  <>
                    <CheckCircle2 size={11} />
                    <span>Completed</span>
                  </>
                ) : (
                  <span>Mark Complete</span>
                )}
              </button>

              <button 
                onClick={() => setIsSidePanelOpen(false)}
                className="p-1.5 rounded-lg border border-[#e5e3df] hover:border-[#3d27bc]/30 text-[#787671] hover:text-[#1a1a1a] transition-all cursor-pointer font-bold"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Tabs Selector */}
          <div className="flex border-b border-[#e5e3df] overflow-x-auto space-x-2 px-5 bg-white">
            {(['beginner', 'detailed', 'revision', 'quiz', 'interview'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const labels = {
                beginner: 'Beginner Notes',
                detailed: 'Detailed Notes',
                revision: 'Revision Guide',
                quiz: 'Quiz Challenge',
                interview: 'Interview Coach'
              };
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-3 font-semibold text-xs border-b-2 transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'border-[#3d27bc] text-[#3d27bc]'
                      : 'border-transparent text-[#787671] hover:text-[#1a1a1a]'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Side Panel Body Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white space-y-6">
            {isNodeLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#3d27bc]">
                <RefreshCw className="animate-spin mb-3" size={32} />
                <p className="text-xs font-semibold text-[#787671]">Fetching learning resources...</p>
              </div>
            ) : (
              <>
            
            {(activeTab === 'beginner' || activeTab === 'detailed' || activeTab === 'revision') && !isNotesGenerating && !isNotesFailed && (
              <div className="flex justify-between items-center bg-gray-50 border border-[#e5e3df] p-3.5 rounded-xl text-xs">
                <span className="font-bold text-[#1a1a1a]">📚 Reading View Config</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowIllustrations(!showIllustrations)}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                      showIllustrations 
                        ? 'bg-[#e6e0f5] text-[#3d27bc] border border-[#3d27bc]/10' 
                        : 'bg-white text-[#787671] border border-[#e5e3df] hover:border-[#3d27bc]/20'
                    }`}
                  >
                    🎨 Illustrations: {showIllustrations ? "On" : "Off"}
                  </button>
                  {showIllustrations && (
                    <select
                      value={illustrationDensity}
                      onChange={(e) => setIllustrationDensity(e.target.value as any)}
                      className="bg-white border border-[#e5e3df] text-[9px] font-bold text-[#787671] rounded-md px-1.5 py-1 focus:outline-none"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="balanced">Balanced</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Notes Tab Content with dedicated loader and retry */}
            {(activeTab === 'beginner' || activeTab === 'detailed' || activeTab === 'revision') && (
              <>
                {isNotesGenerating && (
                  <div className="flex flex-col items-center justify-center py-20 text-[#3d27bc]">
                    <RefreshCw className="animate-spin mb-4" size={28} />
                    <p className="text-xs text-[#787671] font-semibold">AI Agent compiling textbooks...</p>
                  </div>
                )}

                {isNotesFailed && (
                  <div className="text-center py-12 border border-dashed border-red-200 rounded-xl bg-red-50/50">
                    <AlertCircle size={28} className="mx-auto text-red-500 mb-2 animate-bounce" />
                    <h5 className="text-xs font-bold text-[#1a1a1a]">Notes Generation Failed</h5>
                    <p className="text-[10px] text-[#787671] max-w-xs mx-auto mt-1 leading-relaxed">
                      {jobs.notes?.error_message || "An error occurred while compiling study guides."}
                    </p>
                    <button
                      onClick={() => handleRetryJob('notes')}
                      className="mt-4 px-4 py-2 rounded-lg bg-[#3d27bc] text-white text-xs font-bold hover:bg-[#3e28bd] cursor-pointer"
                    >
                      Retry Notes Generation
                    </button>
                  </div>
                )}

                {!isNotesGenerating && !isNotesFailed && material && (
                  <>
                    {activeTab === 'beginner' && renderMarkdownContent(material.beginner_notes)}
                    {activeTab === 'detailed' && renderMarkdownContent(material.detailed_notes)}
                    {activeTab === 'revision' && renderMarkdownContent(material.revision_notes)}
                  </>
                )}
              </>
            )}

            {/* Quiz Tab Content with dedicated loader and retry */}
            {activeTab === 'quiz' && (
              <>
                {isAssessmentGenerating && (
                  <div className="flex flex-col items-center justify-center py-20 text-[#3d27bc]">
                    <RefreshCw className="animate-spin mb-4" size={28} />
                    <p className="text-xs text-[#787671] font-semibold">AI Agent generating practice quiz questions...</p>
                  </div>
                )}

                {isAssessmentFailed && (
                  <div className="text-center py-12 border border-dashed border-red-200 rounded-xl bg-red-50/50">
                    <AlertCircle size={28} className="mx-auto text-red-500 mb-2 animate-bounce" />
                    <h5 className="text-xs font-bold text-[#1a1a1a]">Assessment Generation Failed</h5>
                    <p className="text-[10px] text-[#787671] max-w-xs mx-auto mt-1 leading-relaxed">
                      {jobs.assessment?.error_message || "Failed to generate assessment content."}
                    </p>
                    <button
                      onClick={() => handleRetryJob('assessment')}
                      className="mt-4 px-4 py-2 rounded-lg bg-[#3d27bc] text-white text-xs font-bold hover:bg-[#3e28bd] cursor-pointer"
                    >
                      Retry Quiz Generation
                    </button>
                  </div>
                )}

                {!isAssessmentGenerating && !isAssessmentFailed && (
                  <div className="space-y-8">
                    {!quiz ? (
                      <div className="text-center py-12 text-gray-400">
                        <HelpCircle className="mx-auto mb-3" size={32} />
                        <p className="text-xs">Quiz not available for this node</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 border-b border-[#e5e3df] pb-4">
                          <h4 className="text-base font-bold text-[#1a1a1a]">{quiz.title}</h4>
                          <p className="text-xs text-[#787671]">Select the correct answers below to verify your skills.</p>
                        </div>

                        <div className="space-y-6">
                          {quiz.questions.map((q, qidx) => {
                            const selectedOption = quizAnswers[q.id];
                            return (
                              <div key={q.id} className="space-y-3 p-5 border border-[#e5e3df] rounded-xl bg-[#fafaf9]">
                                <h5 className="text-xs font-bold text-[#1a1a1a]">
                                  {qidx + 1}. {q.question_text}
                                </h5>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {q.options.map((option, oidx) => {
                                    const isSelected = selectedOption === option;
                                    const isCorrect = option === q.correct_answer;
                                    
                                    let btnStyle = "border-[#e5e3df] bg-white text-[#37352f] hover:bg-[#f6f5f4]";
                                    
                                    if (quizSubmitted) {
                                      if (isCorrect) {
                                        btnStyle = "border-[#1aae39]/50 bg-[#d9f3e1] text-[#1aae39]";
                                      } else if (isSelected) {
                                        btnStyle = "border-red-300 bg-red-50 text-red-600";
                                      } else {
                                        btnStyle = "border-[#e5e3df]/40 bg-white/50 opacity-60";
                                      }
                                    } else if (isSelected) {
                                      btnStyle = "border-[#3d27bc] bg-[#e6e0f5] text-[#3d27bc]";
                                    }

                                    return (
                                      <button
                                        key={oidx}
                                        onClick={() => handleQuizOptionChange(q.id, option)}
                                        disabled={quizSubmitted}
                                        className={`px-4 py-3 rounded-lg border text-xs font-semibold text-left transition-all ${btnStyle} ${!quizSubmitted && 'cursor-pointer'}`}
                                      >
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>

                                {quizSubmitted && (
                                  <div className="mt-3 p-3 bg-[#e6e0f5]/25 border border-[#3d27bc]/15 rounded-lg text-xs text-[#37352f] leading-relaxed">
                                    <span className="font-bold text-[#3d27bc]">Explanation:</span> {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {!quizSubmitted ? (
                          <button
                            onClick={handleQuizSubmit}
                            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#3d27bc] hover:bg-[#3e28bd] text-white font-bold text-xs shadow-sm cursor-pointer text-center"
                          >
                            Submit Quiz Answers
                          </button>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-[#3d27bc]/20 bg-[#e6e0f5]/10 rounded-xl">
                            <div>
                              <p className="text-xs font-bold text-[#1a1a1a]">Quiz Score: {quizScore}%</p>
                              <p className="text-[11px] text-[#787671] mt-0.5">
                                {quizScore && quizScore >= 80 ? "Superb work! You've mastered this chapter!" : "Review the notes and try again to improve your score."}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setQuizAnswers({});
                                setQuizSubmitted(false);
                                setQuizScore(null);
                              }}
                              className="px-4 py-2 rounded-lg border border-[#3d27bc]/30 text-[#3d27bc] text-xs font-bold hover:bg-[#e6e0f5] cursor-pointer"
                            >
                              Retake Quiz
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Interview Prep Tab Content with dedicated loader and retry */}
            {activeTab === 'interview' && (
              <>
                {isAssessmentGenerating && (
                  <div className="flex flex-col items-center justify-center py-20 text-[#3d27bc]">
                    <RefreshCw className="animate-spin mb-4" size={28} />
                    <p className="text-xs text-[#787671] font-semibold">AI Agent generating interview questions...</p>
                  </div>
                )}

                {isAssessmentFailed && (
                  <div className="text-center py-12 border border-dashed border-red-200 rounded-xl bg-red-50/50">
                    <AlertCircle size={28} className="mx-auto text-red-500 mb-2 animate-bounce" />
                    <h5 className="text-xs font-bold text-[#1a1a1a]">Assessment Generation Failed</h5>
                    <p className="text-[10px] text-[#787671] max-w-xs mx-auto mt-1 leading-relaxed">
                      {jobs.assessment?.error_message || "Failed to generate assessment content."}
                    </p>
                    <button
                      onClick={() => handleRetryJob('assessment')}
                      className="mt-4 px-4 py-2 rounded-lg bg-[#3d27bc] text-white text-xs font-bold hover:bg-[#3e28bd] cursor-pointer"
                    >
                      Retry Interview Prep Generation
                    </button>
                  </div>
                )}

                {!isAssessmentGenerating && !isAssessmentFailed && (
                  <div className="space-y-6">
                    <div className="space-y-1 border-b border-[#e5e3df] pb-4">
                      <h4 className="text-base font-bold text-[#1a1a1a] font-['Outfit']">Interview Preparation</h4>
                      <p className="text-xs text-[#787671]">Review questions and click to reveal model answers.</p>
                    </div>

                    <div className="space-y-4">
                      {interviews.length === 0 ? (
                        <p className="text-xs text-[#787671] text-center py-6">No interview Q&A generated yet</p>
                      ) : (
                        interviews.map((qa, index) => {
                          const isRevealed = !!revealedAnswers[qa.id];
                          return (
                            <div key={qa.id} className="border border-[#e5e3df] rounded-xl p-5 bg-[#fafaf9] space-y-4 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start space-x-3">
                                  <span className="text-[10px] font-bold text-[#a02e6d] bg-[#fde0ec] px-2 py-0.5 rounded flex-shrink-0 mt-0.5">Q{index + 1}</span>
                                  <h5 className="text-xs font-bold text-[#1a1a1a] leading-relaxed">{qa.question}</h5>
                                </div>
                                <button
                                  onClick={() => toggleAnswerReveal(qa.id)}
                                  className="text-xs text-[#3d27bc] hover:text-[#3e28bd] font-bold flex items-center space-x-1 cursor-pointer flex-shrink-0"
                                >
                                  <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                                  {isRevealed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              </div>
                              {isRevealed && (
                                <div className="pl-9 text-xs leading-relaxed text-[#37352f] border-l-2 border-[#3d27bc] transition-all duration-200">
                                  <span className="font-bold text-[#3d27bc] block mb-1">Model Answer:</span>
                                  {qa.answer}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* External Resources Section */}
            {!isNotesGenerating && !isNotesFailed && selectedNode?.data?.resources && selectedNode.data.resources.length > 0 && (
              <div className="border-t border-[#e5e3df] pt-6 mt-8 space-y-3">
                <h4 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">🔗 Recommended Study Resources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedNode.data.resources.map((res: any, idx: number) => (
                    <a 
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-[#e5e3df] rounded-xl hover:border-[#3d27bc]/40 hover:bg-[#e6e0f5]/5 text-xs text-[#37352f] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{res.title}</span>
                      <span className="text-[#3d27bc] text-[10px]">Visit →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenImageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreenImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-white border border-[#e5e3df] p-2" onClick={(e) => e.stopPropagation()}>
            <img 
              src={fullscreenImageUrl} 
              alt="Fullscreen Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <button 
              onClick={() => setFullscreenImageUrl(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningSpace;
