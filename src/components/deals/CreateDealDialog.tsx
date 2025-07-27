'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Tag,
  User,
  Building2,
  AlertCircle,
  Check,
} from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { dealSchema, type DealFormData } from '@/lib/validations/deal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { useToast } from '@/components/ui/use-toast'
import { createDeal } from '@/app/actions/deals'

interface CreateDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialStage?: string
}

const FORM_STEPS = [
  { id: 'sponsor', title: 'Sponsor', icon: Building2 },
  { id: 'details', title: 'Deal Details', icon: FileText },
  { id: 'timeline', title: 'Timeline', icon: Calendar },
  { id: 'content', title: 'Content', icon: FileText },
  { id: 'options', title: 'Options', icon: Tag },
]

export function CreateDealDialog({
  open,
  onOpenChange,
  initialStage = 'NEW_LEADS',
}: CreateDealDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isCreatingSponsor, setIsCreatingSponsor] = React.useState(false)

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      description: '',
      dealType: 'DEDICATED_VIDEO',
      dealValue: 0,
      currency: 'USD',
      stage: initialStage as any,
      priority: 'MEDIUM',
      paymentTerms: 'NET_30',
      platforms: ['YOUTUBE_MAIN'],
      talkingPoints: [],
      restrictedTopics: [],
      tags: [],
      requiresApproval: true,
      autoPublish: false,
      isUrgent: false,
      customFields: {},
    },
  })

  // Fetch sponsors
  const { data: sponsors = [] } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const res = await fetch('/api/sponsors')
      if (!res.ok) throw new Error('Failed to fetch sponsors')
      return res.json()
    },
  })

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json()
    },
  })

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await fetch('/api/users/team')
      if (!res.ok) throw new Error('Failed to fetch team members')
      return res.json()
    },
  })

  // Create deal mutation
  const createMutation = useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Deal created successfully',
      })
      form.reset()
      onOpenChange(false)
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create deal',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = async (data: DealFormData) => {
    createMutation.mutate(data)
  }

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 0: // Sponsor
        return form.getValues('sponsorId') || form.getValues('newSponsor.name')
      case 1: // Details
        return (
          form.getValues('title') &&
          form.getValues('dealValue') > 0 &&
          form.getValues('dealType')
        )
      case 2: // Timeline
        return true // Optional
      case 3: // Content
        return true // Optional
      case 4: // Options
        return true // Optional
      default:
        return false
    }
  }

  const canProceed = isStepValid(currentStep)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Sponsorship Deal</DialogTitle>
          <DialogDescription>
            Add a new sponsorship deal to your pipeline
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {FORM_STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  disabled={!isStepValid(index - 1) && index > currentStep}
                  className={cn(
                    'flex flex-col items-center gap-2 p-2 rounded-lg transition-colors',
                    currentStep === index
                      ? 'text-primary'
                      : index < currentStep
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50',
                    index <= currentStep && 'hover:bg-muted cursor-pointer'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                      currentStep === index
                        ? 'border-primary bg-primary text-primary-foreground'
                        : index < currentStep
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/50'
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {step.title}
                  </span>
                </button>
                {index < FORM_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 transition-colors',
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[400px] pr-4">
              {/* Step 1: Sponsor Information */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <Tabs
                    value={isCreatingSponsor ? 'new' : 'existing'}
                    onValueChange={(v) => setIsCreatingSponsor(v === 'new')}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="existing">Existing Sponsor</TabsTrigger>
                      <TabsTrigger value="new">New Sponsor</TabsTrigger>
                    </TabsList>

                    <TabsContent value="existing" className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="sponsorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Sponsor</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a sponsor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sponsors.map((sponsor: any) => (
                                  <SelectItem key={sponsor.id} value={sponsor.id}>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {sponsor.name}
                                      </span>
                                      {sponsor.companyName && (
                                        <span className="text-muted-foreground">
                                          ({sponsor.companyName})
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select from your existing sponsors
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="new" className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="newSponsor.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sponsor Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., TechFlow Solutions" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newSponsor.companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., TechFlow Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="newSponsor.contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="newSponsor.contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="john@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="newSponsor.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Step 2: Deal Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., TechFlow Pro Software Review"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for this sponsorship deal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional details about the sponsorship..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dealType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PRODUCT_PLACEMENT">
                                Product Placement
                              </SelectItem>
                              <SelectItem value="DEDICATED_VIDEO">
                                Dedicated Video
                              </SelectItem>
                              <SelectItem value="INTEGRATION">Integration</SelectItem>
                              <SelectItem value="SERIES_PARTNERSHIP">
                                Series Partnership
                              </SelectItem>
                              <SelectItem value="AFFILIATE">Affiliate</SelectItem>
                              <SelectItem value="BRAND_AMBASSADOR">
                                Brand Ambassador
                              </SelectItem>
                              <SelectItem value="EVENT_COVERAGE">
                                Event Coverage
                              </SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dealValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Value</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="pl-9"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="AUD">AUD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UPON_DELIVERY">Upon Delivery</SelectItem>
                            <SelectItem value="NET_15">Net 15</SelectItem>
                            <SelectItem value="NET_30">Net 30</SelectItem>
                            <SelectItem value="NET_45">Net 45</SelectItem>
                            <SelectItem value="NET_60">Net 60</SelectItem>
                            <SelectItem value="MILESTONE_BASED">
                              Milestone Based
                            </SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Timeline */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When work on this deal begins
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contentDueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Content Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When content needs to be delivered
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="publishDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Publish Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When content goes live
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentDueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Payment Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When payment is expected
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">Timeline Tips:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>Allow buffer time for revisions</li>
                          <li>Consider sponsor review cycles</li>
                          <li>Account for holidays and weekends</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Content Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="videoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Is TechFlow Pro Worth It? Honest Review"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Working title for the sponsored content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platforms</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'YOUTUBE_MAIN', label: 'YouTube Main' },
                            { value: 'YOUTUBE_SHORTS', label: 'YouTube Shorts' },
                            { value: 'INSTAGRAM_REEL', label: 'Instagram Reel' },
                            { value: 'INSTAGRAM_POST', label: 'Instagram Post' },
                            { value: 'TIKTOK', label: 'TikTok' },
                            { value: 'TWITTER', label: 'Twitter' },
                            { value: 'PODCAST', label: 'Podcast' },
                            { value: 'OTHER', label: 'Other' },
                          ].map((platform) => (
                            <div key={platform.value} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(platform.value as any)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  const updated = checked
                                    ? [...current, platform.value]
                                    : current.filter((p) => p !== platform.value)
                                  field.onChange(updated)
                                }}
                              />
                              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {platform.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contentRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Specific requirements from the sponsor..."
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="talkingPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talking Points</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {(field.value || []).map((point, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={point}
                                  onChange={(e) => {
                                    const updated = [...(field.value || [])]
                                    updated[index] = e.target.value
                                    field.onChange(updated)
                                  }}
                                  placeholder="Enter talking point"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updated = field.value?.filter(
                                      (_, i) => i !== index
                                    )
                                    field.onChange(updated)
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.onChange([...(field.value || []), ''])
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Talking Point
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandGuidelinesUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Guidelines URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com/brand-guidelines"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 5: Additional Options */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NEW_LEADS">New Leads</SelectItem>
                            <SelectItem value="INITIAL_CONTACT">
                              Initial Contact
                            </SelectItem>
                            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                            <SelectItem value="CONTRACT_REVIEW">
                              Contract Review
                            </SelectItem>
                            <SelectItem value="CONTENT_CREATION">
                              Content Creation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Where this deal should start in your pipeline
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {teamMembers.map((member: any) => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={member.image} />
                                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                  </Avatar>
                                  {member.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag: any) => (
                            <Badge
                              key={tag.id}
                              variant={
                                field.value?.includes(tag.id) ? 'default' : 'outline'
                              }
                              className="cursor-pointer"
                              onClick={() => {
                                const current = field.value || []
                                const updated = current.includes(tag.id)
                                  ? current.filter((t) => t !== tag.id)
                                  : [...current, tag.id]
                                field.onChange(updated)
                              }}
                              style={{
                                backgroundColor: field.value?.includes(tag.id)
                                  ? tag.color
                                  : undefined,
                                borderColor: tag.color,
                                color: field.value?.includes(tag.id)
                                  ? 'white'
                                  : tag.color,
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <FormDescription>
                          Click tags to add them to this deal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="requiresApproval"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Requires Approval</FormLabel>
                            <FormDescription>
                              Content must be approved before publishing
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoPublish"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Auto-Publish</FormLabel>
                            <FormDescription>
                              Automatically publish when scheduled
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isUrgent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Mark as Urgent</FormLabel>
                            <FormDescription>
                              Flag this deal for immediate attention
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="gap-2 sm:gap-0">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={createMutation.isPending}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              {currentStep < FORM_STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="ml-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !form.formState.isValid}
                  className="ml-auto"
                >
                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create Deal
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
