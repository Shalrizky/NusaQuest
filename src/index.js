import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Loader from './utils/Loader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Login from './routes/Login';
import Home from './routes/Home';
import Profile from './routes/Profile';
import LobbyGame from './routes/LobbyGame';
import Information from './routes/InformationDestination';
import DestinationDetail from './routes/DestinationDetail';
import RoomPlayer from './routes/RoomPlayer';
import UlarTangga from './routes/UlarTangga';
<<<<<<< HEAD
import UlarTanggaAi from './routes/UlarTanggaAi';
=======
import UtanggaVsAi from './routes/UtanggaVsAi';
import NusaCard from './routes/NusaCard';
import NucaVsAi from './routes/NucaVsAi';
>>>>>>> main
import ProtectedRoute from './components/ProtectedRoute';


const withLoader = (Component) => {
  return (props) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return <Loader />;
    }

    return <Component {...props} />;
  };
};

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
        { path: '/', element: withLoader(Home)() },
        { path: '/login', element: withLoader(Login)() },
        {
          path: '/profile',
          element: (
            <ProtectedRoute>
              {withLoader(Profile)()}
            </ProtectedRoute>
          )
        },
        { path: '/information', element: withLoader(Information)() },
        { path: '/destination/:id', element: withLoader(DestinationDetail)() },
        {
          path: '/lobby/:topicID/:gameID',
          element: (
            <ProtectedRoute>
              {withLoader(LobbyGame)()}
            </ProtectedRoute>
          )
        },
        {
          path: '/:gameID/:topicID/:roomID',
          element: (
            <ProtectedRoute>
              {withLoader(RoomPlayer)()}
            </ProtectedRoute>
          )
        },
        {
          path: '/:gameID/:topicID/:roomID/playUTangga',
          element: (
            <ProtectedRoute>
              {withLoader(UlarTangga)()}
            </ProtectedRoute>
          )
        },
        {
<<<<<<< HEAD
          path: '/UlarTanggaAi', element: (
            <ProtectedRoute>
              {withLoader(UlarTanggaAi)()}
=======
          path: '/:gameID/:topicID/:roomID/playUtanggaVsAi',
          element: (
            <ProtectedRoute>
              {withLoader(UtanggaVsAi)()}
            </ProtectedRoute>
          )
        },
        {
          path: '/:gameID/:topicID/:roomID/playNuca',
          element: (
            <ProtectedRoute>
              {withLoader(NusaCard)()}
            </ProtectedRoute>
          )
        },
        {
          path: '/:gameID/:topicID/:roomID/playNucaVsAi',
          element: (
            <ProtectedRoute>
              {withLoader(NucaVsAi)()}
>>>>>>> main
            </ProtectedRoute>
          )
        },
      ]
    }
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
