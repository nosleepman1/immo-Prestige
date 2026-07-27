import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Building2,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Users,
  FileCheck,
  Clock,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  Eye,
  AlertCircle
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useAuthStore } from '@/store/auth.store'
import { useMyAgency } from '@/hooks/agency/useMyAgency'
import { useAgencyStats } from '@/hooks/agency/useAgencyStats'
import { useResubmitAgency } from '@/hooks/agency/useResubmitAgency'
import { useCurrentSubscription } from '@/hooks/subscriptions/useCurrentSubscription'
import { useMyProperties } from '@/hooks/properties/useMyProperties'
import { useRentalApplications } from '@/hooks/rental/useRentalApplications'
import { useLeases } from '@/hooks/rental/useLeases'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import type { ResubmitAgencyPayload } from '@/services/agency/resubmitAgency'

const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const { data: agency, isLoading } = useMyAgency()
  const { data: stats } = useAgencyStats()
  const subscription = useCurrentSubscription()
  const { data: properties } = useMyProperties()
  const { data: applications } = useRentalApplications()
  const { data: leases } = useLeases()

  const [timeRange, setTimeRange] = useState<'6m' | '3m'>('6m')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="size-8 text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Chargement de votre tableau de bord agence...</p>
      </div>
    )
  }

  if (!agency) return null

  if (agency.status !== 'accepted') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Statut du dossier agence :{' '}
              <Badge variant={agency.status === 'refused' ? 'destructive' : 'secondary'}>{agency.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {agency.status === 'pending' && (
              <p>Votre dossier d'agence est actuellement en cours d'examen par les équipes ImmoPrestige.</p>
            )}
            {agency.status === 'refused' && (
              <>
                <p className="font-medium text-rose-700">Motif du refus : {agency.refusal_reason}</p>
                <ResubmitForm />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalProperties = stats?.counters.properties ?? properties?.length ?? 0
  const totalApplications = stats?.counters.applications ?? applications?.length ?? 0
  const pendingApplications = stats?.counters.pending_applications ?? applications?.filter(a => a.status === 'submitted' || a.status === 'under_review')?.length ?? 0
  const activeLeases = stats?.counters.active_leases ?? leases?.filter(l => l.status === 'active')?.length ?? 0

  const revenueData = stats?.revenue_chart ?? []
  const propertyDistribution = stats?.property_distribution ?? []

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/15 text-emerald-100 hover:bg-white/20 border-white/20 font-medium">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Espace Partenaire Prestige
              </Badge>
              {agency.is_verified && (
                <Badge className="bg-teal-400/20 text-teal-100 border-teal-300/30">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Agence Vérifiée
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Bonjour, {agency.manager_name || user?.name || agency.company_name}
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl">
              Tableau de bord de l'agence <span className="font-bold text-white">{agency.company_name}</span>. Suivez l'activité globale de vos biens et analysez vos performances.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/properties/new">
              <Button className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-lg shadow-black/10 gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-700" /> Ajouter un bien
              </Button>
            </Link>
            <Link to="/messages">
              <Button variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white gap-2 backdrop-blur-xs">
                <MessageSquare className="w-4 h-4" /> Messages
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Biens en Gestion</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-heading">{totalProperties}</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> Actifs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Biens actifs dans votre catalogue</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Demandes d'acquisition</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-heading">{totalApplications}</span>
              {pendingApplications > 0 && (
                <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 mr-1" /> {pendingApplications} à traiter
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Candidatures reçues au total</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Baux Actifs</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-heading">{activeLeases}</span>
              <span className="inline-flex items-center text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                En cours
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Contrats de location actifs</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Abonnement Agence</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-900 truncate">
                {subscription.data ? subscription.data.status : 'Pass Pro'}
              </span>
              <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                Actif
              </Badge>
            </div>
            <Link to="/subscription" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-2 inline-flex items-center gap-1">
              Gérer l'abonnement <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 font-heading">Revenus & Ventes Reçues</CardTitle>
              <CardDescription className="text-xs text-slate-500">Évolution réelle des loyers perçus sur les 6 derniers mois</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setTimeRange('6m')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === '6m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 mois
              </button>
              <button
                onClick={() => setTimeRange('3m')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === '3m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3 mois
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeRange === '6m' ? revenueData : revenueData.slice(3)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value: any) => [`${value} €`, 'Paiements perçus']}
                  />
                  <Area type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Distribution Pie Chart */}
        <Card className="border-slate-200/80 shadow-xs bg-white flex flex-col justify-between">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-bold text-slate-900 font-heading">Répartition du Parc</CardTitle>
            <CardDescription className="text-xs text-slate-500">Statut des biens répertoriés en base</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col items-center justify-center">
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {propertyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-2 mt-2">
              {propertyDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} biens</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Recent Properties Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 font-heading">Dernières Demandes</CardTitle>
              <CardDescription className="text-xs text-slate-500">Dossiers de candidature récents à traiter</CardDescription>
            </div>
            <Link to="/rental-applications">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold">
                Tout voir
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!applications || applications.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">Aucune demande reçue pour le moment.</p>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {app.applicant?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{app.applicant?.name || 'Candidat'}</p>
                      <p className="text-[11px] text-slate-500">{app.property?.name || 'Propriété'}</p>
                    </div>
                  </div>
                  <Badge variant={app.status === 'accepted' ? 'default' : 'outline'} className="text-[11px]">
                    {app.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Portfolio Highlights Card */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 font-heading">Aperçu du Catalogue</CardTitle>
              <CardDescription className="text-xs text-slate-500">Derniers biens ajoutés à l'agence</CardDescription>
            </div>
            <Link to="/properties">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold">
                Catalogue complet
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!properties || properties.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">Aucun bien répertorié pour le moment.</p>
            ) : (
              properties.slice(0, 4).map((prop) => {
                const displayPrice = prop.sale?.price || prop.rental?.rent_amount
                return (
                  <div key={prop.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                        {prop.images?.[0]?.url ? (
                          <img src={prop.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">{prop.name}</p>
                        <p className="text-[11px] font-medium text-emerald-600">
                          {displayPrice ? `${displayPrice.toLocaleString()} €` : 'Prix sur demande'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/properties/${prop.id}`}>
                      <Button size="xs" variant="outline" className="h-7 text-xs">
                        <Eye className="w-3 h-3 mr-1" /> Détails
                      </Button>
                    </Link>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ResubmitForm() {
  const resubmit = useResubmitAgency()
  const { register, handleSubmit } = useForm<ResubmitAgencyPayload>()

  return (
    <form
      onSubmit={handleSubmit((values) => resubmit.mutate(values))}
      className="space-y-3 pt-3 border-t border-slate-200"
    >
      <Label className="text-slate-800 text-xs font-medium">Mettre à jour et redéposer le dossier</Label>
      <Textarea placeholder="Nouvelle description (optionnel)" rows={3} {...register('description')} className="text-xs" />
      <Button type="submit" disabled={resubmit.isPending} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
        Redéposer le dossier
      </Button>
    </form>
  )
}

export default Dashboard
