/**
 * Database Seed Script
 * Populates the database with initial data for development and testing
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sponsorflow.io' },
    update: {},
    create: {
      email: 'admin@sponsorflow.io',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
    }
  })

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sponsorflow.io' },
    update: {},
    create: {
      email: 'demo@sponsorflow.io',
      name: 'Demo Creator',
      role: 'CREATOR',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
      youtubeChannelName: 'Demo Channel',
      bio: 'This is a demo account for testing SponsorFlow',
    }
  })

  console.log('✅ Created demo users')

  // Create default tags
  const tagData = [
    { name: 'High Value', color: '#EF4444', description: 'Deals worth over $10,000' },
    { name: 'Recurring', color: '#3B82F6', description: 'Ongoing partnership deals' },
    { name: 'Rush', color: '#F59E0B', description: 'Urgent turnaround required' },
    { name: 'First Time', color: '#10B981', description: 'New sponsor relationship' },
    { name: 'Tech', color: '#8B5CF6', description: 'Technology related sponsors' },
    { name: 'Gaming', color: '#EC4899', description: 'Gaming related sponsors' },
    { name: 'Finance', color: '#14B8A6', description: 'Financial services sponsors' },
    { name: 'Education', color: '#F97316', description: 'Educational content sponsors' },
    { name: 'Lifestyle', color: '#6366F1', description: 'Lifestyle and wellness brands' },
    { name: 'Food & Beverage', color: '#84CC16', description: 'Food and drink sponsors' },
  ]

  for (const tag of tagData) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        ...tag,
        createdById: adminUser.id
      }
    })
  }

  console.log('✅ Created default tags')

  // Create sample sponsors
  const sponsors = [
    {
      name: 'TechFlow Solutions',
      companyName: 'TechFlow Inc.',
      website: 'https://techflow.example.com',
      industry: 'Technology',
      primaryContactName: 'Sarah Johnson',
      primaryContactEmail: 'sarah@techflow.example.com',
      notes: 'Preferred partner for tech reviews',
      typicalBudgetRange: { min: 5000, max: 15000, currency: 'USD' }
    },
    {
      name: 'GameZone Studios',
      companyName: 'GameZone Entertainment',
      website: 'https://gamezone.example.com',
      industry: 'Gaming',
      primaryContactName: 'Mike Chen',
      primaryContactEmail: 'mike@gamezone.example.com',
      notes: 'Focus on gaming peripherals and software',
      typicalBudgetRange: { min: 3000, max: 10000, currency: 'USD' }
    },
    {
      name: 'HealthyLife Nutrition',
      companyName: 'HealthyLife Corp',
      website: 'https://healthylife.example.com',
      industry: 'Health & Wellness',
      primaryContactName: 'Emma Wilson',
      primaryContactEmail: 'emma@healthylife.example.com',
      notes: 'Organic supplements and fitness products',
      typicalBudgetRange: { min: 2000, max: 8000, currency: 'USD' }
    }
  ]

  const createdSponsors = []
  for (const sponsor of sponsors) {
    const created = await prisma.sponsor.create({
      data: {
        ...sponsor,
        createdById: demoUser.id
      }
    })
    createdSponsors.push(created)
  }

  console.log('✅ Created sample sponsors')

  // Create sample deals across different stages
  const dealTemplates = [
    {
      title: 'TechFlow Pro Software Review',
      description: 'In-depth review of TechFlow Pro productivity suite',
      sponsorIndex: 0,
      stage: 'NEW_LEADS' as const,
      dealType: 'DEDICATED_VIDEO' as const,
      dealValue: 12000,
      priority: 'HIGH' as const,
    },
    {
      title: 'GameZone Controller Integration',
      description: 'Showcase new gaming controller in gameplay videos',
      sponsorIndex: 1,
      stage: 'INITIAL_CONTACT' as const,
      dealType: 'INTEGRATION' as const,
      dealValue: 5000,
      priority: 'MEDIUM' as const,
    },
    {
      title: 'HealthyLife 30-Day Challenge',
      description: 'Document 30-day fitness transformation with products',
      sponsorIndex: 2,
      stage: 'NEGOTIATION' as const,
      dealType: 'SERIES_PARTNERSHIP' as const,
      dealValue: 8000,
      priority: 'HIGH' as const,
    },
    {
      title: 'TechFlow Cloud Services',
      description: 'Tutorial series on cloud deployment',
      sponsorIndex: 0,
      stage: 'CONTRACT_REVIEW' as const,
      dealType: 'SERIES_PARTNERSHIP' as const,
      dealValue: 15000,
      priority: 'URGENT' as const,
    },
    {
      title: 'GameZone VR Headset Review',
      description: 'First impressions and setup guide',
      sponsorIndex: 1,
      stage: 'CONTENT_CREATION' as const,
      dealType: 'DEDICATED_VIDEO' as const,
      dealValue: 7500,
      priority: 'HIGH' as const,
    }
  ]

  const tags = await prisma.tag.findMany()
  
  for (const template of dealTemplates) {
    const { sponsorIndex, ...dealData } = template
    
    const deal = await prisma.deal.create({
      data: {
        ...dealData,
        userId: demoUser.id,
        sponsorId: createdSponsors[sponsorIndex].id,
        contentRequirements: 'Standard brand guidelines apply',
        talkingPoints: [
          'Key product features',
          'User benefits',
          'Pricing information',
          'Special offers for viewers'
        ],
        startDate: new Date(),
        contentDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        publishDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
      }
    })

    // Add random tags to deals
    const randomTags = tags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1)
    
    for (const tag of randomTags) {
      await prisma.dealTag.create({
        data: {
          dealId: deal.id,
          tagId: tag.id
        }
      })
    }
  }

  console.log('✅ Created sample deals')

  // Create a deal template
  await prisma.dealTemplate.create({
    data: {
      name: 'Standard Product Review Template',
      description: 'Template for typical product review sponsorships',
      createdById: demoUser.id,
      dealType: 'DEDICATED_VIDEO',
      contentRequirements: 'Minimum 10-minute video with honest review',
      talkingPoints: [
        'Product unboxing',
        'First impressions',
        'Key features demonstration',
        'Pros and cons',
        'Final verdict and recommendations'
      ],
      paymentTerms: 'NET_30',
      isPublic: true,
    }
  })

  console.log('✅ Created deal template')

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      type: 'SYSTEM_ALERT',
      title: 'Welcome to SponsorFlow!',
      message: 'Start managing your YouTube sponsorships efficiently. Check out our getting started guide.',
      actionUrl: '/help/getting-started',
    }
  })

  console.log('✅ Created welcome notification')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
