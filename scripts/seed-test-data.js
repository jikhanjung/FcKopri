const { createClient } = require('@supabase/supabase-js');

// 테스트 환경 Supabase 클라이언트
const supabase = createClient(
  process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedTestData() {
  try {
    console.log('🌱 테스트 데이터 시드 시작...');

    // 1. 기존 데이터 정리 (역순으로 삭제)
    console.log('🗑️  기존 데이터 정리 중...');
    await supabase.from('match_events').delete().neq('id', '');
    await supabase.from('matches').delete().neq('id', '');
    await supabase.from('players').delete().neq('id', '');
    await supabase.from('teams').delete().neq('is_hidden', true); // 무소속 팀 제외

    // 2. 대회 정보 업데이트
    console.log('🏆 대회 정보 설정 중...');
    const { error: competitionError } = await supabase
      .from('competitions')
      .upsert({
        id: 1,
        name: '테스트 KOPRI CUP',
        description: 'E2E 테스트용 풋살 대회',
        year: 2025,
        start_date: '2025-06-20',
        end_date: '2025-06-30',
        half_duration_minutes: 45
      });

    if (competitionError) throw competitionError;

    // 3. 테스트 팀 생성
    console.log('👥 테스트 팀 생성 중...');
    const teams = [
      { id: 'test-team-1', name: '블리자드', department: '연구부' },
      { id: 'test-team-2', name: 'B키세요', department: '관리부' },
      { id: 'test-team-3', name: '자타공인', department: '기술부' },
      { id: 'test-team-4', name: '포세이돈', department: '운영부' }
    ];

    const { error: teamsError } = await supabase
      .from('teams')
      .insert(teams);

    if (teamsError) throw teamsError;

    // 4. 테스트 선수 생성
    console.log('⚽ 테스트 선수 생성 중...');
    const players = [];
    teams.forEach((team, teamIndex) => {
      for (let i = 1; i <= 6; i++) {
        players.push({
          name: `${team.name} 선수${i}`,
          team_id: team.id,
          position: i <= 2 ? '공격수' : i <= 4 ? '미드필더' : '수비수'
        });
      }
    });

    const { error: playersError } = await supabase
      .from('players')
      .insert(players);

    if (playersError) throw playersError;

    // 5. 테스트 경기 생성
    console.log('🏟️  테스트 경기 생성 중...');
    const matches = [
      {
        id: 'test-match-1',
        home_team_id: 'test-team-1',
        away_team_id: 'test-team-2',
        match_date: '2025-06-20T14:00:00',
        status: 'completed',
        home_score: 2,
        away_score: 1
      },
      {
        id: 'test-match-2',
        home_team_id: 'test-team-3',
        away_team_id: 'test-team-4',
        match_date: '2025-06-21T15:00:00',
        status: 'completed',
        home_score: 1,
        away_score: 0
      },
      {
        id: 'test-match-3',
        home_team_id: 'test-team-1',
        away_team_id: 'test-team-3',
        match_date: '2025-06-22T16:00:00',
        status: 'scheduled',
        home_score: null,
        away_score: null
      },
      {
        id: 'test-match-4',
        home_team_id: 'test-team-2',
        away_team_id: 'test-team-4',
        match_date: '2025-06-23T17:00:00',
        status: 'in_progress',
        home_score: 1,
        away_score: 1
      }
    ];

    const { error: matchesError } = await supabase
      .from('matches')
      .insert(matches);

    if (matchesError) throw matchesError;

    // 6. 테스트 경기 이벤트 생성
    console.log('⚽ 테스트 경기 이벤트 생성 중...');
    const { data: testPlayers } = await supabase
      .from('players')
      .select('id, name, team_id')
      .limit(8);

    if (testPlayers && testPlayers.length >= 4) {
      const events = [
        {
          match_id: 'test-match-1',
          player_id: testPlayers[0].id,
          event_type: 'goal',
          minute: 15,
          half: 1
        },
        {
          match_id: 'test-match-1',
          player_id: testPlayers[1].id,
          event_type: 'assist',
          minute: 15,
          half: 1
        },
        {
          match_id: 'test-match-1',
          player_id: testPlayers[0].id,
          event_type: 'goal',
          minute: 32,
          half: 1
        },
        {
          match_id: 'test-match-1',
          player_id: testPlayers[2].id,
          event_type: 'goal',
          minute: 55,
          half: 2
        }
      ];

      const { error: eventsError } = await supabase
        .from('match_events')
        .insert(events);

      if (eventsError) throw eventsError;
    }

    // 7. 테스트 예측 데이터 생성
    console.log('🔮 테스트 예측 데이터 생성 중...');
    const predictions = [
      {
        match_id: 'test-match-3',
        ip_address: '127.0.0.1',
        home_score_prediction: 2,
        away_score_prediction: 1,
        confidence: 4,
        reasoning: '테스트 예측입니다'
      }
    ];

    const { error: predictionsError } = await supabase
      .from('match_predictions')
      .insert(predictions);

    if (predictionsError) console.warn('예측 데이터 생성 실패:', predictionsError);

    // 8. 테스트 우승팀 투표 생성
    console.log('🏆 테스트 우승팀 투표 생성 중...');
    const championVotes = [
      {
        team_id: 'test-team-1',
        ip_address: '127.0.0.1',
        confidence: 5,
        reasoning: '테스트 우승 투표입니다'
      }
    ];

    const { error: votesError } = await supabase
      .from('champion_votes')
      .insert(championVotes);

    if (votesError) console.warn('우승팀 투표 생성 실패:', votesError);

    console.log('✅ 테스트 데이터 시드 완료!');
    console.log('📊 생성된 데이터:');
    console.log(`   - 팀: ${teams.length}개`);
    console.log(`   - 선수: ${players.length}명`);
    console.log(`   - 경기: ${matches.length}경기`);
    console.log('🧪 이제 E2E 테스트를 실행할 수 있습니다!');

  } catch (error) {
    console.error('❌ 테스트 데이터 시드 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedTestData();
}

module.exports = { seedTestData };