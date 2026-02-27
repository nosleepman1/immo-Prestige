import React from 'react'

export default function RegisterAgency() {




    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-stone-100 dark:bg-slate-950 transition-colors duration-300">

      
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-slate-900/60 p-9">

      
        <div className="text-center mb-7">
        
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Créer un compte
            </h1>
    
        </div>

        
        <form className="space-y-4" onSubmit={handleSubmit}>

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
                    
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
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
                name="password"
                placeholder="••••••••"
                //value={form.password}
                onChange={handleChange}
                
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
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
                
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600"
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
            className={`mt-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-lg  bg-blue-700 cursor-pointer hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Création en cours..." : "Créer un compte"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-stone-500 dark:text-slate-400">
          Vous avez déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150"
          >
            Se connecter
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-slate-400">
          Vous etes un agence ?{" "}
          <Link
            to="/register-agency" 
            className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150"
          >
            S'inscrire en tant qu'agence
          </Link>
        </p>

      </div>
    </div>
  )
}
