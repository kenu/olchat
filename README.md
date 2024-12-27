# Ollama 채팅 애플리케이션

이 프로젝트는 Ollama AI 모델을 활용한 실시간 채팅 애플리케이션입니다.

## 주요 기능

- Ollama AI 모델과의 실시간 대화
- 스트리밍 방식의 응답 출력
- 마크다운 형식 지원
- 모던한 채팅 UI/UX

## 기술 스택

- React + Vite
- Ollama API
- Marked (마크다운 변환)
- TailwindCSS (스타일링)

## 기술적 상세

### JSON 스트리밍 구현
이 애플리케이션은 Ollama API의 스트리밍 응답을 처리하기 위해 다음과 같은 기술을 사용합니다:

```javascript
// 응답 스트림 처리
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  // 청크 디코딩 및 JSON 파싱
  const chunk = decoder.decode(value)
  const lines = chunk.split('\n')
  
  for (const line of lines) {
    if (line.trim()) {
      const data = JSON.parse(line)
      // 실시간으로 응답 텍스트 누적
    }
  }
}
```

각 응답은 다음과 같은 JSON 형식으로 스트리밍됩니다:
```json
{"model":"phi3.5","created_at":"2024-12-27T06:31:49.099797Z","response":"It","done":false}
{"model":"phi3.5","created_at":"2024-12-27T06:31:49.146741Z","response":"appears","done":false}
...
{"model":"phi3.5","created_at":"2024-12-27T06:31:49.835466Z","response":".","done":true}
```

### 마크다운 처리
- marked 라이브러리를 사용하여 마크다운 텍스트를 HTML로 변환
- 특수 문자(~) 이스케이프 처리
- 실시간 렌더링 지원

## 시작하기

### 필수 조건
- Node.js
- pnpm
- Ollama (로컬에 설치 및 실행 필요)

### 설치 방법

```bash
# 저장소 복제
git clone [repository-url]

# 프로젝트 디렉토리로 이동
cd olchat

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### Ollama 설정

1. [Ollama 공식 사이트](https://ollama.ai)에서 Ollama를 설치합니다.
2. Ollama 서버를 실행합니다.
3. 필요한 AI 모델을 다운로드합니다 (예: `ollama pull phi3.5`).

## 개발 환경

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) - Babel 기반의 Fast Refresh 지원
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) - SWC 기반의 Fast Refresh 지원

## 라이선스

MIT License
