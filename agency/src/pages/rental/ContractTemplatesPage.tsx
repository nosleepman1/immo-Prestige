import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FiArrowDown,
  FiArrowUp,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiStar,
  FiInfo,
} from 'react-icons/fi'
import {
  useContractTemplate,
  useContractTemplates,
  useContractVariables,
  useTemplateMutations,
} from '@/hooks/rental/useContractTemplates'
import { clauseSchema, type ClauseFormSchemaValues } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

/**
 * Where the agency writes the legal content of its leases. The platform owns
 * the document's structure and refuses unknown variables; it passes no
 * judgement on the clauses themselves, which the agency writes and re-reads.
 */
const ContractTemplatesPage: React.FC = () => {
  const templates = useContractTemplates()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')

  const activeId =
    selectedId ?? templates.data?.find((t) => t.is_default)?.id ?? templates.data?.[0]?.id ?? null
  const mutations = useTemplateMutations(activeId ?? undefined)
  const activeTemplate = templates.data?.find((t) => t.id === activeId)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Modèles de contrat
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Vos clauses de bail. La plateforme assemble le document ; elle ne fournit pas de conseil
          juridique — relisez vos articles avant de les utiliser.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6">
        <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2 mb-4">
          <FiFileText className="w-4 h-4 text-emerald-600" /> Vos modèles
        </h2>

        {templates.isLoading ? (
          <Spinner className="size-6 text-emerald-600" />
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {templates.data?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                  item.id === activeId
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.name}
                {item.is_default && (
                  <FiStar
                    className={`w-3 h-3 ${item.id === activeId ? 'text-amber-300' : 'text-amber-500'}`}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Nom d'un nouveau modèle — ex. Bail habitation meublé"
            className="text-xs"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
          <Button
            disabled={!newName.trim() || mutations.create.isPending}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20 shrink-0"
            onClick={() =>
              mutations.create.mutate(
                { name: newName },
                {
                  onSuccess: (created) => {
                    setSelectedId(created.id)
                    setNewName('')
                  },
                }
              )
            }
          >
            <FiPlus className="w-4 h-4 mr-1.5" /> Créer
          </Button>
        </div>

        {activeId && !activeTemplate?.is_default && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs mt-3"
            onClick={() => mutations.update.mutate({ id: activeId, is_default: true })}
          >
            <FiStar className="w-3.5 h-3.5 mr-1.5" /> Utiliser ce modèle par défaut
          </Button>
        )}
      </div>

      {!activeId && !templates.isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FiFileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Aucun modèle de contrat.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sans modèle, un bail sort avec la structure de la plateforme — parties, bien, durée,
            loyer — mais aucun article particulier de votre agence.
          </p>
        </div>
      )}

      {activeId && (
        <>
          <ClauseEditor templateId={activeId} />
          <ClauseList templateId={activeId} />
        </>
      )}
    </div>
  )
}

function ClauseEditor({ templateId }: { templateId: number }) {
  const variables = useContractVariables()
  const mutations = useTemplateMutations(templateId)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClauseFormSchemaValues>({ resolver: zodResolver(clauseSchema) })

  const onSubmit = handleSubmit((values) => {
    mutations.addClause.mutate(values, {
      onSuccess: () => reset(),
      // The 422 names the offending variable; it belongs on the field.
      onError: (error: unknown) => {
        const response = (error as { response?: { data?: { errors?: Record<string, string[]> } } })
          .response
        const bodyError = response?.data?.errors?.body?.[0]
        if (bodyError) setError('body', { message: bodyError })
      },
    })
  })

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6">
      <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2 mb-4">
        <FiPlus className="w-4 h-4 text-emerald-600" /> Ajouter un article
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Intitulé *</Label>
          <Input className="text-xs" {...register('title')} placeholder="Obligations du preneur" />
          {errors.title && (
            <p className="text-[11px] font-medium text-rose-600">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Corps de l'article *</Label>
          <Textarea
            rows={5}
            className="text-xs resize-y font-mono"
            {...register('body')}
            placeholder="Le preneur règle {{bail.loyer}} le {{bail.jour_echeance}} de chaque mois."
          />
          {errors.body && (
            <p className="text-[11px] font-medium text-rose-600">{errors.body.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={mutations.addClause.isPending}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20"
        >
          {mutations.addClause.isPending ? 'Ajout...' : "Ajouter l'article"}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-start gap-2 text-[11px] text-slate-500 mb-3">
          <FiInfo className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Variables disponibles — une variable inconnue arrête la génération du contrat plutôt que
            de laisser un trou dedans.
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {variables.data?.map((variable) => (
            <code
              key={variable}
              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-mono border border-slate-200"
            >
              {`{{${variable}}}`}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClauseList({ templateId }: { templateId: number }) {
  const template = useContractTemplate(templateId)
  const mutations = useTemplateMutations(templateId)
  const clauses = template.data?.clauses ?? []

  // Articles are numbered in the printed contract: their order is part of the
  // document's meaning, not a display preference.
  const move = (index: number, direction: -1 | 1) => {
    const next = [...clauses]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    mutations.reorder.mutate(next.map((clause) => clause.id))
  }

  if (template.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-6 text-emerald-600" />
      </div>
    )
  }

  if (!clauses.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <p className="text-xs text-slate-500">Ce modèle ne contient encore aucun article.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6">
      <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2 mb-4">
        <FiFileText className="w-4 h-4 text-emerald-600" /> Articles
        <Badge variant="outline" className="text-[11px] border-slate-200 bg-slate-50 font-semibold">
          {clauses.length}
        </Badge>
      </h2>

      <div className="space-y-3">
        {clauses.map((clause, index) => (
          <div
            key={clause.id}
            className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="text-xs font-bold text-slate-900">
                <span className="text-emerald-600">Article {index + 1}</span> — {clause.title}
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  <FiArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                  onClick={() => move(index, 1)}
                  disabled={index === clauses.length - 1}
                >
                  <FiArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => mutations.removeClause.mutate(clause.id)}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed font-mono">
              {clause.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContractTemplatesPage
