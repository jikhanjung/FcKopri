'use client'

import DataExport from '@/components/DataExport'

export default function ExportPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">데이터 내보내기</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            KOPRI CUP 데이터를 다양한 형식으로 내보낼 수 있습니다
          </p>
        </div>

        <DataExport />
        
        {/* 추가 정보 */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">데이터 내보내기 가이드</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">데이터 구조</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <strong>팀 정보:</strong> 팀명, 부서, 생성일</li>
                <li>• <strong>선수 정보:</strong> 이름, 소속팀, 등록일</li>
                <li>• <strong>경기 데이터:</strong> 일정, 결과, 상태</li>
                <li>• <strong>순위표:</strong> 승점, 득실차, 순위</li>
                <li>• <strong>경기 이벤트:</strong> 골, 어시스트, 시간</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">활용 방법</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <strong>데이터 백업:</strong> 정기적인 JSON 내보내기</li>
                <li>• <strong>통계 분석:</strong> CSV를 Excel에서 분석</li>
                <li>• <strong>보고서 작성:</strong> 순위표와 경기 결과 활용</li>
                <li>• <strong>아카이브:</strong> 대회 종료 후 전체 데이터 보관</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}