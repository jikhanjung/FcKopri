'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StandingsPage() {
  const router = useRouter()

  useEffect(() => {
    // 기본적으로 팀 순위 페이지로 리다이렉트
    router.replace('/standings/teams')
  }, [router])

  return null
}