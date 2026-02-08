import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiPlus, FiTrash2, FiUsers, FiX, FiPhone, FiMail } from 'react-icons/fi'
import { useOwners, useOwnerMutations } from '@/hooks/rental/useOwners'
import { ownerSchema, type OwnerFormSchemaValues } from '@/lib/schemas'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

/**
 * Owners are agency-internal records: the mandate holders behind the listings.
 * They never appear on a public page.
 */
const OwnersPage: React.FC = () => {
  const { data: owners, isLoading, isError, refetch } = useOwners()
  const { create, remove } = useOwnerMutations()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OwnerFormSchemaValues>({ resolver: zodResolver(ownerSchema) })

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  })

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Propriétaires</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Les mandants pour lesquels votre agence gère des biens. Ces fiches restent internes.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((open) => !open)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20"
        >
          {showForm ? <FiX className="w-4 h-4 mr-1.5" /> : <FiPlus className="w-4 h-4 mr-1.5" />}
          {showForm ? 'Annuler' : 'Nouveau propriétaire'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6 animate-in slide-in-from-top-2 duration-300">
          <h2 className="text-base font-bold text-slate-900 font-heading mb-1">Enregistrer un propriétaire</h2>
          <p className="text-xs text-slate-500 mb-5">
            Seuls le nom et le téléphone sont indispensables — le reste peut être complété plus tard.
          </p>

          <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom *" error={errors.last_name?.message}>
              <Input placeholder="Diouf" className="text-xs" {...register('last_name')} />
            </Field>
            <Field label="Prénom" error={errors.first_name?.message}>
              <Input placeholder="Abdallah" className="text-xs" {...register('first_name')} />
            </Field>
            <Field label="Téléphone *" error={errors.phone?.message}>
              <Input placeholder="77 000 00 00" className="text-xs" {...register('phone')} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="proprietaire@exemple.sn" className="text-xs" {...register('email')} />
            </Field>
            <Field label="Adresse" error={errors.address?.message} className="sm:col-span-2">
              <Input placeholder="12 avenue Cheikh Anta Diop, Dakar" className="text-xs" {...register('address')} />
            </Field>
            <Field label="N° pièce d'identité" error={errors.id_document_number?.message}>
              <Input placeholder="CNI-00000000" className="text-xs" {...register('id_document_number')} />
            </Field>
            <Field label="Notes internes" error={errors.notes?.message} className="sm:col-span-2">
              <Textarea rows={2} className="text-xs resize-y" {...register('notes')} />
            </Field>

            <div className="sm:col-span-2 flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={create.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20"
              >
                {create.isPending ? 'Enregistrement...' : 'Enregistrer le propriétaire'}
              </Button>
              <Button type="button" variant="outline" className="text-xs" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="size-8 text-emerald-600" />
          <p className="text-xs font-medium text-slate-500">Chargement de vos propriétaires...</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-slate-600">Impossible de charger les propriétaires.</p>
          <Button variant="outline" className="text-xs" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !owners?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FiUsers className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Aucun propriétaire enregistré.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Rattachez un propriétaire à vos biens pour suivre vos mandats et faire figurer le bailleur
            sur les contrats de location.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700">Propriétaire</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Contact</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Biens gérés</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id} className="hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                        {owner.last_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{owner.full_name}</div>
                        {owner.has_account && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-700 mt-0.5"
                          >
                            Compte lié
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <FiPhone className="w-3 h-3 text-slate-400" /> {owner.phone}
                    </div>
                    {owner.email && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <FiMail className="w-3 h-3 text-slate-400" /> {owner.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-emerald-800">
                    {owner.properties_count ?? 0}
                  </TableCell>
                  <TableCell className="py-3 text-right pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => remove.mutate(owner.id)}
                      disabled={remove.isPending}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
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
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      {children}
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  )
}

export default OwnersPage
