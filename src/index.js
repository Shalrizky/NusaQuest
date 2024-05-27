import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { AuthProvider } from './util/AuthContext';
import Login from './routes/Login';
import Home from './routes/Home';
import Profile from './routes/Profile';
import Information from './routes/InformationDestination';
import ProtectedRoute from './util/ProtectedRoute';
import RoomUtangga from './routes/RoomUtangga';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/profile',
    element: <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  },
  {
    path: '/information',
    element: <Information />
  },
  {
    path: '/RoomUtangga',
    element: <RoomUtangga />
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