import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  useContractTemplate,
  useContractTemplates,
  useContractVariables,
  useTemplateMutations,
} from '@/hooks/rental/useContractTemplates'
import { clauseSchema, type ClauseFormSchemaValues } from '@/lib/schemas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

/**
 * Where the agency writes the legal content of its leases. The platform owns
 * the document's structure and refuses unknown variables; it makes no judgement
 * on the clauses themselves, which the agency writes and re-reads.
 */
const ContractTemplatesPage = () => {
  const templates = useContractTemplates()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')

  const activeId = selectedId ?? templates.data?.find((t) => t.is_default)?.id ?? templates.data?.[0]?.id ?? null
  const template = useContractTemplate(activeId ?? NaN)
  const mutations = useTemplateMutations(activeId ?? undefined)

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Modèles de contrat</h1>
        <p className="text-muted-foreground text-sm">
          Vos clauses de bail. La plateforme assemble le document ; elle ne fournit pas de conseil
          juridique — relisez vos articles avant de les utiliser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vos modèles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.isLoading ? (
            <Spinner className="size-5" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {templates.data?.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={item.id === activeId ? 'default' : 'outline'}
                  onClick={() => setSelectedId(item.id)}
                >
                  {item.name}
                  {item.is_default && <Badge variant="secondary" className="ml-2">Par défaut</Badge>}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Nom d'un nouveau modèle"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <Button
              disabled={!newName.trim() || mutations.create.isPending}
              onClick={() =>
                mutations.create.mutate(
                  { name: newName },
                  { onSuccess: (created) => { setSelectedId(created.id); setNewName('') } }
                )
              }
            >
              <Plus className="size-4 mr-1" /> Créer
            </Button>
          </div>

          {activeId && !templates.data?.find((t) => t.id === activeId)?.is_default && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutations.update.mutate({ id: activeId, is_default: true })}
            >
              Utiliser ce modèle par défaut
            </Button>
          )}
        </CardContent>
      </Card>

      {activeId && <ClauseEditor templateId={activeId} />}
      {!activeId && !templates.isLoading && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Aucun modèle. Sans modèle, un bail sort avec la structure de la plateforme mais aucun
          article particulier.
        </p>
      )}

      {template.data && <ClauseList templateId={activeId!} />}
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
      // 422 carries the offending variable name; it belongs on the field.
      onError: (error: unknown) => {
        const response = (error as { response?: { data?: { errors?: Record<string, string[]> } } })
          .response
        const bodyError = response?.data?.errors?.body?.[0]
        if (bodyError) setError('body', { message: bodyError })
      },
    })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ajouter un article</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Intitulé</Label>
            <Input {...register('title')} placeholder="Obligations du preneur" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Corps de l'article</Label>
            <Textarea
              rows={5}
              {...register('body')}
              placeholder="Le preneur règle {{bail.loyer}} le {{bail.jour_echeance}} de chaque mois."
            />
            {errors.body && <p className="text-sm text-destructive">{errors.body.message}</p>}
          </div>

          <Button type="submit" disabled={mutations.addClause.isPending}>
            {mutations.addClause.isPending ? 'Ajout...' : "Ajouter l'article"}
          </Button>
        </form>

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Variables disponibles — une variable inconnue arrête la génération du contrat plutôt que
            de laisser un trou dedans.
          </div>
          <div className="flex flex-wrap gap-1">
            {variables.data?.map((variable) => (
              <code key={variable} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {`{{${variable}}}`}
              </code>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
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

  if (!clauses.length) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground text-center">
          Ce modèle ne contient encore aucun article.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Articles ({clauses.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clauses.map((clause, index) => (
          <div key={clause.id} className="border rounded-md p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-sm">
                Article {index + 1} — {clause.title}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => move(index, -1)} disabled={index === 0}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => move(index, 1)}
                  disabled={index === clauses.length - 1}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => mutations.removeClause.mutate(clause.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{clause.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default ContractTemplatesPage
