import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import './index.css'

import NotFound from './pages/NotFound'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import AdminMenu from './AdminMenu'
import AdminFeedback from './AdminFeedback'
import AdminHistory from './AdminHistory'
import AdminAnalytics from './AdminAnalytics'
import AdminRequireAuth from './components/AdminRequireAuth';


const router = createBrowserRouter([{
    path: '/',
    element: <AdminLogin />,
    errorElement: <NotFound/>,
  }, { 
    path: '/dashboard', 
    element: <AdminRequireAuth><AdminDashboard /></AdminRequireAuth>, 
    errorElement: <NotFound/> 
  },{ 
    path: '/menu', 
    element: <AdminRequireAuth><AdminMenu /></AdminRequireAuth>, 
    errorElement: <NotFound/> 
  }, {
    path: '/feedback',
    element: <AdminRequireAuth><AdminFeedback/></AdminRequireAuth>,
    errorElement: <NotFound/>
  }, {
    path: '/history',
    element: <AdminRequireAuth><AdminHistory/></AdminRequireAuth>,
    errorElement: <NotFound/>
  },  {
    path: '/analytics',
    element: <AdminRequireAuth><AdminAnalytics/></AdminRequireAuth>,
    errorElement: <NotFound/>
  }]);
  

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
)