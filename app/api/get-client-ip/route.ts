import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // 클라이언트 IP 주소 가져오기
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  let ip = forwarded?.split(',')[0] || realIp || remoteAddr || '127.0.0.1'
  
  // IPv6 로컬호스트를 IPv4로 변환
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1'
  }
  
  return NextResponse.json({ ip })
}