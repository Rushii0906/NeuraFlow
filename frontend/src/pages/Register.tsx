import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Brain, User, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all input fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.error || 'Registration failed. Try a different email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden text-on-surface">
      {/* Subtle Background Ambient Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Register Container */}
      <main className="relative z-10 w-full max-w-[440px] space-y-6">
        {/* Brand Identity */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-white border border-outline-variant flex items-center justify-center rounded-xl mb-4 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo.png" className="w-9 h-9 object-contain" alt="NeuraFlow Logo" />
            </div>
            <h1 className="font-headline-md text-2xl font-bold tracking-tight font-heading">NeuraFlow AI</h1>
          </Link>
          <p className="text-xs text-on-surface-variant mt-2">Create your learning companion account</p>
        </div>

        {/* Main Card */}
        <div className="login-card bg-surface-container-lowest p-8 md:p-10 rounded-xl">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1aae39] mx-auto font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-on-surface">Registration Successful!</h4>
              <p className="text-xs text-on-surface-variant">Redirecting you to the login screen...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="input-field flex items-center border border-[#c8c4be] rounded-lg px-3 py-2.5 transition-all bg-white">
                  <User className="text-outline mr-2" size={18} />
                  <input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-xs p-0 outline-none placeholder:text-outline/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="input-field flex items-center border border-[#c8c4be] rounded-lg px-3 py-2.5 transition-all bg-white">
                  <Mail className="text-outline mr-2" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-xs p-0 outline-none placeholder:text-outline/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="password">
                  Password
                </label>
                <div className="input-field flex items-center border border-[#c8c4be] rounded-lg px-3 py-2.5 transition-all bg-white">
                  <Lock className="text-outline mr-2" size={18} />
                  <input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-xs p-0 outline-none placeholder:text-outline/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-pressed text-white font-bold text-xs py-3.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <span>Register Account</span>
                )}
              </button>
            </form>
          )}

          {!success && (
            <>
              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e5e3df]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-surface-container-lowest px-4 text-outline">Or continue with</span>
                </div>
              </div>

              {/* Social Auth */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 border border-[#e5e3df] hover:border-[#c8c4be] rounded-lg py-2.5 hover:bg-surface-container-low transition-all active:scale-[0.98] cursor-pointer">
                  <img
                    alt="Google"
                    className="w-4 h-4"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG8mYpWlo9UtpUAVnglYVUf6vYRgRPaf8yFGs2D89tu98PCnRntaUdfDV-dmuwPHwYXZrX6bRBj-mFN-3ryNvSRLoMEX_wjWX-zDSBhEnxuF_qkqXmqVC3lCqacwTYIOwSqzg8YtP_3d6TrXVEqduG1Lh1ubJvm4qmdjFtY5WhgcJKhKhm9xdE4V9HXK7l9nQ__Nevwi83QbjQTZWxygEGPPIkF6DLEVY4RloVvRz5oRafbgBeP_dz"
                  />
                  <span className="text-xs font-bold text-on-surface">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 border border-[#e5e3df] hover:border-[#c8c4be] rounded-lg py-2.5 hover:bg-surface-container-low transition-all active:scale-[0.98] cursor-pointer">
                  <svg className="w-4 h-4 fill-on-surface" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                  <span className="text-xs font-bold text-on-surface">GitHub</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Links */}
        <p className="text-center text-xs text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Register;
