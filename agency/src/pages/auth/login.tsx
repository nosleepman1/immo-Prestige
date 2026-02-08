import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, Eye, EyeOff, Building2, FileCheck2, CalendarCheck2, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { loginSchema, type LoginFormValues } from '@/lib/schemas'
import useLogin from '@/hooks/auth/useLogin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthBrandPanel from '@/components/auth/AuthBrandPanel'
import ThemeToggle from '@/components/ui/theme-toggle'

const container = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30, staggerChildren: 0.07 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

/** What the space actually does — three claims, not a feature list. */
const HIGHLIGHTS = [
  {
    icon: <FileCheck2 className="size-4" />,
    title: 'Du dossier au bail signé',
    description: 'Instruisez les demandes, générez le contrat depuis vos propres clauses.',
  },
  {
    icon: <CalendarCheck2 className="size-4" />,
    title: 'Loyers et quittances',
    description: 'Échéancier automatique, encaissement espèces tracé, quittance en un clic.',
  },
  {
    icon: <MessageSquare className="size-4" />,
    title: 'Vos clients au bout du fil',
    description: 'Messagerie en temps réel et notifications sur chaque étape.',
  },
]

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { handleLogin, loading } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginFormValues) => {
    await handleLogin(data)
  }

  const isLoading = loading || isSubmitting

  return (
    <div className="auth-split">
      <AuthBrandPanel
        badge={<Building2 className="size-5" />}
        name="ImmoPrestige"
        title="Votre agence, tenue au jour le jour."
        lead="Vos annonces, vos baux et vos loyers dans un seul espace — de la mise en ligne à la quittance."
        highlights={HIGHLIGHTS}
        footer="© 2026 ImmoPrestige — espace réservé aux agences accréditées."
      />

      <div className="auth-panel">
        {/* No sidebar here, so the picker lives in the corner of the form half. */}
        <div className="absolute top-5 right-5 z-20">
          <ThemeToggle compact />
        </div>

        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />

        <motion.div className="auth-panel-inner" variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="auth-header">
            <div className="auth-logo lg:hidden">
              <Building2 className="size-5 text-primary" />
            </div>
            <h1 className="auth-title">Espace Agence</h1>
            <p className="auth-subtitle">Connectez-vous pour reprendre où vous en étiez</p>
          </motion.div>

        <motion.form
          variants={item}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="auth-form"
        >
          <div className="auth-field">
            <Label htmlFor="email" className="auth-label">
              Email
            </Label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" />
              <Input
                id="email"
                type="email"
                placeholder="tine@gmail.com"
                className={`auth-input pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="auth-error">
                {errors.email.message}
              </motion.p>
            )}
          </div>

          <div className="auth-field">
            <Label htmlFor="password" className="auth-label">
              Mot de passe
            </Label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`auth-input pl-10 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                autoComplete="current-password"
                disabled={isLoading}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="auth-eye-btn"
                tabIndex={-1}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="auth-error">
                {errors.password.message}
              </motion.p>
            )}
          </div>

          <Button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </motion.form>

          <motion.p variants={item} className="auth-footer">
            Votre agence n'est pas encore inscrite ?{' '}
            <Link to="/register" className="auth-link font-semibold">
              Déposer un dossier
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
