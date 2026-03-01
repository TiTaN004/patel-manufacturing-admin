import React, { useState, useEffect } from 'react';
import { Mail, Lock, ShieldCheck, MailCheck, ArrowRight, Loader2, User, KeyRound } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuth } from '../AuthContext';
import { Button } from './ui/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Login
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Step 2: Email Selection
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');

  // Step 3: OTP
  const [otp, setOtp] = useState('');

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ userName, password });
      if (response.data.outVal === 1) {
        setPendingUser(response.data.data[0]);
        // Move to step 2: Get valid emails
        const emailsResponse = await authAPI.getValidEmails();
        if (emailsResponse.data.statusCode === 200) {
          setEmails(emailsResponse.data.data.map((e: any) => e.email));
          setStep(2);
        } else {
          setError("Failed to retrieve verification emails");
        }
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = async (email: string) => {
    setSelectedEmail(email);
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.sendOtp(email);
      if (response.data.statusCode === 200) {
        setStep(3);
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.verifyOtp(selectedEmail, otp);
      if (response.data.statusCode === 200) {
        // Finally logged in!
        login(pendingUser, pendingUser.token);
      } else {
        setError(response.data.message || "Invalid OTP code");
      }
    } catch (err: any) {
      setError("Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="h-24 mb-4 animate-in fade-in zoom-in duration-500">
            <img src="/logo.png" alt="Logo" className="h-full mx-auto object-contain rounded-lg" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Patel Box Admin</h1>
          <p className="text-slate-500 mt-2 font-medium">Secure Store Management System</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1.5 flex bg-slate-100">
             <div className={`h-full bg-indigo-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
          </div>

          <div className="p-8 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleInitialLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
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
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">Verify Identity</h2>
                  <p className="text-sm text-slate-400">Select an email to receive verification code</p>
                </div>

                <div className="space-y-3">
                  {emails.map((email) => (
                    <button
                      key={email}
                      disabled={loading}
                      onClick={() => handleEmailSelect(email)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white border-2 border-slate-50 hover:border-indigo-600 rounded-2xl transition-all group font-medium text-slate-700 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <Mail size={18} />
                        </div>
                        <span className="truncate">{email}</span>
                      </div>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setStep(1)} 
                  className="w-full text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleOtpVerify} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">Enter Code</h2>
                  <p className="text-sm text-slate-400">Enter the 6-digit code sent to <span className="text-indigo-600 font-bold">{selectedEmail}</span></p>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-mono text-2xl tracking-[0.5em] text-center font-bold text-slate-700"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Verify & Access
                      <MailCheck size={20} />
                    </>
                  )}
                </Button>

                <div className="text-center">
                   <button 
                    type="button"
                    onClick={() => handleEmailSelect(selectedEmail)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-colors"
                   >
                     Resend Code
                   </button>
                   <div className="h-4" />
                   <button 
                    onClick={() => setStep(2)} 
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
                  >
                    Use different email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
