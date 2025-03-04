import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import './index.css'

import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import AdminMenu from './admin/AdminMenu'
import AdminFeedback from './admin/AdminFeedback'
import AdminRequireAuth from './components/AdminRequireAuth';
import UserRequireAuth from './components/UserRequireAuth';

const router = createBrowserRouter([{
    path: '/login',
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
  }]);
  

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
)