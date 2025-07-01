// 예시: 컴포넌트에 data-testid 추가하는 방법

// ❌ Before - 테스트하기 어려움
<div className="match-card">
  <h3>{match.homeTeam} vs {match.awayTeam}</h3>
</div>

// ✅ After - 테스트하기 쉬움
<div className="match-card" data-testid="match-card">
  <h3>{match.homeTeam} vs {match.awayTeam}</h3>
</div>

// 버튼 예시
<button 
  onClick={handleSubmit}
  data-testid="submit-button"
>
  제출
</button>

// 폼 필드 예시
<input
  type="text"
  name="teamName"
  data-testid="team-name-input"
/>