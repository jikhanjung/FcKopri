'use client'

import ChampionVoting from '@/components/ChampionVoting'

export default function ChampionPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">우승 후보 투표</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            제 1회 KOPRI CUP의 우승 후보를 투표해주세요
          </p>
        </div>

        <ChampionVoting />
        
        {/* 투표 안내 */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-4">📋 투표 안내</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">투표 방법</h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                <li>• 우승할 것으로 예상되는 팀 1개를 선택</li>
                <li>• 확신도를 1~5단계로 선택 (5가 가장 확신)</li>
                <li>• 투표 이유를 자유롭게 작성 (선택사항)</li>
                <li>• 이메일당 1번만 투표 가능 (수정 가능)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">투표 결과</h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                <li>• 실시간으로 투표 현황 공개</li>
                <li>• 각 팀별 득표율과 평균 확신도 표시</li>
                <li>• 최근 투표 내역 확인 가능</li>
                <li>• 대회 종료 후 결과와 비교 예정</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}