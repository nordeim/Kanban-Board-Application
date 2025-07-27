'use client'

import * as React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

interface SponsorLeaderboardProps {
  sponsors: {
    id: string
    name: string
    companyName: string | null
    dealCount: number
    totalValue: number
    averageValue: number
  }[]
}

export function SponsorLeaderboard({ sponsors }: SponsorLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Top Sponsors
        </CardTitle>
        <CardDescription>
          Your most valuable sponsor relationships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Sponsor</TableHead>
              <TableHead className="text-center">Deals</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">Avg. Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsors.map((sponsor, index) => (
              <TableRow key={sponsor.id}>
                <TableCell>
                  {index < 3 ? (
                    <Badge
                      variant={index === 0 ? 'default' : 'secondary'}
                      className={
                        index === 0
                          ? 'bg-yellow-600'
                          : index === 1
                          ? 'bg-gray-400'
                          : 'bg-orange-600'
                      }
                    >
                      {index + 1}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {sponsor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{sponsor.name}</p>
                      {sponsor.companyName && (
                        <p className="text-xs text-muted-foreground">
                          {sponsor.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">{sponsor.dealCount}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(sponsor.totalValue)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(sponsor.averageValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
