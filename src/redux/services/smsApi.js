import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthRedirect } from './baseQueryWithAuthRedirect';

export const smsApi = createApi({
    reducerPath: 'smsApi',
    baseQuery: baseQueryWithAuthRedirect,
    tagTypes: ['PDF'],
    endpoints: (builder) => ({

        getPdfList: builder.query({
            query: (userId) => ({
                url: `/api/rag/user-pdfs`,
                method: 'GET',
                params: {
                    user_id: Number(userId),
                },
            }),
        }),

        getOcimfFiles: builder.query({
            query: (userId) => ({
                url: `/api/rag/ocimf-files`,
                method: 'GET',
                params: {
                    user_id: Number(userId),
                },
            }),
        }),

        uploadPdf: builder.mutation({
            query: (formData) => ({
                url: `/api/rag/upload-document`,
                method: 'POST',
                body: formData,
            }),
        }),

        deletePdf: builder.mutation({
            query: (data) => ({
                url: `/api/rag/delete-single-file`,
                method: 'DELETE',
                body: {
                    user_id: data.user_id,
                    file_name: data.file_name,
                },
            }),
            invalidatesTags: ['PDF'],
        }),

        deleteOcimfFile: builder.mutation({
            query: (data) => ({
                url: `/api/rag/delete-file`,
                method: 'DELETE',
                body: {
                    user_id: data.user_id,
                    file_name: data.file_name,
                },
            }),
            invalidatesTags: ['PDF'],
        }),

        queryChat: builder.mutation({
            query: (data) => ({
                url: `/api/rag/query`,
                method: 'POST',
                body: data,
            }),
        }),

    }),
});

export const {
    useGetPdfListQuery,
    useGetOcimfFilesQuery,
    useUploadPdfMutation,
    useDeletePdfMutation,
    useDeleteOcimfFileMutation,
    useQueryChatMutation,
} = smsApi;