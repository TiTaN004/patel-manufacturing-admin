import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, User } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuth } from '../AuthContext';
import { Button } from './ui/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ userName, password });
      const data = response.data;

      if (data.success && data.data && data.data[0]) {
        const userData = data.data[0];
        login(
          {
            userID: userData.userID,
            fullName: userData.fullName,
            userName: userData.userName,
            emailID: userData.emailID,
            mobileNo: userData.mobileNo,
            isAdmin: userData.isAdmin,
          },
          userData.token,
          userData.refreshToken
        );
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="h-24 mb-4 animate-in fade-in zoom-in duration-500">
            <img src="/logo.png" alt="Logo" className="h-full mx-auto object-contain rounded-lg" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Patel Box Admin</h1>
          <p className="text-slate-500 mt-2 font-medium">Secure Store Management System</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />

          <div className="p-8 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
                <p className="text-sm text-slate-400">Enter your credentials to continue</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Sign In 
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};