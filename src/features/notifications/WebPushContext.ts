import { createContext, useContext } from 'react'

export const WebPushContext = createContext({
  busy: false, message: '', enable: async () => {},
})
export const useWebPush = () => useContext(WebPushContext)
