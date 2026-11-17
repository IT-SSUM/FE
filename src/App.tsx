import {
  Suspense,
} from 'react'

import {
  RouterProvider,
} from 'react-router-dom'

import {
  WebPushProvider,
} from '@/features/notifications/WebPushProvider'

import {
  router,
} from '@/routes/router'

function App() {
  return (
    <WebPushProvider>
      <Suspense
        fallback={
          <RouteLoadingFallback />
        }
      >
        <RouterProvider
          router={router}
        />
      </Suspense>
    </WebPushProvider>
  )
}

function RouteLoadingFallback() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-surface-canvas px-5"
      role="status"
      aria-live="polite"
    >
      <p className="typography-body-2 text-neutral-700">
        화면을 불러오고 있어요.
      </p>
    </main>
  )
}

export default App