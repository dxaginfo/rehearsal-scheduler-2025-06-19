import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import store
import { store } from './redux/store';

// Import components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import Loading from './components/common/Loading';

// Lazy load pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Profile = React.lazy(() => import('./pages/profile/Profile'));
const BandList = React.lazy(() => import('./pages/bands/BandList'));
const BandDetails = React.lazy(() => import('./pages/bands/BandDetails'));
const CreateBand = React.lazy(() => import('./pages/bands/CreateBand'));
const EditBand = React.lazy(() => import('./pages/bands/EditBand'));
const CreateRehearsal = React.lazy(() => import('./pages/rehearsals/CreateRehearsal'));
const RehearsalDetails = React.lazy(() => import('./pages/rehearsals/RehearsalDetails'));
const EditRehearsal = React.lazy(() => import('./pages/rehearsals/EditRehearsal'));
const Calendar = React.lazy(() => import('./pages/calendar/Calendar'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Router>
            <React.Suspense fallback={<Loading />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Private routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/bands" element={
                    <PrivateRoute>
                      <BandList />
                    </PrivateRoute>
                  } />
                  <Route path="/bands/create" element={
                    <PrivateRoute>
                      <CreateBand />
                    </PrivateRoute>
                  } />
                  <Route path="/bands/:bandId" element={
                    <PrivateRoute>
                      <BandDetails />
                    </PrivateRoute>
                  } />
                  <Route path="/bands/:bandId/edit" element={
                    <PrivateRoute>
                      <EditBand />
                    </PrivateRoute>
                  } />
                  <Route path="/bands/:bandId/rehearsals/create" element={
                    <PrivateRoute>
                      <CreateRehearsal />
                    </PrivateRoute>
                  } />
                  <Route path="/rehearsals/:rehearsalId" element={
                    <PrivateRoute>
                      <RehearsalDetails />
                    </PrivateRoute>
                  } />
                  <Route path="/rehearsals/:rehearsalId/edit" element={
                    <PrivateRoute>
                      <EditRehearsal />
                    </PrivateRoute>
                  } />
                  <Route path="/calendar" element={
                    <PrivateRoute>
                      <Calendar />
                    </PrivateRoute>
                  } />
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;