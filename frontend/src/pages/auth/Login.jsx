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
    }

    return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background  transition-colors duration-300">

      {/* Card */}
      <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-xl dark:shadow-slate-900/60 p-9">

        {/* Header */}
        <div className="text-center mb-7">
        
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Se connecter
          </h1>
    
        </div>

        

       

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>

          
          
          {errors.general && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-background text-foreground" role="alert">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {errors.general}
              </p>
            </div>
          )}

          


          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">
              Adresse e-mail
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              required
              className="input w-full bg-transparent border border-border rounded-xl "
            />
            
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="input w-full bg-transparent border border-border rounded-xl"/>
             
            </div>
          </div>

         

          {/* Submit */}
          <button
            type="submit"
            className={`w-full btn hover:border-0 border-0 hover:shadow-2xl  block px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-amber-500/20 transition-all duration-300 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-foreground">
          Vous n'avez pas de compte ?{" "}
          <Link
            to="/register"
            className="font-semibold text-warning underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;