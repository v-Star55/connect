import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import store from './store/store.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster/>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)
