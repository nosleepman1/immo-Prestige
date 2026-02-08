import { useMutation } from '@tanstack/react-query'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { exportAccountData } from '@/services/account/exportAccountData'

export function useExportAccount() {
  return useMutation({
    mutationFn: async () => {
      const data = await exportAccountData()
      const file = new File(Paths.cache, 'immoprestige-mes-donnees.json')
      if (file.exists) file.delete()
      file.create()
      file.write(JSON.stringify(data, null, 2))

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' })
      }

      return file.uri
    },
  })
}
