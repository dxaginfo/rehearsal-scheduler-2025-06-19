import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// Define base API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as RootState).auth.token;
      
      // If token exists, add authorization header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Band', 'Rehearsal', 'Notification'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { password },
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    // User endpoints
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateAvailability: builder.mutation({
      query: (availabilityData) => ({
        url: '/users/availability',
        method: 'PUT',
        body: availabilityData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Band endpoints
    getBands: builder.query({
      query: () => '/bands',
      providesTags: ['Band'],
    }),
    getBand: builder.query({
      query: (bandId) => `/bands/${bandId}`,
      providesTags: (result, error, arg) => [{ type: 'Band', id: arg }],
    }),
    createBand: builder.mutation({
      query: (bandData) => ({
        url: '/bands',
        method: 'POST',
        body: bandData,
      }),
      invalidatesTags: ['Band'],
    }),
    updateBand: builder.mutation({
      query: ({ bandId, ...bandData }) => ({
        url: `/bands/${bandId}`,
        method: 'PUT',
        body: bandData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Band', id: arg.bandId }],
    }),
    deleteBand: builder.mutation({
      query: (bandId) => ({
        url: `/bands/${bandId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Band'],
    }),
    addBandMember: builder.mutation({
      query: ({ bandId, email }) => ({
        url: `/bands/${bandId}/members`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Band', id: arg.bandId }],
    }),
    removeBandMember: builder.mutation({
      query: ({ bandId, userId }) => ({
        url: `/bands/${bandId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Band', id: arg.bandId }],
    }),
    
    // Rehearsal endpoints
    getRehearsals: builder.query({
      query: (bandId) => `/bands/${bandId}/rehearsals`,
      providesTags: ['Rehearsal'],
    }),
    getRehearsal: builder.query({
      query: (rehearsalId) => `/rehearsals/${rehearsalId}`,
      providesTags: (result, error, arg) => [{ type: 'Rehearsal', id: arg }],
    }),
    createRehearsal: builder.mutation({
      query: ({ bandId, ...rehearsalData }) => ({
        url: `/bands/${bandId}/rehearsals`,
        method: 'POST',
        body: rehearsalData,
      }),
      invalidatesTags: ['Rehearsal'],
    }),
    updateRehearsal: builder.mutation({
      query: ({ rehearsalId, ...rehearsalData }) => ({
        url: `/rehearsals/${rehearsalId}`,
        method: 'PUT',
        body: rehearsalData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Rehearsal', id: arg.rehearsalId }],
    }),
    deleteRehearsal: builder.mutation({
      query: (rehearsalId) => ({
        url: `/rehearsals/${rehearsalId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rehearsal'],
    }),
    updateAttendance: builder.mutation({
      query: ({ rehearsalId, status }) => ({
        url: `/rehearsals/${rehearsalId}/attendance`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Rehearsal', id: arg.rehearsalId }],
    }),
    
    // Notification endpoints
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUpdateAvailabilityMutation,
  useGetBandsQuery,
  useGetBandQuery,
  useCreateBandMutation,
  useUpdateBandMutation,
  useDeleteBandMutation,
  useAddBandMemberMutation,
  useRemoveBandMemberMutation,
  useGetRehearsalsQuery,
  useGetRehearsalQuery,
  useCreateRehearsalMutation,
  useUpdateRehearsalMutation,
  useDeleteRehearsalMutation,
  useUpdateAttendanceMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = api;