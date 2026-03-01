

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import COUNTRIES from '../../data/countries'
import { useAgencyRegister } from '../../hooks/agency/useRegister'


export default function RegisterAgency() {

  

  const [selectedCountry, setSelectedCountry] = useState(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'agency',
    company_name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    id_card: '',
  })

  const {registerAgency, load, errors} = useAgencyRegister()

  const handleChange = (e) => {
    
    const { name, value } = e.target

    if (name === 'country') {
      const country = COUNTRIES.find(c => c.name === value) || null

      setSelectedCountry(country)

      setForm(prev => ({ ...prev, country: value, city: '', phone: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = {
      ...form,
      phone: selectedCountry ? `${selectedCountry.dialCode}${form.phone}` : form.phone,
      role: 'agency',
    }


    await registerAgency(formData)

      .then((reponse) => {
        console.log(reponse);
      })
      .catch((error) => {
        console.log(error);
      })
        
    
  }

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl input bg-transparent border border-border text-foreground text-sm"

  const labelClass = "block text-sm font-medium mb-1.5 text-foreground"


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background transition-colors duration-300">
      <div className="w-full max-w-2xl bg-background border border-border rounded-2xl shadow-xl dark:shadow-slate-900/60 overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-border text-center">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Créer un compte agence
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">
            Remplissez les informations pour enregistrer votre agence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 max-h-[75vh] overflow-y-auto">

          {/* ── Section 1 : Compte ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-success  mb-4">
            Informations du compte
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Nom complet */}
            <div>
              <label className={labelClass}>Nom complet</label>
              <input type="text" name="name" placeholder="Mohamed TINE" onChange={handleChange} className={inputClass} />
              {errors &&  <p className='text-red-600'>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Adresse e-mail</label>
              <input type="email" name="email" placeholder="john@example.com" onChange={handleChange} className={inputClass} />
              {errors &&  <p className='text-red-600'>{errors.email}</p>}
            </div>
            

            {/* Mot de passe */}
            <div>
              <label className={labelClass}>Mot de passe</label>
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange} className={inputClass} />
              {errors &&  <p className='text-red-600'>{errors.password}</p>}
            </div>

            {/* Confirmer */}
            <div>
              <label className={labelClass}>Confirmer le mot de passe</label>
              <input type="password" name="password_confirmation" placeholder="••••••••" onChange={handleChange} className={inputClass} />
              {errors &&  <p className='text-red-600'>{errors.password_confirmation}</p>}
            </div>
          </div>

          {/* ── Section 2 : Agence ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-success  mb-4">
            Informations de l'agence
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Nom de l'entreprise */}
            <div>
              <label className={labelClass}>Nom de l'entreprise</label>
              <input type="text" name="company_name" placeholder="AMBO TECH" onChange={handleChange} className={inputClass} />
              {errors &&  <p className='text-red-600'>{errors.company_name}</p>}

            </div>

            {/* N° de carte d'identité */}
            <div>
              <label className={labelClass}>N° carte d'identité</label>
              <input type="text" name="id_card" placeholder="1648200002" onChange={handleChange} className={inputClass} />
              {errors &&  <p className='text-red-600'>{errors.id_card}</p>}

            </div>

            {/* Description — full width */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Décrivez votre agence en quelques mots..."
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
              {errors &&  <p className='text-red-600'>{errors.description}</p>}
            </div>
          </div>

          {/* ── Section 3 : Localisation ── */}
          <p className=" text-xs font-bold uppercase tracking-widest text-success  mb-4">
            Localisation &amp; contact
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Pays */}
            <div>
              <label className={labelClass}>Pays</label>
              <select
                name="country"
                onChange={handleChange}
                className={`select select-bordered w-full bg-base-100 bg-background text-foreground cursor-pointer text-base-content disabled:opacity-50 disabled:cursor-not-allowed`}
                defaultValue=""
              >
                <option value="" disabled>Sélectionner un pays</option>

                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}

              </select>
              {errors &&  <p className='text-red-600'>{errors.country}</p>}

            </div>

            {/* Ville */}
            <div>
              <label className={labelClass}>Ville</label>
              <select
                name="city"
                onChange={handleChange}
                disabled={!selectedCountry}
                value={form.city}
              >
                <option value="" disabled>
                  {selectedCountry ? 'Sélectionner une ville' : 'Choisissez un pays d\'abord'}
                </option>
                {selectedCountry?.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors &&  <p className='text-red-600'>{errors.city}</p>}
            </div>

            {/* Adresse */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresse</label>
              <input
                type="text"
                name="address"
                placeholder={selectedCountry ? 'Ex : Keur Massar, Rue 12' : 'Choisissez un pays d\'abord'}
                disabled={!selectedCountry}
                onChange={handleChange}
                className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {errors &&  <p className='text-red-600'>{errors.address}</p>}
            </div>

            {/* Téléphone */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Numéro de téléphone</label>
              <div className="flex gap-2">
                {/* Indicatif */}
                <div className={`flex items-center px-3.5 rounded-xl text-sm border bg-background border-stone-200 dark:border-slate-700 text-stone-500 dark:text-slate-400 whitespace-nowrap min-w-[80px] justify-center font-mono ${!selectedCountry ? 'opacity-50' : ''}`}>
                  {selectedCountry ? selectedCountry.dialCode : '+???'}
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="773757077"
                  disabled={!selectedCountry}
                  value={form.phone}
                  onChange={handleChange}
                  className={`${inputClass} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors &&  <p className='text-red-600'>{errors.phone}</p>}
              </div>
              {selectedCountry && (
                <p className="mt-1 text-xs text-foreground ">
                  Le numéro sera enregistré comme : <span className="font-mono text-stone-600 dark:text-slate-300">{selectedCountry.dialCode}{form.phone || 'XXXXXXXXX'}</span>
                </p>
              )}

            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={load}
            className={`w-full btn hover:border-0 border-0 hover:shadow-2xl  block px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-amber-500/20 transition-all duration-300 text-center ${load ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {load ? 'Création en cours...' : 'Créer un compte agence'}
          </button>
        </form>
        <div>
          
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 pt-2 text-center space-y-2 border-t border-stone-100 dark:border-slate-800">
          <p className="text-sm text-stone-500 dark:text-slate-400">
            Vous avez déjà un compte ? {' '}
            <Link to="/login" className="font-semibold text-success underline underline-offset-2 decoration-transparent hover:decoration-current transition-all duration-150">
              Se connecter
            </Link>
          </p>
          
        </div>
      </div>
    </div>
  )
}