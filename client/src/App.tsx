import { BrowserRouter, Route,Routes } from 'react-router-dom'
import Login from './auth/login'
import ForgotPassword from './auth/forgotPassword'
import ProtectedRoute from './protectedRoute'
import GuestRoute from './GuestRoute'
import Home from './pages/Home'
import NotFound from './pages/NotFound'


import { useDispatch, useSelector } from 'react-redux'
import { login, logout } from './slice/auth/authSlice'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { meApi } from './api/api'
import { useEffect } from 'react'


import SearchPage from './pages/SearchPage'
import Layout from './components/Layout'
import ProfilePage from './pages/ProfilePage'
import socket from './socket'

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);
  const queryClient = useQueryClient();

  const { data, isError } = useQuery({
    queryKey: ["me"],
    queryFn: meApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      dispatch(login(data.user)); // Fix: extract user object
    }
    if (isError) {
      dispatch(logout());
    }
  }, [data, isError, dispatch]);

  useEffect(() => {
    if (user) {
      console.log("Connecting socket for user:", user.id || user._id);
      socket.connect();

      const handleUserOnline = (data: { userId: string }) => {
        console.log("Socket userOnline event:", data);
        
        // Update my-chats cache
        queryClient.setQueriesData({ queryKey: ["my-chats"] }, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              chats: page.chats.map((chat: any) => 
                chat.otherUserId === data.userId ? { ...chat, isOnline: true } : chat
              )
            }))
          };
        });

        // Update connections cache
        queryClient.setQueriesData({ queryKey: ["connections"] }, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              const connList = page.connections || page;
              const updatedList = connList.map((conn: any) => {
                const requester = conn.requester._id === data.userId ? { ...conn.requester, isOnline: true } : conn.requester;
                const receiver = conn.receiver._id === data.userId ? { ...conn.receiver, isOnline: true } : conn.receiver;
                return { ...conn, requester, receiver };
              });
              return page.connections ? { ...page, connections: updatedList } : updatedList;
            })
          };
        });

        // Update users search cache
        queryClient.setQueriesData({ queryKey: ["users"] }, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              users: page.users.map((u: any) => 
                u._id === data.userId ? { ...u, isOnline: true } : u
              )
            }))
          };
        });
      };

      const handleUserOffline = (data: { userId: string }) => {
        console.log("Socket userOffline event:", data);

        // Update my-chats cache
        queryClient.setQueriesData({ queryKey: ["my-chats"] }, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              chats: page.chats.map((chat: any) => 
                chat.otherUserId === data.userId ? { ...chat, isOnline: false } : chat
              )
            }))
          };
        });

        // Update connections cache
        queryClient.setQueriesData({ queryKey: ["connections"] }, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              const connList = page.connections || page;
              const updatedList = connList.map((conn: any) => {
                const requester = conn.requester._id === data.userId ? { ...conn.requester, isOnline: false } : conn.requester;
                const receiver = conn.receiver._id === data.userId ? { ...conn.receiver, isOnline: false } : conn.receiver;
                return { ...conn, requester, receiver };
              });
              return page.connections ? { ...page, connections: updatedList } : updatedList;
            })
          };
        });

        // Update users search cache
        queryClient.setQueriesData({ queryKey: ["users"] }, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              users: page.users.map((u: any) => 
                u._id === data.userId ? { ...u, isOnline: false } : u
              )
            }))
          };
        });
      };

      socket.on("userOnline", handleUserOnline);
      socket.on("userOffline", handleUserOffline);

      return () => {
        socket.off("userOnline", handleUserOnline);
        socket.off("userOffline", handleUserOffline);
        socket.disconnect();
      };
    } else {
      socket.disconnect();
    }
  }, [user, queryClient]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={< Home/>} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      
    </BrowserRouter>
  )
}

export default App
