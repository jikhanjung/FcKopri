'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { 
  StarIcon,
  XMarkIcon,
  CheckIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Player {
  id: string
  name: string
  team_id: string
}

interface Team {
  id: string
  name: string
  players: Player[]
}

interface ManOfTheMatchSelectorProps {
  matchId: string
  homeTeam: Team
  awayTeam: Team
  currentMotmId?: string | null
  onMotmChange?: (playerId: string | null) => void
}

export default function ManOfTheMatchSelector({ 
  matchId, 
  homeTeam, 
  awayTeam, 
  currentMotmId,
  onMotmChange 
}: ManOfTheMatchSelectorProps) {
  const { isAdmin } = useAuth()
  const [showSelector, setShowSelector] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(currentMotmId || null)
  const [saving, setSaving] = useState(false)

  // 모든 선수 목록 (홈팀 + 원정팀)
  const allPlayers = [
    ...homeTeam.players.map(p => ({ ...p, teamName: homeTeam.name })),
    ...awayTeam.players.map(p => ({ ...p, teamName: awayTeam.name }))
  ]

  const currentMotm = allPlayers.find(p => p.id === currentMotmId)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('matches')
        .update({ man_of_the_match_id: selectedPlayerId })
        .eq('id', matchId)

      if (error) {
        console.error('Error updating MOTM:', error)
        alert('Man of the Match 저장 중 오류가 발생했습니다.')
        return
      }

      // 부모 컴포넌트에 변경사항 알림
      if (onMotmChange) {
        onMotmChange(selectedPlayerId)
      }

      setShowSelector(false)
    } catch (error) {
      console.error('Error saving MOTM:', error)
      alert('Man of the Match 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedPlayerId(currentMotmId || null)
    setShowSelector(false)
  }

  const handleRemove = async () => {
    if (!confirm('Man of the Match 선정을 취소하시겠습니까?')) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('matches')
        .update({ man_of_the_match_id: null })
        .eq('id', matchId)

      if (error) {
        console.error('Error removing MOTM:', error)
        alert('Man of the Match 제거 중 오류가 발생했습니다.')
        return
      }

      if (onMotmChange) {
        onMotmChange(null)
      }

      setSelectedPlayerId(null)
      setShowSelector(false)
    } catch (error) {
      console.error('Error removing MOTM:', error)
      alert('Man of the Match 제거 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    // 관리자가 아닌 경우 현재 MOTM만 표시
    if (!currentMotm) return null
    
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <StarIconSolid className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Man of the Match
            </h4>
            <p className="text-yellow-700 dark:text-yellow-300">
              <span className="font-medium">{currentMotm.name}</span>
              <span className="text-sm ml-2">({currentMotm.teamName})</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrophyIcon className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Man of the Match
            </h3>
          </div>
          
          {/* 관리자 버튼 */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSelector(true)}
              className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              {currentMotm ? '변경' : '선정'}
            </button>
            {currentMotm && (
              <button
                onClick={handleRemove}
                disabled={saving}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                제거
              </button>
            )}
          </div>
        </div>

        {/* 현재 MOTM 표시 */}
        {currentMotm ? (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center">
              <StarIconSolid className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <Link 
                  href={`/players/${currentMotm.id}`}
                  className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-100 transition-colors"
                >
                  {currentMotm.name}
                </Link>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {currentMotm.teamName}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>아직 Man of the Match가 선정되지 않았습니다</p>
          </div>
        )}
      </div>

      {/* 선택 모달 */}
      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Man of the Match 선정
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* 팀별 선수 목록 */}
            <div className="space-y-6">
              {/* 홈팀 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  {homeTeam.name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {homeTeam.players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPlayerId === player.id
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{player.name}</span>
                        {selectedPlayerId === player.id && (
                          <StarIconSolid className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 원정팀 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  {awayTeam.name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {awayTeam.players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPlayerId === player.id
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{player.name}</span>
                        {selectedPlayerId === player.id && (
                          <StarIconSolid className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedPlayerId || saving}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    선정 완료
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}