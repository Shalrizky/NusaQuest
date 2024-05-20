import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './util/AuthContext';  
import Login from './routes/Login';
import Home from './routes/Home';
import Profile from './routes/Profile';
import Information from './routes/InformationDestination';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/information",
    element: <Information />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>  
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
