import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASEURL } from '../../config/config.js';
import { baseQueryWithAuthRedirect } from './baseQueryWithAuthRedirect.js';

export const operatorComments = createApi({
    reducerPath: 'operatorCommentsApi',
    baseQuery: baseQueryWithAuthRedirect,
    endpoints: (builder) => ({
        fetch: builder.mutation({
            query: (data) => ({
                url: `/api/operator-comments/fetch`,
                method: 'POST',
                body: data
            }),
        }),

        // page and size should be in params
        list: builder.mutation({
            query: (data) => ({
                url: `/api/operator-comments/list`,
                method: 'POST',
                body: data
            }),
        }),
    }),
});

export const {
    useFetchMutation,
    useListMutation,
} = operatorComments;