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
    <div className="min-h-dvh bg-[#eaf2ed]">
      <main
        className="mx-auto flex min-h-dvh w-full max-w-[393px] items-center justify-center overflow-x-hidden bg-surface-canvas px-5 min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]"
        role="status"
        aria-live="polite"
      >
        <p className="typography-body-2 text-neutral-700">
          화면을 불러오고 있어요.
        </p>
      </main>
    </div>
  )
}

export default App