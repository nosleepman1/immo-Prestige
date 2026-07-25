import { z } from 'zod'

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Adresse email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ─── Refuse agency schema ─────────────────────────────────────────────────────

export const refuseAgencySchema = z.object({
  reason: z
    .string()
    .min(1, 'Le motif de refus est requis')
    .max(1000, 'Le motif ne peut pas dépasser 1000 caractères'),
})

export type RefuseAgencyFormValues = z.infer<typeof refuseAgencySchema>
