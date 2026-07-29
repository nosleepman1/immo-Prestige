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

const coerceOptionalNumber = (minVal = 0) =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(minVal).optional()
  )

export const propertySchema = z
  .object({
    property_type_id: z.coerce.number({ message: 'Le type de bien est requis' }),
    devise_id: z.coerce.number({ message: 'La devise est requise' }),
    owner_id: coerceOptionalNumber(),
    transaction_type: z.enum(['sale', 'rent', 'both'], {
      message: 'Précisez si le bien est à vendre ou à louer',
    }),
    name: z.string().min(1, 'Le titre est requis').max(255),
    description: z.string().optional().or(z.literal('')),
    surface: z.coerce.number({ message: 'La superficie doit être un nombre' }).min(0, 'La superficie doit être positive'),
    rooms: z.coerce.number({ message: 'Le nombre de pièces est requis' }).int().min(0, 'Le nombre de pièces doit être positif'),
    bedrooms: coerceOptionalNumber(0),
    floor: coerceOptionalNumber(),
    furnished: z.boolean().optional(),
    country: z.string().min(3, 'Le pays est requis'),
    region: z.string().min(1, 'La région est requise').max(100),
    city: z.string().min(1, 'La ville est requise').max(100),
    sale: z
      .object({
        price: z.coerce.number({ message: 'Le prix de vente est requis' }).min(1, 'Le prix de vente est requis'),
        negotiable: z.boolean().optional(),
      })
      .optional(),
    rental: z
      .object({
        rent_amount: z.coerce.number({ message: 'Le loyer est requis' }).min(1, 'Le loyer est requis'),
        charges_amount: coerceOptionalNumber(0),
        deposit_amount: coerceOptionalNumber(0),
        advance_months: coerceOptionalNumber(1),
        min_lease_months: coerceOptionalNumber(1),
        available_from: z.string().optional().or(z.literal('')),
      })
      .optional(),
  })
  // Mirrors the required_if/prohibited_if pair in StorePropertyRequest. The
  // server remains the guarantee; this only spares a round trip.
  .superRefine((values, ctx) => {
    const needsSale = values.transaction_type !== 'rent'
    const needsRental = values.transaction_type !== 'sale'

    if (needsSale && !values.sale?.price) {
      ctx.addIssue({
        code: 'custom',
        path: ['sale', 'price'],
        message: 'Un bien mis en vente doit porter un prix de vente.',
      })
    }

    if (needsRental && !values.rental?.rent_amount) {
      ctx.addIssue({
        code: 'custom',
        path: ['rental', 'rent_amount'],
        message: 'Un bien mis en location doit porter un loyer.',
      })
    }
  })

export type PropertyFormSchemaValues = z.infer<typeof propertySchema>

// ─── Owner schema (mirrors StoreOwnerRequest) ────────────────────────────────

export const ownerSchema = z.object({
  last_name: z.string().min(1, 'Le nom est requis').max(255),
  first_name: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().min(1, 'Le téléphone est requis').max(255),
  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  id_document_number: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type OwnerFormSchemaValues = z.infer<typeof ownerSchema>

// ─── Contract clause schema (mirrors StoreContractClauseRequest) ─────────────

export const clauseSchema = z.object({
  title: z.string().min(1, "L'intitulé est requis").max(255),
  body: z.string().min(1, 'Le corps de la clause est requis').max(20000),
  is_required: z.boolean().optional(),
})

export type ClauseFormSchemaValues = z.infer<typeof clauseSchema>
