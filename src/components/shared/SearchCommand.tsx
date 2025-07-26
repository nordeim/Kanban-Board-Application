'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DialogProps } from '@radix-ui/react-dialog'
import {
  Circle,
  File,
  Laptop,
  Moon,
  Search,
  SunMedium,
  User,
  DollarSign,
  Calendar,
  Tag,
  Building2,
  FileText,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn, getStageColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

interface SearchCommandProps extends DialogProps {
  deals?: Array<{
    id: string
    title: string
    sponsorName: string
    stage: string
    dealValue: number
  }>
  sponsors?: Array<{
    id: string
    name: string
    companyName?: string
  }>
}

export function SearchCommand({ deals = [], sponsors = [], ...props }: SearchCommandProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        props.onOpenChange?.(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [props])

  const runCommand = React.useCallback((command: () => unknown) => {
    props.onOpenChange?.(false)
    command()
  }, [props])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => props.onOpenChange?.(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search deals, sponsors...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog {...props}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {deals.length > 0 && (
            <CommandGroup heading="Deals">
              {deals.slice(0, 5).map((deal) => (
                <CommandItem
                  key={deal.id}
                  value={`${deal.title} ${deal.sponsorName}`}
                  onSelect={() => {
                    runCommand(() => router.push(`/deals/${deal.id}`))
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className={cn('h-2 w-2 rounded-full', getStageColor(deal.stage))} />
                    <div className="flex-1">
                      <div className="font-medium">{deal.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {deal.sponsorName} • ${deal.dealValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {sponsors.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Sponsors">
                {sponsors.slice(0, 3).map((sponsor) => (
                  <CommandItem
                    key={sponsor.id}
                    value={`${sponsor.name} ${sponsor.companyName || ''}`}
                    onSelect={() => {
                      runCommand(() => router.push(`/sponsors/${sponsor.id}`))
                    }}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium">{sponsor.name}</div>
                      {sponsor.companyName && (
                        <div className="text-xs text-muted-foreground">{sponsor.companyName}</div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push('/deals/new'))
              }}
            >
              <File className="mr-2 h-4 w-4" />
              Create New Deal
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push('/board'))
              }}
            >
              <Laptop className="mr-2 h-4 w-4" />
              Go to Board
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push('/analytics'))
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Analytics
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <SunMedium className="mr-2 h-4 w-4" />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop className="mr-2 h-4 w-4" />
              System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
