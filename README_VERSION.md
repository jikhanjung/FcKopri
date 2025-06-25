# 버전 관리 시스템

FcKopri 프로젝트의 버전 관리 시스템입니다.

## 현재 버전

버전 정보는 `version.json` 파일에 저장되어 있습니다.

## 버전 업데이트 방법

### 1. CLI 스크립트 사용

```bash
npm run version:update
```

스크립트를 실행하면 다음 옵션을 선택할 수 있습니다:
- **major**: x.0.0 (주요 기능 변경)
- **minor**: 1.x.0 (새 기능 추가)
- **patch**: 1.1.x (버그 수정)
- **custom**: 직접 버전 입력

### 2. 수동 업데이트

`version.json` 파일을 직접 편집할 수도 있습니다:

```json
{
  "version": "1.1.0",
  "releaseDate": "2025-06-24",
  "description": "Extended Features Release"
}
```

## 버전 표시

- 모든 페이지 하단 Footer에 버전이 표시됩니다
- 형식: `FcKopri v1.1.0 · 제1회 KOPRI CUP 리그 관리 시스템`

## Git 태그 관리

버전 업데이트 후 Git 태그를 생성하는 것을 권장합니다:

```bash
git add version.json
git commit -m "chore: Update version to 1.2.0"
git tag v1.2.0
git push origin main --tags
```

## 버전 규칙

[Semantic Versioning](https://semver.org/) 규칙을 따릅니다:

- **MAJOR**: 하위 호환성이 없는 API 변경
- **MINOR**: 하위 호환성 있는 기능 추가
- **PATCH**: 하위 호환성 있는 버그 수정