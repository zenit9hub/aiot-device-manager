/**
 * 인증 페이지 (임시)
 *
 * TODO: TDD로 본격 구현 예정
 */

export function renderApp(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    throw new Error('#app element not found');
  }

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 class="text-3xl font-bold text-center text-gray-800 mb-2">
          AIoT Device Manager
        </h1>
        <p class="text-center text-gray-600 mb-8">
          Phase 1 - Serverless MVP
        </p>

        <div class="space-y-4">
          <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 class="font-semibold text-green-800 mb-2">✅ 초기화 완료</h2>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• FSD 디자인 패턴 적용</li>
              <li>• Vite + TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Firebase SDK</li>
            </ul>
          </div>

          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 class="font-semibold text-blue-800 mb-2">🚧 다음 단계</h2>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Firebase Auth 연동 (TDD)</li>
              <li>• Firestore 실시간 구독</li>
              <li>• 디바이스 CRUD</li>
              <li>• MQTT 모니터링</li>
            </ul>
          </div>
        </div>

        <p class="text-center text-sm text-gray-500 mt-6">
          작업 히스토리는 <code class="bg-gray-100 px-2 py-1 rounded">fe-working-history.md</code>에서 확인
        </p>
      </div>
    </div>
  `;
}
