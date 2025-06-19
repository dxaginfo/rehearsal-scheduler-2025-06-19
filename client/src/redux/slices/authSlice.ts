import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define types
interface UserData {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  phone?: string;
  instruments?: string[];
  defaultAvailability?: any[];
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    reminderTimes: number[];
  };
}

interface AuthState {
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Get initial state from localStorage
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: UserData }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      
      // Save to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ token: string; user: UserData }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      
      // Save to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateUserSuccess: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  updateUserSuccess,
  logout,
  clearError,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Export reducer
export default authSlice.reducer;