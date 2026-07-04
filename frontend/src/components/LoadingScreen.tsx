import React from 'react';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  step?: number;  // Optional step tracker to display what agent is running
  onCancel?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "NeuraFlow AI agents are researching and generating your course...", 
  step = 0,
  onCancel
}) => {
  const steps = [
    "Orchestrating agent network...",
    "Deeply researching topic outline...",
    "Structuring personalized roadmap steps...",
    "Drafting study material & analogies...",
    "Formulating quizzes & assessment items...",
    "Polishing interview prep details..."
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md p-6">
      {/* Decorative warm/soft glows in background */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-100 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-100 rounded-full blur-3xl -z-10 opacity-50"></div>

      <div className="relative mb-6">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl border border-[#3d27bc]/20 bg-[#3d27bc]/5 text-[#3d27bc] shadow-sm">
          <Brain size={40} className="animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#1a1a1a] mb-1.5 text-center font-['Outfit']">
        AI Agents Hard At Work
      </h2>
      
      <p className="text-xs text-[#3d27bc] font-semibold mb-6 text-center animate-pulse tracking-wide uppercase">
        {message}
      </p>

      {/* Progress pipeline step display */}
      <div className="w-full max-w-sm bg-[#fafaf9] border border-[#e5e3df] rounded-xl p-5 space-y-3.5 shadow-sm">
        {steps.map((s, idx) => {
          let statusColor = "text-[#787671]";
          let circleColor = "border-[#c8c4be] bg-transparent";
          
          if (idx < step) {
            statusColor = "text-[#1aae39] font-semibold";
            circleColor = "border-[#1aae39] bg-[#d9f3e1]";
          } else if (idx === step) {
            statusColor = "text-[#3d27bc] font-bold animate-pulse";
            circleColor = "border-[#3d27bc] bg-[#e6e0f5]";
          }
          
          return (
            <div key={idx} className="flex items-center space-x-3 transition-all duration-300">
              <div className={`w-3.5 h-3.5 rounded-full border-2 ${circleColor} flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white`}>
                {idx < step && "✓"}
              </div>
              <span className={`text-[11px] ${statusColor}`}>{s}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-[10px] text-[#787671]">
        This might take up to 30 seconds. Do not reload the page.
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 px-5 py-2.5 bg-white hover:bg-red-50 border border-[#e5e3df] hover:border-red-200 text-[#787671] hover:text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          Cancel & Return to Dashboard
        </button>
      )}
    </div>
  );
};

export default LoadingScreen;
