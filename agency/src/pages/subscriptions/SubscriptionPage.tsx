import React from 'react'
import { usePlans } from '@/hooks/subscriptions/usePlans'
import { useCurrentSubscription } from '@/hooks/subscriptions/useCurrentSubscription'
import { useCheckoutSubscription, useCheckoutBadge } from '@/hooks/subscriptions/useCheckout'
import { useMyAgency } from '@/hooks/agency/useMyAgency'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  FiShield,
  FiCheck,
  FiZap,
  FiAward,
  FiLoader,
  FiStar
} from 'react-icons/fi'

const SubscriptionPage: React.FC = () => {
  const plans = usePlans()
  const subscription = useCurrentSubscription()
  const { data: agency } = useMyAgency()
  const checkoutSubscription = useCheckoutSubscription()
  const checkoutBadge = useCheckoutBadge()

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-16">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/15 text-emerald-100 border-white/20 font-medium text-xs">
              <FiStar className="w-3.5 h-3.5 mr-1" /> Formules & Avantages Agence
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">Abonnements & Options</h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl">
            Choisissez l'offre adaptée au volume de votre portefeuille immobilier pour débloquer la publication en illimité et l'accès partenaire.
          </p>
        </div>
      </div>

      {/* Current Active Subscription Banner */}
      {subscription.data && (
        <Card className="border-emerald-200 bg-emerald-50/60 shadow-xs">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FiZap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">Abonnement Actif</span>
                <h3 className="text-base font-bold text-slate-900">
                  {subscription.data.plan?.name || 'Formule Agence'}
                </h3>
                {subscription.data.trial_ends_at && (
                  <span className="text-xs text-slate-500 block">
                    Période d'essai valide jusqu'au {new Date(subscription.data.trial_ends_at).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white px-3 py-1 text-xs font-bold">
                {subscription.data.status?.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">Nos Formules d'Abonnement</h2>
          <p className="text-xs text-slate-500">Sélectionnez votre tarif et réglez en ligne de manière sécurisée</p>
        </div>

        {plans.isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner className="size-8 text-emerald-600" />
            <p className="text-xs font-medium text-slate-500">Chargement des formules d'abonnement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.data?.map((plan) => {
              const isCurrent = subscription.data?.plan?.id === plan.id

              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-white'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs bg-white'
                  }`}
                >
                  <CardHeader className="pb-4 border-b border-slate-100">
                    {isCurrent && (
                      <Badge className="w-fit mb-2 bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px]">
                        Offre Actuelle
                      </Badge>
                    )}
                    <CardTitle className="text-lg font-bold text-slate-900 font-heading">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                        {new Intl.NumberFormat('fr-FR').format(plan.price)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 ml-1.5">{plan.currency}</span>
                      <span className="text-xs text-slate-400 block font-normal mt-0.5">
                        facturé tous les {plan.billing_period_months} mois
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-6">
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2 font-medium text-slate-800">
                        <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Quota de biens : <strong className="text-emerald-900">{plan.property_quota ?? 'Illimité'}</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Publication instantanée sur le fil</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Support client partenaire prioritaire</span>
                      </li>
                    </ul>

                    <Button
                      onClick={() => checkoutSubscription.mutate(plan.id)}
                      disabled={checkoutSubscription.isPending || isCurrent}
                      className={`w-full font-bold text-xs shadow-2xs ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {checkoutSubscription.isPending ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : isCurrent ? (
                        'Formule Actuelle'
                      ) : (
                        'Souscrire cette formule'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Verified Badge Option Card */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <FiShield className="w-5 h-5 text-teal-600" /> Badge de Certification & Confiance Agence
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Augmentez de 60% le taux de conversion sur vos annonces avec le macaron Agence Vérifiée.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-teal-50/50 border border-teal-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <FiAward className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-teal-900">Macaron Officiel "Agence Vérifiée"</h4>
                <p className="text-xs text-slate-600">Activation immédiate après validation du paiement unique.</p>
              </div>
            </div>

            {agency?.is_verified ? (
              <Badge className="bg-teal-600 text-white px-3 py-1.5 text-xs font-bold shrink-0">
                <FiCheck className="w-3.5 h-3.5 mr-1" /> Badge Actif
              </Badge>
            ) : (
              <Button
                onClick={() => checkoutBadge.mutate()}
                disabled={checkoutBadge.isPending}
                className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-5 shadow-2xs shrink-0"
              >
                {checkoutBadge.isPending ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  'Obtenir le Badge Vérifié'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubscriptionPage
