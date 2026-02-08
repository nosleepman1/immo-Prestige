import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'react-router-dom'
import { Loader2, KeyRound } from 'lucide-react'
import { setPasswordSchema, type SetPasswordFormValues } from '@/lib/schemas'
import { useSetAgencyPassword } from '@/hooks/agency/useSetAgencyPassword'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SetPassword = () => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''
  const setPassword = useSetAgencyPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({ resolver: zodResolver(setPasswordSchema) })

  const onSubmit = handleSubmit((values) => {
    setPassword.mutate({ email, token, ...values })
  })

  if (!email || !token) {
    return (
      <div className="auth-page-bg">
        <div className="auth-card">
          <p className="text-center text-destructive">Lien invalide : email ou jeton manquant.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page-bg">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <KeyRound className="size-5 text-primary" />
          </div>
          <h1 className="auth-title">Définir votre mot de passe</h1>
          <p className="auth-subtitle">Dossier accepté pour {email} — dernière étape avant votre période d'essai</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-field">
            <Label className="auth-label">Mot de passe</Label>
            <Input type="password" {...register('password')} />
            {errors.password && <p className="auth-error">{errors.password.message}</p>}
          </div>
          <div className="auth-field">
            <Label className="auth-label">Confirmer le mot de passe</Label>
            <Input type="password" {...register('password_confirmation')} />
            {errors.password_confirmation && <p className="auth-error">{errors.password_confirmation.message}</p>}
          </div>
          <Button type="submit" className="auth-submit-btn" disabled={setPassword.isPending}>
            {setPassword.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Validation...
              </>
            ) : (
              "Activer mon compte"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default SetPassword
