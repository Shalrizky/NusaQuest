import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import Loader from './util/Loader';

const Login = lazy(() => import('./routes/Login'));
const Home = lazy(() => import('./routes/Home'));
const Profile = lazy(() => import('./routes/Profile'));
const LobbyUtangga = lazy(() => import('./routes/LobbyUtangga'));
const LobbyNuca = lazy(() => import('./routes/LobbyNuca'));
const Information = lazy(() => import('./routes/InformationDestination'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

const App = () => {
  const AuthLayout = () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );

  const router = createBrowserRouter([
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/login', element: <Login /> },
        {
          path: '/profile',
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )
        },
        { path: '/information', element: <Information /> },
        {
          path: '/lobbyUtangga', element: (
            <ProtectedRoute>
              <LobbyUtangga />
            </ProtectedRoute>
          )
        },
        {
          path: '/lobbyNuca', element: (
            <ProtectedRoute>
              <LobbyNuca />
            </ProtectedRoute>
          )
        },

      ]
    }
  ]);

  return (
    <React.StrictMode>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);