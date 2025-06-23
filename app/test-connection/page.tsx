'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [competitions, setCompetitions] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Supabase 연결 테스트
        const { data, error } = await supabase
          .from('competitions')
          .select('*')
        
        if (error) {
          throw error
        }
        
        setCompetitions(data || [])
        setConnectionStatus('success')
      } catch (err: any) {
        setError(err.message)
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase 연결 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">연결 상태</h2>
          
          {connectionStatus === 'loading' && (
            <div className="text-yellow-600">연결 확인 중...</div>
          )}
          
          {connectionStatus === 'success' && (
            <div className="text-green-600">✅ Supabase 연결 성공!</div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="text-red-600">❌ 연결 실패: {error}</div>
          )}
          
          {competitions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">대회 목록</h3>
              <ul className="space-y-2">
                {competitions.map((comp) => (
                  <li key={comp.id} className="border p-3 rounded">
                    <div className="font-medium">{comp.name}</div>
                    <div className="text-sm text-gray-600">{comp.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="mt-6 p-4 bg-yellow-50 rounded">
              <h3 className="font-medium text-yellow-800">해결 방법:</h3>
              <ol className="list-decimal list-inside mt-2 text-sm text-yellow-700 space-y-1">
                <li>Supabase 프로젝트의 SQL Editor에서 database.sql 파일의 내용을 실행하세요</li>
                <li>.env.local 파일의 환경 변수가 올바른지 확인하세요</li>
                <li>Supabase 프로젝트의 Settings &gt; API에서 URL과 Key를 다시 확인하세요</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}