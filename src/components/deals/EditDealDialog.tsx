'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { updateDealSchema, type DealFormData } from '@/lib/validations/deal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { updateDeal } from '@/app/actions/deals'
import { DealWithRelations } from '@/types/deals'

// Import all the form fields from CreateDealDialog
// In a real app, you'd extract these into shared components

interface EditDealDialogProps {
  deal: DealWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditDealDialog({ deal, open, onOpenChange }: EditDealDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<Partial<DealFormData>>({
    resolver: zodResolver(updateDealSchema),
    defaultValues: {
      title: deal.title,
      description: deal.description || '',
      dealType: deal.dealType,
      dealValue: Number(deal.dealValue),
      currency: deal.currency,
      stage: deal.stage,
      priority: deal.priority,
      // ... map all other fields
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DealFormData>) => updateDeal(deal.id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Deal updated successfully',
      })
      onOpenChange(false)
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update deal',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = async (data: Partial<DealFormData>) => {
    updateMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>
            Update the details of this sponsorship deal
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Include all form fields similar to CreateDealDialog */}
            {/* but with pre-filled values from the deal prop */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
