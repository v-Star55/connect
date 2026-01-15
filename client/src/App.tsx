import { BrowserRouter, Route,Routes } from 'react-router-dom'
import Login from './auth/login'
import Register from './auth/register'
import ForgotPassword from './auth/forgotPassword'
import ProtectedRoute from './protectedRoute'
import GuestRoute from './GuestRoute'
import Home from './pages/Home'
import NotFound from './pages/NotFound'


import { useDispatch } from 'react-redux'
import { login, logout } from './slice/auth/authSlice'
import { useQuery } from '@tanstack/react-query'
import { meApi } from './api/api'
import { useEffect } from 'react'


import SearchPage from './pages/SearchPage'
import Layout from './components/Layout'

function App() {
  const dispatch = useDispatch();

  const { data, isError } = useQuery({
    queryKey: ["me"],
    queryFn: meApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      dispatch(login(data.user)); // Fix: extract user object
    }
    if (isError) {
      dispatch(logout());
    }
  }, [data, isError, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={< Home/>} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      
    </BrowserRouter>
  )
}

export default App
