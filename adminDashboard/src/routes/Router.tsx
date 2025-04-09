// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ProtectedRoute from './ProtectedRoute';

import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));

// utilities
const Typography = Loadable(lazy(() => import('../views/typography/Typography')));
const Table = Loadable(lazy(() => import('../views/tables/Table')));
const Form = Loadable(lazy(() => import('../views/forms/Form')));
const Shadow = Loadable(lazy(() => import('../views/shadows/Shadow')));

// icons
const Solar = Loadable(lazy(() => import('../views/icons/Solar')));

// authentication
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      {
        path: '/',
        exact: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/ui/typography',
        exact: true,
        element: (
          <ProtectedRoute>
            <Typography />
          </ProtectedRoute>
        ),
      },
      {
        path: '/ui/table',
        exact: true,
        element: (
          <ProtectedRoute>
            <Table />
          </ProtectedRoute>
        ),
      },
      {
        path: '/ui/form',
        exact: true,
        element: (
          <ProtectedRoute>
            <Form />
          </ProtectedRoute>
        ),
      },
      {
        path: '/ui/shadow',
        exact: true,
        element: (
          <ProtectedRoute>
            <Shadow />
          </ProtectedRoute>
        ),
      },
      {
        path: '/icons/solar',
        exact: true,
        element: (
          <ProtectedRoute>
            <Solar />
          </ProtectedRoute>
        ),
      },
      {
        path: '/sample-page',
        exact: true,
        element: (
          <ProtectedRoute>
            <SamplePage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router, { basename: '/MatDash' });
export default router;
