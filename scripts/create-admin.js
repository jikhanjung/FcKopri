#!/usr/bin/env node

/**
 * SuperAdmin 계정 생성 스크립트
 * 이메일: admin@leaguehub.ai
 * 비밀번호: admin123
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.development.local' })

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

async function createSuperAdmin() {
  try {
    console.log('🚀 SuperAdmin 계정 생성 시작...')
    console.log('📍 Supabase URL:', supabaseUrl)
    
    const adminEmail = 'admin@leaguehub.ai'
    const adminPassword = 'admin123'
    
    // 2. Admin API를 사용하여 사용자 생성
    console.log('👤 사용자 생성 중...')
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: 'LeagueHub Admin',
        display_name: 'LeagueHub Admin',
        department: 'System Administration'
      }
    })
    
    if (createError) {
      console.error('❌ 사용자 생성 오류:', createError)
      return
    }
    
    console.log('✅ 사용자 생성 완료:', user.user.email)
    console.log('🆔 사용자 ID:', user.user.id)
    
    // 잠시 대기 (트리거 실행 시간)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 3. 프로필 업데이트 (트리거에 의해 자동 생성된 것을 업데이트)
    console.log('👤 프로필 업데이트 중...')
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        display_name: 'LeagueHub Admin',
        department: 'System Administration',
        bio: 'LeagueHub 시스템 관리자'
      })
      .eq('id', user.user.id)
    
    if (profileError) {
      console.error('❌ 프로필 업데이트 오류:', profileError)
    } else {
      console.log('✅ 프로필 업데이트 완료')
    }
    
    // 4. SuperAdmin 권한 부여
    console.log('👑 SuperAdmin 권한 부여 중...')
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.user.id,
        role: 'super_admin',
        granted_by: user.user.id,
        reason: 'Initial system administrator setup'
      })
    
    if (roleError) {
      console.error('❌ 권한 부여 오류:', roleError)
    } else {
      console.log('✅ SuperAdmin 권한 부여 완료')
    }
    
    console.log('')
    console.log('🎉 SuperAdmin 계정이 성공적으로 생성되었습니다!')
    console.log('📧 이메일:', adminEmail)
    console.log('🔑 비밀번호:', adminPassword)
    console.log('👑 권한: SuperAdmin')
    console.log('🏢 부서: System Administration')
    console.log('')
    console.log('이제 http://localhost:3000/auth/login 에서 로그인할 수 있습니다.')
    
  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error)
  }
}

// 스크립트 실행
if (require.main === module) {
  createSuperAdmin()
}

module.exports = { createSuperAdmin }