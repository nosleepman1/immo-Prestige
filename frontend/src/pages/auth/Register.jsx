import { useState } from "react";
import {FcGoogle} from 'react-icons/fc'
import {Link} from 'react-router-dom'
import {useRegister} from '../../hooks/useRegister'

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

    const { register, loading, errors } = useRegister()

    const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "", role: "user" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        await register(form)
    }
  

  return (


    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background transition-colors duration-300">

      
      <div className="w-full max-w-md bg-background border border-border text-foreground text-foreground rounded-2xl shadow-xl dark:shadow-slate-900/60 p-9">

      
        <div className="text-center mb-7">
        
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Créer un compte
          </h1>
    
        </div>

        
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">

          <div>
                <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
                Nom complet
                </label>
                <input
                    type="text"
                    name="name"
                    placeholder="johndoe"
                    //value={form.username}
                    onChange={handleChange}
                    
                    className="input w-full bg-transparent border border-border text-foreground rounded-xl"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Adresse e-mail
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              //value={form.email}
              onChange={handleChange}
              
              className="input w-full bg-transparent border border-border text-foreground rounded-xl"
              
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                //value={form.password}
                onChange={handleChange}
                className="input w-full bg-transparent border border-border text-foreground rounded-xl"
              />
              
  
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                name="password_confirmation"
                placeholder="••••••••"
                //value={form.confirm}
                onChange={handleChange}
                
                className="input w-full bg-transparent border border-border text-foreground rounded-xl"
              />
              {errors.password_confirmation && <p className="text-red-600 text-sm mt-1">{errors.password_confirmation[0]}</p>}
            </div>
          </div>

          <div>
           
            
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full btn hover:border-0 hover:shadow-2xl border-0  block px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-amber-500/20 transition-all duration-300 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Création en cours..." : "Créer un compte"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-foreground">
          Vous avez déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-semibold text-warning  underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150"
          >
            Se connecter
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-foreground">
          Vous etes un agence ?{" "}
          <Link
            to="/register-agency" 
            className="font-semibold text-warning underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150"
          >
            S'inscrire 
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;