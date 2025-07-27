import { faker } from '@faker-js/faker'
import type { Deal, User, Sponsor, Tag } from '@prisma/client'
import type { DealWithRelations } from '@/types/deals'

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    emailVerified: faker.date.past(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
    role: 'CREATOR',
    passwordHash: null,
    bio: faker.lorem.paragraph(),
    company: faker.company.name(),
    website: faker.internet.url(),
    youtubeChannelId: faker.string.alphanumeric(24),
    youtubeChannelName: faker.internet.userName(),
    timezone: 'UTC',
    notificationPreferences: { email: true, push: true, sms: false },
    googleId: faker.string.alphanumeric(21),
    githubId: null,
    isActive: true,
    lastLoginAt: faker.date.recent(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
    ...overrides,
  }
}

export function createMockSponsor(overrides?: Partial<Sponsor>): Sponsor {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    companyName: faker.company.name(),
    website: faker.internet.url(),
    logoUrl: faker.image.url(),
    industry: faker.commerce.department(),
    primaryContactName: faker.person.fullName(),
    primaryContactEmail: faker.internet.email(),
    primaryContactPhone: faker.phone.number(),
    secondaryContactName: faker.person.fullName(),
    secondaryContactEmail: faker.internet.email(),
    notes: faker.lorem.paragraph(),
    preferredContentTypes: ['DEDICATED_VIDEO', 'INTEGRATION'],
    typicalBudgetRange: { min: 1000, max: 10000, currency: 'USD' },
    totalDealsCount: faker.number.int({ min: 0, max: 50 }),
    successfulDealsCount: faker.number.int({ min: 0, max: 30 }),
    totalRevenue: faker.number.float({ min: 0, max: 100000, precision: 0.01 }),
    averageDealValue: faker.number.float({ min: 1000, max: 5000, precision: 0.01 }),
    lastDealDate: faker.date.recent(),
    createdById: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

export function createMockTag(overrides?: Partial<Tag>): Tag {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productAdjective(),
    color: faker.internet.color(),
    description: faker.lorem.sentence(),
    createdById: faker.string.uuid(),
    createdAt: faker.date.past(),
    ...overrides,
  }
}

export function createMockDeal(overrides?: Partial<Deal>): Deal {
  const stages = [
    'NEW_LEADS',
    'INITIAL_CONTACT',
    'NEGOTIATION',
    'CONTRACT_REVIEW',
    'CONTENT_CREATION',
    'REVIEW_APPROVAL',
    'PUBLISHING',
    'PAYMENT_PENDING',
    'COMPLETED',
  ] as const

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
  const dealTypes = [
    'PRODUCT_PLACEMENT',
    'DEDICATED_VIDEO',
    'INTEGRATION',
    'SERIES_PARTNERSHIP',
  ] as const

  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName() + ' Sponsorship',
    description: faker.lorem.paragraph(),
    userId: faker.string.uuid(),
    sponsorId: faker.string.uuid(),
    assignedToId: faker.datatype.boolean() ? faker.string.uuid() : null,
    dealType: faker.helpers.arrayElement(dealTypes),
    dealValue: faker.number.float({ min: 1000, max: 50000, precision: 0.01 }),
    currency: 'USD',
    commissionRate: faker.number.float({ min: 0, max: 20, precision: 0.01 }),
    stage: faker.helpers.arrayElement(stages),
    priority: faker.helpers.arrayElement(priorities),
    startDate: faker.date.future(),
    contentDueDate: faker.date.future(),
    publishDate: faker.date.future(),
    contractSignedDate: faker.date.recent(),
    paymentDueDate: faker.date.future(),
    paymentTerms: 'NET_30',
    paymentStatus: 'NOT_APPLICABLE',
    amountPaid: 0,
    paymentNotes: null,
    contentStatus: 'NOT_STARTED',
    videoTitle: faker.lorem.sentence(),
    videoDescription: faker.lorem.paragraph(),
    videoLengthSeconds: faker.number.int({ min: 60, max: 1800 }),
    videoUrl: null,
    platforms: ['YOUTUBE_MAIN'],
    contentRequirements: faker.lorem.paragraph(),
    talkingPoints: faker.lorem.sentences(3).split('. '),
    restrictedTopics: faker.lorem.words(3).split(' '),
    brandGuidelinesUrl: faker.internet.url(),
    videoViews: 0,
    engagementRate: null,
    conversionMetrics: null,
    isTemplate: false,
    isArchived: false,
    isUrgent: false,
    requiresApproval: true,
    autoPublish: false,
    customFields: {},
    stageUpdatedAt: faker.date.recent(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    archivedAt: null,
    deletedAt: null,
    ...overrides,
  }
}

export function createMockDealWithRelations(
  overrides?: Partial<DealWithRelations>
): DealWithRelations {
  const deal = createMockDeal(overrides)
  const sponsor = createMockSponsor({ id: deal.sponsorId })
  const assignedTo = deal.assignedToId ? createMockUser({ id: deal.assignedToId }) : null
  const tags = Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () =>
    createMockTag()
  )

  return {
    ...deal,
    sponsor,
    assignedTo,
    tags,
    commentCount: faker.number.int({ min: 0, max: 20 }),
    attachmentCount: faker.number.int({ min: 0, max: 10 }),
    ...overrides,
  }
}
