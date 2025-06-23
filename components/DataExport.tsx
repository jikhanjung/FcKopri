'use client'

import { useState } from 'react'
import { 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'
import { exportAllData, downloadJSON, downloadCSV, downloadExcel } from '@/lib/export-utils'

export default function DataExport() {
  const [loading, setLoading] = useState(false)
  const [selectedData, setSelectedData] = useState<string[]>(['all'])

  const dataTypes = [
    { id: 'all', name: '전체 데이터', description: '모든 데이터를 한 번에 내보내기' },
    { id: 'teams', name: '팀 정보', description: '팀 목록과 기본 정보' },
    { id: 'players', name: '선수 정보', description: '선수 목록과 소속팀 정보' },
    { id: 'matches', name: '경기 데이터', description: '경기 일정과 결과' },
    { id: 'standings', name: '순위표', description: '현재 리그 순위표' },
    { id: 'matchEvents', name: '경기 이벤트', description: '골, 어시스트 등 경기 세부 기록' }
  ]

  const handleDataTypeChange = (dataType: string) => {
    if (dataType === 'all') {
      setSelectedData(['all'])
    } else {
      const newSelection = selectedData.filter(s => s !== 'all')
      if (newSelection.includes(dataType)) {
        const filtered = newSelection.filter(s => s !== dataType)
        setSelectedData(filtered.length === 0 ? ['all'] : filtered)
      } else {
        setSelectedData([...newSelection, dataType])
      }
    }
  }

  const exportData = async (format: 'json' | 'csv' | 'excel') => {
    setLoading(true)
    try {
      const allData = await exportAllData()
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      
      if (selectedData.includes('all')) {
        // 전체 데이터 내보내기
        if (format === 'json') {
          downloadJSON(allData, `kopri-cup-data-${timestamp}`)
        } else {
          // CSV/Excel의 경우 각 데이터 타입별로 분리해서 다운로드
          Object.entries(allData).forEach(([key, data]) => {
            if (Array.isArray(data) && data.length > 0) {
              if (format === 'csv') {
                downloadCSV(data, `kopri-cup-${key}-${timestamp}`)
              } else {
                downloadExcel(data, `kopri-cup-${key}-${timestamp}`)
              }
            }
          })
        }
      } else {
        // 선택된 데이터만 내보내기
        selectedData.forEach(dataType => {
          const data = allData[dataType as keyof typeof allData]
          if (Array.isArray(data) && data.length > 0) {
            if (format === 'json') {
              downloadJSON(data, `kopri-cup-${dataType}-${timestamp}`)
            } else if (format === 'csv') {
              downloadCSV(data, `kopri-cup-${dataType}-${timestamp}`)
            } else {
              downloadExcel(data, `kopri-cup-${dataType}-${timestamp}`)
            }
          }
        })
      }
      
      alert('데이터 내보내기가 완료되었습니다!')
    } catch (error) {
      console.error('Export error:', error)
      alert('데이터 내보내기 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminOnly>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <ArrowDownTrayIcon className="w-6 h-6 text-kopri-blue mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">데이터 내보내기</h2>
        </div>

        {/* 데이터 선택 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">내보낼 데이터 선택</h3>
          <div className="space-y-3">
            {dataTypes.map((dataType) => (
              <label key={dataType.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedData.includes(dataType.id)}
                  onChange={() => handleDataTypeChange(dataType.id)}
                  className="mt-1 h-4 w-4 text-kopri-blue focus:ring-kopri-blue border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{dataType.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{dataType.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 내보내기 형식 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">내보내기 형식</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportData('json')}
              disabled={loading || selectedData.length === 0}
              className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentTextIcon className="w-8 h-8 text-blue-500 mb-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100">JSON</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                개발자용, 구조화된 데이터
              </span>
            </button>

            <button
              onClick={() => exportData('csv')}
              disabled={loading || selectedData.length === 0}
              className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TableCellsIcon className="w-8 h-8 text-green-500 mb-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100">CSV</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Excel, 스프레드시트용
              </span>
            </button>

            <button
              onClick={() => exportData('excel')}
              disabled={loading || selectedData.length === 0}
              className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentIcon className="w-8 h-8 text-orange-500 mb-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Excel</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Microsoft Excel용
              </span>
            </button>
          </div>
        </div>

        {/* 설명 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 사용 팁</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• <strong>JSON:</strong> 백업이나 다른 시스템으로 데이터 이전 시 사용</li>
            <li>• <strong>CSV:</strong> Excel이나 Google Sheets에서 분석할 때 사용</li>
            <li>• <strong>Excel:</strong> Microsoft Excel에서 바로 열 수 있는 형식</li>
            <li>• 전체 데이터 선택 시 모든 테이블이 개별 파일로 다운로드됩니다</li>
          </ul>
        </div>

        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-kopri-blue"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">데이터를 내보내는 중...</span>
          </div>
        )}
      </div>
    </AdminOnly>
  )
}