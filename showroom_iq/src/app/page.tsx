"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Échec de la connexion');
      }

      // Store token (Simple localStorage for now, can be improved to session/cookies later)
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set cookie for Next.js Middleware protection
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;


      // Redirect based on role
      const role = data.user.role;
      if (role === 'OWNER') {
        router.push('/owner/dashboard');
      } else if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/commercial/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex min-h-screen">
        <section className="hidden lg:flex w-1/2 bg-[#F7F3EC] items-center justify-center relative overflow-hidden">
          <div className="absolute inset-6 inset-frame pointer-events-none"></div>
          <div className="absolute inset-0 opacity-20" data-alt="soft warm cream background with subtle golden light leak effect for luxury editorial feel" style={{backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(184, 150, 12, 0.1) 0%, transparent 50%)'}}></div>
          <div className="relative z-10 flex flex-col items-center text-center px-12">
            <h1 className="font-serif text-[120px] leading-none text-primary-container tracking-tighter">SIQ</h1>
            <p className="font-sans text-[14px] uppercase tracking-[0.3em] text-on-surface-variant mt-2 font-medium">ShowroomIQ</p>
            <div className="w-[60px] h-[1px] bg-primary-container/40 my-8"></div>
            <blockquote className="font-serif italic text-[18px] text-on-surface-variant tracking-wide">"Performance. Précision. Excellence."</blockquote>
          </div>
          <div className="absolute bottom-12 left-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline">Established MMXXIV</span>
          </div>
        </section>

        <section className="w-full lg:w-1/2 bg-surface-container-lowest flex items-center justify-center px-6 sm:px-12">
          <div className="w-full max-w-[400px]">
            <div className="lg:hidden mb-12 text-center">
              <h2 className="font-serif text-4xl text-primary-container italic">SIQ</h2>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-outline mt-1">ShowroomIQ</p>
            </div>
            <div className="space-y-2 mb-10">
              <h2 className="font-headline text-[36px] text-on-surface font-medium leading-tight">Bienvenue</h2>
              <p className="font-sans text-[14px] text-on-surface-variant tracking-wide">Connectez-vous pour accéder à votre showroom.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px] font-sans">
                {error}
              </div>
            )}

            <div className="flex p-1 bg-surface-container-low rounded-full mb-8 max-w-fit">
              <button className="px-6 py-1.5 text-[11px] font-mono uppercase tracking-wider bg-surface-container-lowest text-on-surface shadow-sm rounded-full transition-all">Email</button>
              <button className="px-6 py-1.5 text-[11px] font-mono uppercase tracking-wider text-outline hover:text-on-surface transition-all">Mobile</button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="font-sans text-[11px] uppercase tracking-wider text-outline font-semibold ml-1" htmlFor="email">Adresse e-mail</label>
                <input 
                  className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all outline-none text-on-surface placeholder:text-outline-variant/60" 
                  id="email" 
                  placeholder="nom@showroom.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-end ml-1">
                  <label className="font-sans text-[11px] uppercase tracking-wider text-outline font-semibold" htmlFor="password">Mot de passe</label>
                  <a className="font-sans text-[11px] text-primary hover:text-primary-container transition-colors font-medium" href="#">Oublié ?</a>
                </div>
                <div className="relative group">
                  <input 
                    className="w-full h-12 px-4 pr-12 bg-surface-container-low ghost-border rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all outline-none text-on-surface" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary-container transition-colors hover:text-primary-container focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>
              <button 
                className={`w-full h-14 luxury-gradient text-white font-sans font-bold text-[14px] uppercase tracking-[0.15em] rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all mt-6 flex items-center justify-center ${loading ? 'opacity-80 cursor-wait' : ''}`} 
                type="submit"
                disabled={loading}
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : 'Se connecter'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-surface-container text-center">
              <p className="font-sans text-[14px] text-on-surface-variant">
                Accès restreint aux partenaires SIQ. 
                <a className="text-primary font-semibold hover:underline decoration-primary-container underline-offset-4" href="#"> Demander l'accès</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
