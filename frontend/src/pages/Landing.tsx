import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Sparkles, CheckCircle2, Star, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for FAQ toggles
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const faqs = [
    {
      q: "How does Agentic AI differ from ChatGPT?",
      a: "Agentic AI doesn't just respond to text; it can plan and execute multi-step research tasks autonomously. It can cross-reference multiple sources, build logical syllabus trees, and compile structured revision books without human intervention."
    },
    {
      q: "Are my research documents private?",
      a: "Yes. All documents uploaded to NeuraFlow are encrypted at rest and in transit. We do not use your private data to train our models unless you explicitly opt-in for workspace customization."
    },
    {
      q: "Can I export my learning history?",
      a: "Absolutely. NeuraFlow supports exporting your roadmaps, summaries, and workspaces in Markdown, PDF, and JSON formats for use in Notion, Obsidian, or other second-brain tools."
    }
  ];

  return (
    <div className="bg-background min-h-screen text-on-surface selection:bg-primary-container selection:text-white antialiased">
      
      {/* 1. Sticky Top Navigation */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
              <Brain size={18} />
            </div>
            <span className="font-display-lg text-[22px] font-bold text-primary tracking-tight font-heading">
              NeuraFlow AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#features">Features</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#explore">Explore</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#faq">FAQ</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant">
            <span className="text-on-surface-variant text-[16px] font-bold">🔍</span>
            <input 
              className="bg-transparent border-none text-xs focus:outline-none p-0 w-32 placeholder:text-on-surface-variant/60" 
              placeholder="Search features..." 
              type="text"
            />
          </div>
          <button className="flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all active:scale-95">
            <Sparkles size={16} className="text-primary" />
          </button>
          
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="bg-primary text-white px-5 py-2.5 rounded-full font-label-md text-xs font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Console
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-2">
                Log in
              </Link>
              <button 
                onClick={handleCtaClick}
                className="bg-primary text-white px-5 py-2.5 rounded-full font-label-md text-xs font-semibold hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Explore Platform
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 px-6 md:px-12 hero-gradient">
          <div className="max-w-[1200px] mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-[10px] font-bold uppercase mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Learning Engine
            </div>
            
            <h1 className="font-display-lg text-[32px] md:text-[48px] text-on-surface leading-tight mb-6 max-w-4xl mx-auto font-heading">
              Learn Smarter with <span className="text-primary italic">Agentic AI</span>
            </h1>
            
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              Harness the power of autonomous AI agents to research, summarize, and generate personalized learning roadmaps for any topic in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleCtaClick}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
              >
                Start Learning Free
              </button>
              <a 
                href="#explore"
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-outline-variant text-on-surface rounded-xl font-semibold text-sm hover:bg-surface-container-low transition-all text-center"
              >
                View Catalog
              </a>
            </div>

            {/* 3. Floating UI Preview */}
            <div className="mt-16 relative mx-auto max-w-4xl rounded-2xl overflow-hidden border border-outline-variant bg-surface-container shadow-2xl text-left">
              <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-outline-variant">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20"></div>
                </div>
                <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">NeuraFlow Dashboard • Syllabus Roadmap</div>
                <div className="w-8"></div>
              </div>
              
              <div className="h-[400px] md:h-[480px] relative bg-white">
                <div className="absolute inset-0 p-6 flex flex-col md:flex-row gap-6">
                  {/* Left Mockup Column */}
                  <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="glass-card p-4 rounded-xl h-24 flex flex-col justify-between shimmer">
                      <div className="w-1/2 h-3.5 bg-outline-variant rounded-full"></div>
                      <div className="w-full h-1.5 bg-outline-variant/30 rounded-full"></div>
                      <div className="w-3/4 h-1.5 bg-outline-variant/30 rounded-full"></div>
                    </div>
                    
                    <div className="glass-card p-4 rounded-xl h-44 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded">Path</span>
                        <div className="w-20 h-3 bg-outline-variant rounded-full"></div>
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/10"></div>
                          <div className="w-28 h-1.5 bg-outline-variant/50 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-outline-variant"></div>
                          <div className="w-32 h-1.5 bg-outline-variant/30 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-outline-variant"></div>
                          <div className="w-24 h-1.5 bg-outline-variant/30 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Mockup Column */}
                  <div className="hidden md:flex flex-1 glass-card rounded-xl p-5 flex-col gap-4 overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Brain size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface">Neural Assistant</div>
                        <div className="text-[9px] text-on-surface-variant font-semibold">Active reasoning...</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-hidden">
                      <div className="p-3 bg-surface rounded-lg border border-outline-variant/50 max-w-[80%]">
                        <div className="w-full h-1.5 bg-outline-variant/20 rounded-full mb-1.5"></div>
                        <div className="w-5/6 h-1.5 bg-outline-variant/20 rounded-full"></div>
                      </div>
                      <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-lg self-end ml-auto max-w-[80%]">
                        <div className="text-[11px] font-semibold">Explain Superposition in simple terms.</div>
                      </div>
                      <div className="p-3 bg-surface rounded-lg border border-outline-variant/50 max-w-[90%] shimmer">
                        <div className="w-full h-1.5 bg-outline-variant/30 rounded-full mb-1.5"></div>
                        <div className="w-full h-1.5 bg-outline-variant/30 rounded-full mb-1.5"></div>
                        <div className="w-2/3 h-1.5 bg-outline-variant/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Bento Grid Features */}
        <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto" id="features">
          <div className="mb-16">
            <h2 className="font-display-lg text-[28px] md:text-3xl text-on-surface mb-3 font-heading">Powerful tools for deep focus.</h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-xl">Every feature is designed to reduce cognitive load and accelerate understanding.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* AI Workspace */}
            <div className="md:col-span-8 group relative bg-white border border-outline-variant rounded-2xl p-8 overflow-hidden hover:border-primary transition-all duration-200">
              <div className="relative z-10 max-w-md">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Brain size={20} />
                </div>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2 font-heading">AI Workspace</h3>
                <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                  A unified canvas where AI agents assist with document analysis, summarizing materials, and generating flash assessments.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span>Context-aware research agents</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span>Multi-document synthesis</span>
                  </li>
                </ul>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full hidden lg:block opacity-20 group-hover:opacity-100 transition-opacity">
                <div className="w-full h-full bg-[#f0ecf8] translate-x-12 translate-y-12 rounded-tl-3xl shadow-xl border border-outline-variant p-4">
                  <div className="w-full h-4 bg-outline-variant/30 rounded-full mb-3"></div>
                  <div className="w-5/6 h-2 bg-outline-variant/20 rounded-full mb-2"></div>
                  <div className="w-4/5 h-2 bg-outline-variant/20 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Dynamic Roadmap */}
            <div className="md:col-span-4 bg-surface-container-low border border-outline-variant rounded-2xl p-8 hover:border-primary transition-all duration-200">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Sparkles size={20} />
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2 font-heading">Dynamic Roadmap</h3>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">AI-generated paths that adapt as you learn, ensuring you never hit a wall.</p>
              <div className="relative py-2">
                <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-outline-variant"></div>
                <div className="space-y-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 text-[10px] font-bold text-white">
                      ✓
                    </div>
                    <div className="text-xs font-bold text-on-surface">Foundations</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-primary z-10"></div>
                    <div className="text-xs font-bold text-primary">Core Mechanics</div>
                  </div>
                  <div className="flex items-center gap-3 opacity-40">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-outline z-10"></div>
                    <div className="text-xs font-medium text-on-surface">Advanced Synthesis</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz */}
            <div className="md:col-span-6 bg-white border border-outline-variant rounded-2xl p-8 hover:border-primary hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    <Award size={20} />
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2 font-heading">Smart Quizzing</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Test your retention with AI-generated questions based specifically on your syllabus sessions.</p>
                </div>
                <div className="w-24 h-24 hidden sm:flex bg-surface-container rounded-full border border-dashed border-outline-variant flex-shrink-0 items-center justify-center">
                  <span className="text-xl font-extrabold text-primary">85%</span>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="md:col-span-6 bg-primary text-white rounded-2xl p-8 flex flex-col justify-between">
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d7d2ff]">Performance Insights</span>
              </div>
              <h3 className="text-lg font-bold font-heading mb-4 leading-snug">Track your cognitive growth with precision.</h3>
              <div className="flex gap-4 items-end h-16 mt-4">
                <div className="flex-1 bg-white/20 rounded-t h-[40%]"></div>
                <div className="flex-1 bg-white/40 rounded-t h-[60%]"></div>
                <div className="flex-1 bg-white/60 rounded-t h-[85%] animate-pulse"></div>
                <div className="flex-1 bg-white/20 rounded-t h-[30%]"></div>
                <div className="flex-1 bg-white/50 rounded-t h-[70%]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Testimonials */}
        <section className="bg-surface-container-low py-24">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-[28px] md:text-3xl text-on-surface font-heading">Loved by curious minds.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "NeuraFlow changed how I approach research. I can digest 50-page whitepapers in minutes without losing the nuance.",
                  name: "Dr. Elena Ross",
                  role: "Cognitive Scientist",
                  avatar: "E"
                },
                {
                  quote: "The agentic workspace feels like having a PhD assistant by your side 24/7. Simply unmatched productivity tool.",
                  name: "Marcus Chen",
                  role: "Senior Engineer",
                  avatar: "M"
                },
                {
                  quote: "Finally, an AI tool that doesn't just hallucinate, but actually provides cited sources and structured learning paths.",
                  name: "Sarah Jenkins",
                  role: "Product Designer",
                  avatar: "S"
                }
              ].map((t, idx) => (
                <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full shadow-sm">
                  <div className="flex gap-0.5 mb-6 text-[#1b1bff]">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-xs md:text-sm text-on-surface italic mb-8 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">{t.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Explore Platform Course Catalog */}
        <section id="explore" className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-[1200px] mx-auto space-y-16">
            <div className="text-center space-y-3">
              <span className="bg-[#e6e0f5] text-[#391c57] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Dynamic Courses</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-on-surface tracking-tight">Explore Curriculum Pathways</h2>
              <p className="text-xs md:text-sm text-on-surface-variant">See what subjects our agent network has structured and prepared for study.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  tag: "Developer Track",
                  tagBg: "bg-tint-peach text-[#dd5b00]",
                  title: "Python Developer Core",
                  desc: "Master Python programming foundations, memory models, object-oriented concepts, and advanced closures.",
                  details: "5 Chapters • Interactive Quizzes • Interview QA"
                },
                {
                  tag: "Data Science",
                  tagBg: "bg-tint-lavender text-[#391c57]",
                  title: "Machine Learning Foundations",
                  desc: "Understand core concepts including linear/logistic regression, cost functions, gradient descent, and basic backpropagation.",
                  details: "8 Chapters • Detailed Textbooks • Model Answers"
                },
                {
                  tag: "Cloud Native",
                  tagBg: "bg-tint-mint text-[#1aae39]",
                  title: "Docker & Kubernetes",
                  desc: "Learn containerization from writing Dockerfiles to configuring multi-pod deployments and ingress routing in local clusters.",
                  details: "6 Chapters • Revision Guides • Technical Prep"
                },
                {
                  tag: "Algorithms",
                  tagBg: "bg-tint-rose text-[#a02e6d]",
                  title: "Data Structures & Big O",
                  desc: "Deep dive into tree balancing algorithms, graphs, hash collision resolutions, search filters, and complexity proofs.",
                  details: "10 Chapters • Self Assessment • Model Code"
                }
              ].map((course, idx) => (
                <div key={idx} className="bg-background border border-outline-variant rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:border-primary hover:-translate-y-0.5 transition-all duration-200">
                  <div className="space-y-4">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${course.tagBg}`}>
                      {course.tag}
                    </span>
                    <h4 className="font-bold text-on-surface text-lg font-heading">{course.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{course.desc}</p>
                    <div className="flex items-center gap-3 pt-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      <span>{course.details}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCtaClick}
                    className="w-full mt-8 py-2.5 bg-primary hover:bg-primary-pressed text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    Explore Course Roadmap
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. FAQ Accordion */}
        <section className="py-24 px-6 md:px-12 bg-surface-container-low" id="faq">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface text-center mb-12 font-heading">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = !!faqOpen[idx];
                return (
                  <div key={idx} className="glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="flex items-center justify-between p-6 w-full text-left cursor-pointer hover:bg-surface-container transition-colors"
                    >
                      <h4 className="text-xs md:text-sm font-bold text-on-surface">{faq.q}</h4>
                      <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-xs text-on-surface-variant leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto bg-brand-navy rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-6 font-heading">Ready to accelerate your learning?</h2>
              <p className="text-xs md:text-sm text-blue-200/80 mb-10 max-w-xl mx-auto leading-relaxed">
                Join 50,000+ researchers and students who are scaling their knowledge with NeuraFlow.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={handleCtaClick}
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-xs hover:shadow-2xl hover:bg-primary-pressed transition-all cursor-pointer"
                >
                  Get Started for Free
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer className="bg-surface border-t border-outline-variant py-16 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-xs">
          <div className="col-span-1 space-y-4">
            <div className="text-sm font-bold text-primary font-heading">NeuraFlow AI</div>
            <p className="text-on-surface-variant leading-relaxed">The definitive intelligence layer for deep research and accelerated learning.</p>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-on-surface">Product</h5>
            <ul className="space-y-4 text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Workspace</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Roadmaps</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">API Access</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-on-surface">Company</h5>
            <ul className="space-y-4 text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-on-surface">Subscribe</h5>
            <p className="text-on-surface-variant mb-4">Get the latest on agentic AI updates.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input 
                className="bg-white border border-outline-variant rounded-lg p-3 text-xs focus:outline-none focus:border-primary" 
                placeholder="email@example.com" 
                type="email"
              />
              <button className="bg-primary text-white rounded-lg p-3 font-semibold hover:bg-primary-pressed transition-all cursor-pointer">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-on-surface-variant">
          <div>© 2026 NeuraFlow AI Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <a className="hover:text-primary" href="#">Status</a>
            <a className="hover:text-primary" href="#">Terms</a>
            <a className="hover:text-primary" href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
