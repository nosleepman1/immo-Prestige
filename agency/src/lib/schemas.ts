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

// ─── Agency onboarding schema (mirrors RegisterAgencyRequest) ────────────────

const requiredFile = (label: string) =>
  z.instanceof(FileList).refine((files) => files.length === 1, `${label} est requis`)

const optionalFile = () => z.instanceof(FileList).optional()

export const registerAgencySchema = z.object({
  company_name: z.string().min(1, "Le nom de l'entreprise est requis").max(255),
  manager_name: z.string().min(1, 'Le nom du gérant est requis').max(255),
  description: z.string().min(1, 'La description est requise'),
  address: z.string().min(1, "L'adresse est requise").max(255),
  city: z.string().min(1, 'La ville est requise').max(100),
  activity_zone: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().min(1, 'Le téléphone est requis').max(20),
  email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
  id_card: z.string().min(1, "Le numéro de pièce d'identité est requis"),
  id_card_document: requiredFile("Le document d'identité"),
  business_registry_document: requiredFile('Le registre de commerce'),
  proof_of_address_document: optionalFile(),
})

export type RegisterAgencyFormValues = z.infer<typeof registerAgencySchema>

// ─── Set password schema (mirrors SetAgencyPasswordRequest) ─────────────────

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    password_confirmation: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  })

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>

// ─── Property schema (mirrors StorePropertyRequest) ──────────────────────────

export const propertySchema = z.object({
  property_type_id: z.coerce.number({ message: 'Le type de bien est requis' }),
  devise_id: z.coerce.number({ message: 'La devise est requise' }),
  name: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().optional().or(z.literal('')),
  surface: z.coerce.number().min(0, 'La superficie doit être positive'),
  rooms: z.coerce.number().int().min(0, 'Le nombre de pièces doit être positif'),
  bedrooms: z.coerce.number().int().min(0).optional(),
  floor: z.coerce.number().int().optional(),
  furnished: z.boolean().optional(),
  price: z.coerce.number().min(0, 'Le prix doit être positif'),
  country: z.string().min(3, 'Le pays est requis'),
  region: z.string().min(1, 'La région est requise').max(100),
  city: z.string().min(1, 'La ville est requise').max(100),
  sold: z.boolean().optional(),
})

export type PropertyFormSchemaValues = z.infer<typeof propertySchema>
