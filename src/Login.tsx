import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación directa, sin riesgos y a prueba de espacios accidentales
    const cleanEmail = email.trim().toLowerCase();
    const isValidEmail = cleanEmail === 'estudio@radiomerica.com.ve' || cleanEmail === 'estudio@radioamerica.com.ve';
    const isValidPassword = password.trim() === 'america909.estudio';

    if (isValidEmail && isValidPassword) {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="bg-[#131314] text-[#e5e2e3] font-['Inter'] selection:bg-[#ef7c00] selection:text-[#532700] min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Hero Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-transparent to-[#131314]/40 z-10"></div>
        <div className="absolute inset-0 bg-[#131314]/60 z-10"></div>
        <img alt="Radio América Studio" className="w-full h-full object-cover" data-alt="Close-up of a professional studio condenser microphone with a red glow in a dark, moody radio broadcasting booth environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSjxNZf8nBDhfBlwvjc62pux8NY5np6hQ0qpO1fYRU56Cp5I1wl1DUWSNViTpOFvROhp_sYRas8SGTQVPREnKsIIO6SSh3iq59IP4OZxQ7QPjidrObuEGVsMxjaLGJMybGjkEzENLXyGXasHypxoWRyAZupkRK56JM7tkau3g3Tohi6_57ZjaZEbAy_bMV50ucez7ntuCi_d4fKvo_5lfEL5MSmJHXFPp7Syapi1IrYA4CEkgcuq9PdA1qEdF46LiEsjgbdfb6VLL8" />
      </div>

      {/* Top Branding Anchor */}
      <header className="relative z-20 px-10 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="font-['Montserrat'] font-black text-2xl text-[#DDDADB] tracking-tighter">
            ESTUDIO RADIO AMÉRICA <span className="text-[#C13535]">ADMIN</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-['Montserrat'] font-bold tracking-tight">
          <button onClick={() => navigate('/')} className="text-[#DDDADB] opacity-70 hover:text-[#F07D00] transition-colors duration-300">VOLVER AL INICIO</button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center relative z-20 px-6 py-12">
        <div className="w-full max-w-[450px]">
          {/* Login Card */}
          <div className="bg-[#1c1b1c]/70 backdrop-blur-xl rounded-xl p-10 md:p-12 border border-[#59413f]/15 shadow-[0_30px_60px_-12px_rgba(193,53,53,0.15)]">
            {/* Logo & Heading */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c13535]/10 mb-6 border border-[#c13535]/20">
                <span className="material-symbols-outlined text-[#c13535] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>radio</span>
              </div>
              <h1 className="font-['Montserrat'] font-extrabold text-3xl text-[#e5e2e3] tracking-tight mb-2">Bienvenido</h1>
              <p className="text-[#e1bebb] text-sm font-medium opacity-80 uppercase tracking-widest">Patrimonio de Carabobo</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-[#93000a]/20 border border-[#93000a] text-[#ffb4ab] text-sm text-center py-3 rounded-lg font-bold">
                  {error}
                </div>
              )}
              
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-xs font-['Montserrat'] font-bold text-[#e1bebb] uppercase tracking-widest ml-1">Usuario o Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#e1bebb] group-focus-within:text-[#ffba29] transition-colors">person</span>
                  </div>
                  <input required value={email} onChange={(e) => setEmail(e.target.value)} className={`block w-full pl-12 pr-4 py-4 bg-[#0e0e0f] border-none rounded-lg text-[#e5e2e3] placeholder:text-[#e1bebb]/40 focus:ring-0 focus:border-b-2 focus:border-[#ffba29] transition-all ${error ? 'border-b-2 border-[#93000a]' : ''}`} placeholder="estudio@radioamerica.com.ve" type="text" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-['Montserrat'] font-bold text-[#e1bebb] uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#e1bebb] group-focus-within:text-[#ffba29] transition-colors">lock</span>
                  </div>
                  <input required value={password} onChange={(e) => setPassword(e.target.value)} className={`block w-full pl-12 pr-12 py-4 bg-[#0e0e0f] border-none rounded-lg text-[#e5e2e3] placeholder:text-[#e1bebb]/40 focus:ring-0 focus:border-b-2 focus:border-[#ffba29] transition-all ${error ? 'border-b-2 border-[#93000a]' : ''}`} placeholder="••••••••" type={showPassword ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#e1bebb] hover:text-[#ffba29] transition-colors">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-[#C13535] text-white font-['Montserrat'] font-extrabold text-sm py-5 rounded-full uppercase tracking-[0.15em] hover:bg-[#a32b2b] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#C13535]/20 mt-4" type="submit">
                INGRESAR AL PANEL
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="relative z-20 w-full flex flex-col md:flex-row justify-between px-10 py-8 items-center gap-4 bg-transparent">
        <div className="text-[#DDDADB] opacity-40 font-['Montserrat'] text-xs uppercase tracking-[0.05em] text-center md:text-left">
          © 2024 Estudio Radio América. Patrimonio de Carabobo.
        </div>
      </footer>

      {/* Decorative Corner Glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C13535]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#F07D00]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
}