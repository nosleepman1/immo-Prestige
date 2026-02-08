import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2, Building2 } from 'lucide-react'
import { registerAgencySchema, type RegisterAgencyFormValues } from '@/lib/schemas'
import { useRegisterAgency } from '@/hooks/agency/useRegisterAgency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const Register = () => {
  const registerAgency = useRegisterAgency()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterAgencyFormValues>({
    resolver: zodResolver(registerAgencySchema),
  })

  const onSubmit = handleSubmit((values) => {
    registerAgency.mutate({
      ...values,
      id_card_document: values.id_card_document[0],
      business_registry_document: values.business_registry_document[0],
      proof_of_address_document: values.proof_of_address_document?.[0],
    })
  })

  return (
    <div className="auth-page-bg py-10">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card max-w-xl w-full">
        <div className="auth-header">
          <div className="auth-logo">
            <Building2 className="size-5 text-primary" />
          </div>
          <h1 className="auth-title">Inscrire mon agence</h1>
          <p className="auth-subtitle">
            Votre dossier sera examiné par un administrateur. Vous recevrez un lien pour définir
            votre mot de passe une fois accepté.
          </p>
        </div>

        <form onSubmit={onSubmit} className="auth-form grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Raison sociale" error={errors.company_name?.message}>
            <Input {...register('company_name')} />
          </Field>
          <Field label="Nom du gérant" error={errors.manager_name?.message}>
            <Input {...register('manager_name')} />
          </Field>
          <Field label="Email" error={errors.email?.message} className="sm:col-span-2">
            <Input type="email" {...register('email')} />
          </Field>
          <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea rows={3} {...register('description')} />
          </Field>
          <Field label="Adresse" error={errors.address?.message}>
            <Input {...register('address')} />
          </Field>
          <Field label="Ville" error={errors.city?.message}>
            <Input {...register('city')} />
          </Field>
          <Field label="Zone d'activité" error={errors.activity_zone?.message}>
            <Input {...register('activity_zone')} />
          </Field>
          <Field label="Téléphone" error={errors.phone?.message}>
            <Input {...register('phone')} />
          </Field>
          <Field label="Numéro de pièce d'identité" error={errors.id_card?.message} className="sm:col-span-2">
            <Input {...register('id_card')} />
          </Field>
          <Field label="Pièce d'identité (PDF/JPG/PNG)" error={errors.id_card_document?.message as string}>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('id_card_document')} />
          </Field>
          <Field label="Registre de commerce" error={errors.business_registry_document?.message as string}>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('business_registry_document')} />
          </Field>
          <Field
            label="Justificatif d'adresse (optionnel)"
            error={errors.proof_of_address_document?.message as string}
            className="sm:col-span-2"
          >
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('proof_of_address_document')} />
          </Field>

          <Button type="submit" className="auth-submit-btn sm:col-span-2" disabled={registerAgency.isPending}>
            {registerAgency.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Envoi en cours...
              </>
            ) : (
              'Envoyer le dossier'
            )}
          </Button>
        </form>

        <p className="auth-footer">
          Déjà accepté ?{' '}
          <Link to="/login" className="auth-link font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`auth-field ${className ?? ''}`}>
      <Label className="auth-label">{label}</Label>
      {children}
      {error && <p className="auth-error">{error}</p>}
    </div>
  )
}

export default Register
