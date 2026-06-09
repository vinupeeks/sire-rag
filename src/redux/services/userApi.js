import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASEURL } from '../../config/config.js';
import { baseQueryWithAuthRedirect } from './baseQueryWithAuthRedirect.js';

export const userApi = createApi({
    reducerPath: 'loginApi',
    baseQuery: baseQueryWithAuthRedirect,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `/api/user/login`,
                method: 'POST',
                body: data
            }),
        }),
        viewUser: builder.mutation({
            query: () => ({
                url: `/api/user/view`,
                method: 'GET'
            }),
        }),
        createUser: builder.mutation({
            query: (data) => ({
                url: `/api/user/create`,
                method: 'POST',
                body: data
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useViewUserMutation,
    useCreateUserMutation,
} = userApi;