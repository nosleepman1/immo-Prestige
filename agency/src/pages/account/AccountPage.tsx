import React from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useMyAgency } from '@/hooks/agency/useMyAgency'
import { useExportAccount } from '@/hooks/account/useExportAccount'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FiUser,
  FiMail,
  FiHome,
  FiPhone,
  FiMapPin,
  FiDownload,
  FiShield,
  FiCheckCircle,
  FiLoader
} from 'react-icons/fi'

const AccountPage: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const { data: agency } = useMyAgency()
  const exportAccount = useExportAccount()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/15 text-emerald-100 border-white/20 font-medium text-xs">
                  Compte Partenaire
                </Badge>
                {agency?.is_verified && (
                  <Badge className="bg-teal-400/20 text-teal-100 border-teal-300/30 text-xs">
                    <FiShield className="w-3.5 h-3.5 mr-1" /> Vérifié
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight font-heading">{user?.name}</h1>
              <p className="text-emerald-100/90 text-xs">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => exportAccount.mutate()}
            disabled={exportAccount.isPending}
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs gap-2 backdrop-blur-xs shadow-xs"
          >
            {exportAccount.isPending ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiDownload className="w-4 h-4" />
            )}
            Exporter mes données
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <FiUser className="w-4 h-4 text-emerald-600" /> Informations Personnelles
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Coordonnées du compte utilisateur principal</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FiUser className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Nom complet</span>
                <span className="text-sm font-bold text-slate-800">{user?.name || '—'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <FiMail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Adresse Email</span>
                <span className="text-sm font-bold text-slate-800">{user?.email || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agency Info Card */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <FiHome className="w-4 h-4 text-emerald-600" /> Informations Agence
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Identité légale et coordonnées professionnelles</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {agency ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FiHome className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Raison Sociale</span>
                    <span className="text-sm font-bold text-slate-800">{agency.company_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <FiPhone className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Téléphone</span>
                      <span className="text-xs font-bold text-slate-800">{agency.phone || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <FiMapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Ville</span>
                      <span className="text-xs font-bold text-slate-800">{agency.city || '—'}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">Aucune agence rattachée.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GDPR Data Compliance */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <FiShield className="w-4 h-4 text-emerald-600" /> Conformité des Données & RGPD
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Téléchargez l'intégralité de vos archives de données personnelles et de l'historique d'activité au format JSON conforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs text-slate-600 font-medium">Export automatique sécurisé et instantané</span>
            </div>
            <Button
              size="sm"
              onClick={() => exportAccount.mutate()}
              disabled={exportAccount.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shadow-2xs"
            >
              {exportAccount.isPending ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiDownload className="w-4 h-4" />
              )}
              Télécharger l'Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountPage
