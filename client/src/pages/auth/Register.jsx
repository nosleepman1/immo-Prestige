import { useState } from "react";
import {FcGoogle} from 'react-icons/fc'
import {useNavigate} from 'react-router-dom'

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const Register = () => {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
 
    const navigate = useNavigate();


  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });

  

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-stone-100 dark:bg-slate-950 transition-colors duration-300">

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-slate-900/60 p-9">

        {/* Header */}
        <div className="text-center mb-7">
        
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Créer un compte
          </h1>
    
        </div>

        

       

        {/* Form */}
        <form className="space-y-4">

          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Adresse e-mail
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
              />
              
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
              />
              
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`mt-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-lg  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900`}
          >
            Creer un compte
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-stone-500 dark:text-slate-400">
          Vous avez déjà un compte ?{" "}
          <a
            href="#"
            className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150"
          >
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;