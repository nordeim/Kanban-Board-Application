'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Download,
  RefreshCw,
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface BoardHeaderProps {
  initialSponsors: Array<{
    id: string
    name: string
    companyName: string | null
  }>
  initialTags: Array<{
    id: string
    name: string
    color: string
  }>
}

export function BoardHeader({ initialSponsors, initialTags }: BoardHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // View state
  const [view, setView] = React.useState<'board' | 'list' | 'calendar'>(
    (searchParams.get('view') as any) || 'board'
  )
  
  // Filter states
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get('search') || ''
  )
  const [selectedSponsors, setSelectedSponsors] = React.useState<string[]>(
    searchParams.get('sponsors')?.split(',').filter(Boolean) || []
  )
  const [selectedTags, setSelectedTags] = React.useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  )
  const [selectedPriorities, setSelectedPriorities] = React.useState<string[]>(
    searchParams.get('priorities')?.split(',').filter(Boolean) || []
  )
  const [selectedStages, setSelectedStages] = React.useState<string[]>(
    searchParams.get('stages')?.split(',').filter(Boolean) || []
  )
  const [sortBy, setSortBy] = React.useState(
    searchParams.get('sort') || 'updated'
  )
  
  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  // Update URL params when filters change
  React.useEffect(() => {
    const params = new URLSearchParams()
    
    if (view !== 'board') params.set('view', view)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (selectedSponsors.length) params.set('sponsors', selectedSponsors.join(','))
    if (selectedTags.length) params.set('tags', selectedTags.join(','))
    if (selectedPriorities.length) params.set('priorities', selectedPriorities.join(','))
    if (selectedStages.length) params.set('stages', selectedStages.join(','))
    if (sortBy !== 'updated') params.set('sort', sortBy)
    
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '/board', { scroll: false })
  }, [
    view,
    debouncedSearch,
    selectedSponsors,
    selectedTags,
    selectedPriorities,
    selectedStages,
    sortBy,
    router,
  ])
  
  const activeFilterCount = 
    selectedSponsors.length +
    selectedTags.length +
    selectedPriorities.length +
    selectedStages.length +
    (searchQuery ? 1 : 0)
  
  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedSponsors([])
    setSelectedTags([])
    setSelectedPriorities([])
    setSelectedStages([])
    setSortBy('updated')
  }
  
  const handleRefresh = () => {
    router.refresh()
  }
  
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export deals')
  }

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
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
  ]

  return (
    <div className="border-b bg-background">
      <div className="flex flex-col gap-4 p-4">
        {/* Top row - View switcher and actions */}
        <div className="flex items-center justify-between">
          <Tabs value={view} onValueChange={(v: any) => setView(v)}>
            <TabsList>
              <TabsTrigger value="board" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Advanced filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px]" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                {/* Sponsors filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Sponsors</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {selectedSponsors.length > 0
                            ? `${selectedSponsors.length} selected`
                            : 'All sponsors'}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[280px]">
                      <DropdownMenuLabel>Select sponsors</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {initialSponsors.map((sponsor) => (
                        <DropdownMenuCheckboxItem
                          key={sponsor.id}
                          checked={selectedSponsors.includes(sponsor.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSponsors([...selectedSponsors, sponsor.id])
                            } else {
                              setSelectedSponsors(
                                selectedSponsors.filter((id) => id !== sponsor.id)
                              )
                            }
                          }}
                        >
                          {sponsor.name}
                          {sponsor.companyName && (
                            <span className="ml-1 text-muted-foreground">
                              ({sponsor.companyName})
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Tags filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Tags</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {selectedTags.length > 0
                            ? `${selectedTags.length} selected`
                            : 'All tags'}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[280px]">
                      <DropdownMenuLabel>Select tags</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {initialTags.map((tag) => (
                        <DropdownMenuCheckboxItem
                          key={tag.id}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTags([...selectedTags, tag.id])
                            } else {
                              setSelectedTags(
                                selectedTags.filter((id) => id !== tag.id)
                              )
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Priority filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Priority</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {selectedPriorities.length > 0
                            ? `${selectedPriorities.length} selected`
                            : 'All priorities'}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[280px]">
                      <DropdownMenuLabel>Select priorities</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {priorities.map((priority) => (
                        <DropdownMenuCheckboxItem
                          key={priority}
                          checked={selectedPriorities.includes(priority)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPriorities([...selectedPriorities, priority])
                            } else {
                              setSelectedPriorities(
                                selectedPriorities.filter((p) => p !== priority)
                              )
                            }
                          }}
                        >
                          {priority}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Stage filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Stages</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {selectedStages.length > 0
                            ? `${selectedStages.length} selected`
                            : 'All stages'}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[280px]">
                      <DropdownMenuLabel>Select stages</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {stages.map((stage) => (
                        <DropdownMenuCheckboxItem
                          key={stage}
                          checked={selectedStages.includes(stage)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStages([...selectedStages, stage])
                            } else {
                              setSelectedStages(
                                selectedStages.filter((s) => s !== stage)
                              )
                            }
                          }}
                        >
                          {stage.replace(/_/g, ' ')}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last updated</SelectItem>
              <SelectItem value="created">Date created</SelectItem>
              <SelectItem value="value">Deal value</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due date</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="h-6" />
              <div className="flex flex-wrap items-center gap-1">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {selectedSponsors.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedSponsors.length} sponsors
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedSponsors([])}
                    />
                  </Badge>
                )}
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedTags.length} tags
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedTags([])}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
