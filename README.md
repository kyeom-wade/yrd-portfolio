# YRD 포트폴리오 사이트 컨텐츠 관리 가이드

이 문서는 YRD 포트폴리오 사이트의 컨텐츠(프로젝트, 연락처 정보 등)를 직접 수정하는 방법을 설명합니다.

## 📁 프로젝트 구조

```
yrd-portfolio/
├── data/
│   ├── projects.json    # 프로젝트 정보
│   └── contact.json     # 연락처 정보
├── index.html           # 홈 페이지
├── works.html           # 작품 페이지
├── contact.html         # 연락 페이지
└── project-detail.html  # 프로젝트 상세 페이지
```

## 🎨 프로젝트 추가/수정하기

### 1. GitHub에서 직접 수정하기 (추천)

가장 쉬운 방법입니다. 코드 에디터 없이 브라우저에서 바로 수정할 수 있습니다.

1. **GitHub 저장소 접속**
   - https://github.com/kyeom-wade/yrd-portfolio 접속
   - 로그인되어 있는지 확인

2. **파일 찾기**
   - `data` 폴더 클릭
   - `projects.json` 파일 클릭

3. **수정하기**
   - 연필 아이콘(✏️) 클릭 (Edit this file)
   - 내용 수정
   - 하단 "Commit changes" 버튼 클릭
   - 커밋 메시지 입력 (예: "새 프로젝트 추가")
   - "Commit changes" 확인

4. **배포 확인**
   - 약 1-2분 후 사이트 자동 업데이트
   - https://kyeom-wade.github.io/yrd-portfolio/ 에서 확인

### 2. projects.json 파일 구조 이해하기

```json
[
  {
    "id": "프로젝트-고유-아이디",
    "title": "프로젝트 제목",
    "location": "위치",
    "year": "2024",
    "category": "Living",
    "image": "메인 이미지 URL",
    "thumbnail": "썸네일 이미지 URL",
    "description": "프로젝트 설명",
    "specs": {
      "area": "면적",
      "usage": "용도",
      "structure": "구조",
      "materials": "재료"
    },
    "gallery": [
      "갤러리 이미지 1 URL",
      "갤러리 이미지 2 URL",
      "갤러리 이미지 3 URL"
    ]
  }
]
```

### 3. 새 프로젝트 추가하기

#### Step 1: 기존 프로젝트 복사
가장 쉬운 방법은 기존 프로젝트를 복사해서 내용만 바꾸는 것입니다.

```json
{
  "id": "hannam-residence",
  "title": "한남동 주거 공간",
  "location": "서울 용산구",
  "year": "2024",
  "category": "Living",
  "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
  "thumbnail": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "description": "빛과 공간의 조화를 통해...",
  "specs": {
    "area": "180㎡",
    "usage": "단독주택",
    "structure": "철근콘크리트조",
    "materials": "노출콘크리트, 오크원목"
  },
  "gallery": [
    "https://images.unsplash.com/photo-1.jpg",
    "https://images.unsplash.com/photo-2.jpg"
  ]
}
```

#### Step 2: 내용 수정
- `id`: 영문으로 고유한 ID (예: "gangnam-office-2024")
- `title`: 프로젝트 이름
- `category`: 카테고리 선택
  - `Living` (주거)
  - `Commercial` (상업)
  - `Furniture` (가구/문화)
- `image`, `thumbnail`: 이미지 URL (아래 이미지 업로드 참고)
- `description`: 프로젝트 설명
- `gallery`: 상세 페이지에 표시될 이미지들

#### Step 3: 파일에 추가
- 배열(`[]`) 안에 있는 기존 프로젝트들 사이에 추가
- **중요**: 마지막 항목이 아니면 뒤에 쉼표(`,`) 필수
- **중요**: 마지막 항목 뒤에는 쉼표 없음

**올바른 예시:**
```json
[
  {
    "id": "project-1",
    ...
  },
  {
    "id": "project-2",
    ...
  },
  {
    "id": "new-project",
    ...
  }
]
```

**잘못된 예시:**
```json
[
  {
    "id": "project-1",
    ...
  }   // 쉼표 누락!
  {
    "id": "project-2",
    ...
  },  // 마지막에 쉼표!
]
```

### 4. 프로젝트 순서 변경하기

파일에서 위에 있을수록 먼저 표시됩니다.
- 홈 페이지 캐러셀: 처음 8개 프로젝트
- Works 페이지: 모든 프로젝트

원하는 순서대로 프로젝트 블록을 복사/붙여넣기 하면 됩니다.

### 5. 프로젝트 삭제하기

해당 프로젝트 블록 전체(`{...}`)를 삭제하면 됩니다.
**주의**: 쉼표(`,`) 위치 확인!

## 📷 이미지 업로드하기

### 방법 1: Unsplash 사용 (무료 고품질 이미지)

1. https://unsplash.com 접속
2. 원하는 이미지 검색
3. 이미지 클릭 → "Download" 버튼 옆 화살표 클릭
4. "Copy image address" 또는 URL에서 `?w=1920&q=80` 추가
5. JSON 파일에 URL 붙여넣기

**예시:**
```
https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80
```

### 방법 2: GitHub Issues 사용 (자체 이미지)

1. GitHub 저장소 → Issues 탭
2. "New issue" 클릭
3. 이미지를 본문에 드래그 앤 드롭
4. 업로드된 이미지 URL 복사
5. Issue는 저장하지 않고 닫기
6. 복사한 URL을 JSON 파일에 붙여넣기

### 방법 3: 외부 이미지 호스팅 서비스

- **Imgur**: https://imgur.com
- **Cloudinary**: https://cloudinary.com
- **ImageKit**: https://imagekit.io

무료 플랜으로 충분합니다.

### 이미지 크기 권장사항

- **메인 이미지 (`image`)**: 1920px × 1080px
- **썸네일 (`thumbnail`)**: 800px × 600px
- **갤러리 이미지**: 1920px × 1200px
- 파일 형식: JPG 또는 PNG
- 파일 크기: 각 이미지 500KB 이하 권장

## 📞 연락처 정보 수정하기

### 1. contact.json 파일 수정

```json
{
  "phone": "02-543-3415",
  "email": "yrd@yeorumdesign.co.kr",
  "instagram": "@yeorum_design",
  "address": "서울 강남구 봉은사로68길 19 2층",
  "hours": "월-금 9:00 - 17:00"
}
```

### 2. 각 필드 설명

- `phone`: 전화번호 (자동으로 전화 걸기 링크 생성)
- `email`: 이메일 주소 (자동으로 메일 보내기 링크 생성)
- `instagram`: 인스타그램 아이디 (@ 포함, 자동으로 링크 생성)
- `address`: 주소
- `hours`: 운영시간

모두 수정 가능하며, 저장 후 자동으로 사이트에 반영됩니다.

## ⚠️ 주의사항

### JSON 문법 규칙

1. **따옴표**: 항상 큰따옴표(`"`) 사용, 작은따옴표(`'`) 사용 금지
   ```json
   ✅ "title": "프로젝트"
   ❌ 'title': '프로젝트'
   ```

2. **쉼표**: 마지막 항목 뒤에는 쉼표 없음
   ```json
   ✅ { "a": 1, "b": 2 }
   ❌ { "a": 1, "b": 2, }
   ```

3. **중괄호/대괄호**: 열면 반드시 닫기
   ```json
   ✅ { "specs": { "area": "100㎡" } }
   ❌ { "specs": { "area": "100㎡" }
   ```

4. **한글 사용 가능**: 설명, 제목 등 모든 값에 한글 사용 가능

### 에러 확인 방법

1. **JSON 유효성 검사**
   - https://jsonlint.com 접속
   - 수정한 내용 붙여넣기
   - "Validate JSON" 클릭
   - 에러 있으면 줄 번호와 함께 표시

2. **GitHub에서 확인**
   - Commit 후 Actions 탭에서 빌드 상태 확인
   - 초록색 체크: 성공
   - 빨간색 X: 실패 (에러 로그 확인)

3. **사이트에서 확인**
   - 브라우저에서 F12 (개발자 도구)
   - Console 탭에서 에러 메시지 확인

## 🔧 로컬에서 테스트하기 (선택사항)

GitHub에 올리기 전에 로컬에서 미리 확인하고 싶다면:

### 1. 파일 다운로드
```bash
# GitHub에서 다운로드
git clone https://github.com/kyeom-wade/yrd-portfolio.git
cd yrd-portfolio
```

### 2. 로컬 서버 실행
```bash
# Python이 설치되어 있다면
python3 -m http.server 8000
```

### 3. 브라우저에서 확인
- http://localhost:8000 접속
- 수정사항 확인

### 4. GitHub에 업로드
```bash
git add .
git commit -m "프로젝트 추가"
git push
```

## 📝 자주 묻는 질문

### Q: 프로젝트가 사이트에 안 보여요
A: 다음을 확인하세요:
1. JSON 문법이 올바른가? (jsonlint.com에서 검증)
2. 커밋이 완료되었나? (GitHub Actions 확인)
3. 브라우저 캐시를 지웠나? (Ctrl+Shift+R 강력 새로고침)

### Q: 이미지가 안 나와요
A:
1. 이미지 URL이 `https://`로 시작하나요?
2. URL에 접속하면 이미지가 보이나요?
3. 따옴표로 제대로 감싸져 있나요?

### Q: 카테고리를 새로 만들고 싶어요
A:
1. `works.html` 파일에서 필터 버튼 추가
2. `projects.json`에서 `category` 값을 새 카테고리로 설정
3. 영문으로 통일 (예: "Office", "Retail")

### Q: 홈 캐러셀에 프로젝트를 더 보여주고 싶어요
A:
현재는 처음 8개만 표시됩니다. 더 보여주려면:
1. `js/main.js` 파일 열기
2. 417번째 줄 `projects.slice(0, 8)` 에서 8을 원하는 숫자로 변경

### Q: 프로젝트 순서를 바꾸고 싶어요
A:
`projects.json` 파일에서 프로젝트 블록 전체를 복사해서 원하는 위치에 붙여넣으면 됩니다.

## 🆘 문제 발생 시

1. **백업 확인**: GitHub는 모든 변경사항을 자동 저장하므로 이전 버전으로 되돌릴 수 있습니다.
2. **History 보기**: 파일 상단의 "History" 버튼으로 이전 버전 확인
3. **되돌리기**: 이전 버전의 "..." → "Revert" 클릭

## 📞 기술 지원

- GitHub Issues: https://github.com/kyeom-wade/yrd-portfolio/issues
- 수정이 어려우면 이슈를 등록하여 도움을 요청하세요.

---

**마지막 업데이트**: 2026년 5월
**사이트 URL**: https://kyeom-wade.github.io/yrd-portfolio/
