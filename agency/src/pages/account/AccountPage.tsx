import { useAuthStore } from '@/store/auth.store'
import { useExportAccount } from '@/hooks/account/useExportAccount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

const AccountPage = () => {
  const user = useAuthStore((s) => s.user)
  const exportAccount = useExportAccount()

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mon compte</h1>
        <p className="text-muted-foreground text-sm">Informations personnelles et conformité RGPD</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Nom : </span>
            {user?.name}
          </div>
          <div>
            <span className="text-muted-foreground">Email : </span>
            {user?.email}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Données personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => exportAccount.mutate()} disabled={exportAccount.isPending}>
            <Download className="size-4 mr-1" /> Exporter mes données
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountPage
