import { useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
import useLogin from "../../hooks/useLogin";



const Login = () => {
   
    const {handleLogin, loading, errors} = useLogin()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({ email: "", password: ""});

    const handleSubmit = async (e) => {
        e.preventDefault();

        await handleLogin(formData)
          .then(() => {
            navigate('/profile')
          })
          .catch((err) => {
            console.error("Login failed:  ", err)
          });
    }

    return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-stone-100 dark:bg-slate-950 transition-colors duration-300">

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-slate-900/60 p-9">

        {/* Header */}
        <div className="text-center mb-7">
        
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Se connecter
          </h1>
    
        </div>

        

       

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>


          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-slate-300">
              Adresse e-mail
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
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
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>}
            </div>
          </div>

         

          {/* Submit */}
          <button
            type="submit"
            className={`mt-2 w-full cursor-pointer py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-lg  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-stone-500 dark:text-slate-400">
          Vous n'avez pas de compte ?{" "}
          <Link
            to="/register"
            className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;