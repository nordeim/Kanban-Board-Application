'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'
import { Github, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

interface OAuthButtonsProps {
  callbackUrl?: string
}

export function OAuthButtons({ callbackUrl = '/board' }: OAuthButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isGithubLoading, setIsGithubLoading] = React.useState(false)

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setIsGoogleLoading(true)
          signIn('google', { callbackUrl })
        }}
        disabled={isGoogleLoading || isGithubLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setIsGithubLoading(true)
          signIn('github', { callbackUrl })
        }}
        disabled={isGoogleLoading || isGithubLoading}
      >
        {isGithubLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Github className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  )
}
