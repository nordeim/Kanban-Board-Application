import * as z from 'zod'

// Enums matching Prisma schema
export const DealStageEnum = z.enum([
  'NEW_LEADS',
  'INITIAL_CONTACT',
  'NEGOTIATION',
  'CONTRACT_REVIEW',
  'CONTENT_CREATION',
  'REVIEW_APPROVAL',
  'PUBLISHING',
  'PAYMENT_PENDING',
  'COMPLETED',
])

export const PriorityLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const DealTypeEnum = z.enum([
  'PRODUCT_PLACEMENT',
  'DEDICATED_VIDEO',
  'INTEGRATION',
  'SERIES_PARTNERSHIP',
  'AFFILIATE',
  'BRAND_AMBASSADOR',
  'EVENT_COVERAGE',
  'OTHER',
])

export const PaymentTermsEnum = z.enum([
  'UPON_DELIVERY',
  'NET_15',
  'NET_30',
  'NET_45',
  'NET_60',
  'MILESTONE_BASED',
  'CUSTOM',
])

export const ContentStatusEnum = z.enum([
  'NOT_STARTED',
  'SCRIPT_WRITING',
  'FILMING',
  'EDITING',
  'SPONSOR_REVIEW',
  'APPROVED',
  'REVISION_REQUESTED',
  'PUBLISHED',
])

export const PlatformTypeEnum = z.enum([
  'YOUTUBE_MAIN',
  'YOUTUBE_SHORTS',
  'INSTAGRAM_REEL',
  'INSTAGRAM_POST',
  'TIKTOK',
  'TWITTER',
  'PODCAST',
  'OTHER',
])

// Main deal schema
export const dealSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  
  // Sponsor Information
  sponsorId: z.string().optional(),
  newSponsor: z
    .object({
      name: z.string().min(1, 'Sponsor name is required'),
      companyName: z.string().optional(),
      contactEmail: z.string().email('Invalid email').optional(),
      contactName: z.string().optional(),
      website: z.string().url('Invalid URL').optional(),
    })
    .optional(),
  
  // Deal Details
  dealType: DealTypeEnum,
  dealValue: z
    .number()
    .min(0, 'Deal value must be positive')
    .max(1000000000, 'Deal value is too high'),
  currency: z.string().default('USD'),
  commissionRate: z
    .number()
    .min(0, 'Commission rate must be positive')
    .max(100, 'Commission rate cannot exceed 100%')
    .optional(),
  
  // Stage and Priority
  stage: DealStageEnum.default('NEW_LEADS'),
  priority: PriorityLevelEnum.default('MEDIUM'),
  
  // Dates
  startDate: z.date().optional(),
  contentDueDate: z.date().optional(),
  publishDate: z.date().optional(),
  paymentDueDate: z.date().optional(),
  
  // Payment Information
  paymentTerms: PaymentTermsEnum.default('NET_30'),
  
  // Content Details
  videoTitle: z.string().max(255).optional(),
  videoDescription: z.string().optional(),
  videoLengthSeconds: z.number().min(0).optional(),
  platforms: z.array(PlatformTypeEnum).default(['YOUTUBE_MAIN']),
  
  // Requirements
  contentRequirements: z.string().optional(),
  talkingPoints: z.array(z.string()).default([]),
  restrictedTopics: z.array(z.string()).default([]),
  brandGuidelinesUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  
  // Additional Options
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  requiresApproval: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  
  // Custom fields
  customFields: z.record(z.any()).default({}),
})
  .refine(
    (data) => {
      // Either existing sponsor or new sponsor info required
      return data.sponsorId || data.newSponsor?.name
    },
    {
      message: 'Either select an existing sponsor or provide new sponsor details',
      path: ['sponsorId'],
    }
  )
  .refine(
    (data) => {
      // Date validation
      if (data.startDate && data.contentDueDate) {
        return data.startDate <= data.contentDueDate
      }
      return true
    },
    {
      message: 'Start date must be before content due date',
      path: ['contentDueDate'],
    }
  )
  .refine(
    (data) => {
      // Date validation
      if (data.contentDueDate && data.publishDate) {
        return data.contentDueDate <= data.publishDate
      }
      return true
    },
    {
      message: 'Content due date must be before publish date',
      path: ['publishDate'],
    }
  )

export type DealFormData = z.infer<typeof dealSchema>

// Update deal schema (partial)
export const updateDealSchema = dealSchema.partial()

// Quick create schema (minimal fields)
export const quickCreateDealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  sponsorId: z.string().min(1, 'Sponsor is required'),
  dealValue: z.number().min(0, 'Deal value must be positive'),
  dealType: DealTypeEnum,
  priority: PriorityLevelEnum.default('MEDIUM'),
})

// Filter schema for API
export const dealFilterSchema = z.object({
  search: z.string().optional(),
  sponsorIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  stages: z.array(DealStageEnum).optional(),
  priorities: z.array(PriorityLevelEnum).optional(),
  dealTypes: z.array(DealTypeEnum).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  assignedToId: z.string().optional(),
  isArchived: z.boolean().optional(),
  sortBy: z.enum(['created', 'updated', 'value', 'priority', 'dueDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export type DealFilterData = z.infer<typeof dealFilterSchema>
