-- 시드 데이터: 기본 데이터 설정
-- DB 리셋 시 자동으로 실행됩니다.

-- 기본 대회 생성 (테스트용)
INSERT INTO public.competitions (id, name, description, start_date, end_date, half_duration_minutes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '제 1회 LeagueHub Cup',
  'LeagueHub 테스트 대회',
  '2025-01-01',
  '2025-12-31',
  20,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 로그 출력
DO $$
BEGIN
  RAISE NOTICE '✅ 기본 데이터가 성공적으로 생성되었습니다.';
  RAISE NOTICE '🏆 대회: 제 1회 LeagueHub Cup';
  RAISE NOTICE '';
  RAISE NOTICE '👤 SuperAdmin 계정을 생성하려면 다음 명령을 실행하세요:';
  RAISE NOTICE '   node scripts/create-admin.js';
  RAISE NOTICE '';
END $$;