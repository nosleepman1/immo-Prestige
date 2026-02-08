import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { exportAccountData } from '@/services/account/exportAccountData'

export function useExportAccount() {
  return useMutation({
    mutationFn: exportAccountData,
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'immoprestige-mes-donnees.json'
      link.click()
      URL.revokeObjectURL(url)
    },
    onError: () => toast.error("Impossible d'exporter les données."),
  })
}
