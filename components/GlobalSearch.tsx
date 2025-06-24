'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MagnifyingGlassIcon, UserGroupIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface SearchResult {
  id: string
  type: 'team' | 'player' | 'match'
  title: string
  subtitle: string
  href: string
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 검색 실행
  useEffect(() => {
    const searchAll = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const searchTerm = query.toLowerCase()
        const allResults: SearchResult[] = []

        // 팀 검색
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(5)

        if (teams) {
          teams.forEach(team => {
            allResults.push({
              id: team.id,
              type: 'team',
              title: team.name,
              subtitle: '팀',
              href: `/teams/${team.id}`
            })
          })
        }

        // 선수 검색
        const { data: players } = await supabase
          .from('players')
          .select('id, name, department, teams(id, name)')
          .ilike('name', `%${searchTerm}%`)
          .limit(5)

        if (players) {
          players.forEach(player => {
            allResults.push({
              id: player.id,
              type: 'player',
              title: player.name,
              subtitle: `${(player.teams as any)?.name || '팀 미정'} · ${player.department || '부서 미정'}`,
              href: `/players/${player.id}`
            })
          })
        }

        // 경기 검색 (팀명으로)
        const { data: matches } = await supabase
          .from('matches')
          .select(`
            id,
            match_date,
            status,
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name)
          `)
          .or(`home_team.name.ilike.%${searchTerm}%,away_team.name.ilike.%${searchTerm}%`)
          .limit(5)

        if (matches) {
          matches.forEach(match => {
            const homeTeam = (match.home_team as any)?.name || '미정'
            const awayTeam = (match.away_team as any)?.name || '미정'
            const date = match.match_date 
              ? new Date(match.match_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              : '날짜 미정'
            
            allResults.push({
              id: match.id,
              type: 'match',
              title: `${homeTeam} vs ${awayTeam}`,
              subtitle: `${date} · ${getStatusLabel(match.status)}`,
              href: `/matches/${match.id}`
            })
          })
        }

        setResults(allResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchAll, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // 키보드 이벤트 핸들링
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setQuery('')
          setSelectedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: '예정',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소'
    }
    return labels[status] || status
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'team':
        return <UserGroupIcon className="w-4 h-4" />
      case 'player':
        return <UserIcon className="w-4 h-4" />
      case 'match':
        return <CalendarIcon className="w-4 h-4" />
      default:
        return <MagnifyingGlassIcon className="w-4 h-4" />
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
    if (!isOpen) setIsOpen(true)
  }

  return (
    <div ref={searchRef} className="relative">
      {/* 검색 입력 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="팀, 선수, 경기 검색..."
          className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-kopri-blue focus:border-kopri-blue text-sm"
        />
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-auto z-50">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
              <MagnifyingGlassIcon className="w-4 h-4 mr-2 animate-spin" />
              검색 중...
            </div>
          ) : query.trim() === '' ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              팀, 선수, 경기를 검색해보세요
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : (
            <div>
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-kopri-blue bg-opacity-10' : ''
                  }`}
                >
                  <div className={`text-gray-400 ${index === selectedIndex ? 'text-kopri-blue' : ''}`}>
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${
                      index === selectedIndex ? 'text-kopri-blue' : 'text-gray-900'
                    }`}>
                      {result.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.subtitle}
                    </div>
                  </div>
                </button>
              ))}
              
              {results.length > 0 && (
                <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                  ↑↓ 이동 · Enter 선택 · Esc 닫기
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}