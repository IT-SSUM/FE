import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes/router'
import { WebPushProvider } from '@/features/notifications/WebPushProvider'

function App() {
  return <WebPushProvider><RouterProvider router={router} /></WebPushProvider>
}

export default App
