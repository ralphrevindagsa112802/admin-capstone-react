import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import './index.css'

import NotFound from './pages/NotFound'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import AdminMenu from './AdminMenu'
import AdminFeedback from './AdminFeedback'
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
  }]);
  

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
)