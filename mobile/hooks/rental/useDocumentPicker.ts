import { useCallback } from 'react'
import * as DocumentPicker from 'expo-document-picker'

export interface PickedFile {
  uri: string
  name: string
  type: string
}

/**
 * Picks a supporting document or a signed contract scan.
 *
 * Deliberately narrow on type: the server only accepts a PDF or a photo of a
 * paper, so offering anything else would let the user walk into a 422 after
 * choosing a file.
 *
 * Returns null when the user backs out — a cancellation is not an error and
 * must not surface as one.
 */
export function useDocumentPicker() {
  return useCallback(async (): Promise<PickedFile | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
      multiple: false,
    })

    if (result.canceled || !result.assets?.length) {
      return null
    }

    const asset = result.assets[0]

    return {
      uri: asset.uri,
      name: asset.name,
      // Android sometimes reports no mime type; fall back rather than sending
      // an empty one the server cannot validate.
      type: asset.mimeType ?? 'application/octet-stream',
    }
  }, [])
}
