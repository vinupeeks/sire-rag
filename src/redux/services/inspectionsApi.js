import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthRedirect } from './baseQueryWithAuthRedirect.js';

export const inspectionsApi = createApi({
    reducerPath: 'inspectionsApi',
    baseQuery: baseQueryWithAuthRedirect,
    endpoints: (builder) => ({
        listInspections: builder.mutation({
            query: (data) => ({
                url: '/api/inspections/list',
                method: 'POST',
                body: data,
            }),
        }),
        getInspectionDetails: builder.mutation({
            query: (inspectionId) => ({
                url: `/api/inspections/details/${inspectionId}`,
                method: 'GET',
            }),
        }),
        uploadInspectionPdf: builder.mutation({
            query: (formData) => ({
                url: '/api/fileupload/pdfupload',
                method: 'POST',
                body: formData,
            }),
        }),
        extractInspectionPdf: builder.mutation({
            query: (data) => ({
                url: '/api/pdf_extraction',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useListInspectionsMutation,
    useGetInspectionDetailsMutation,
    useUploadInspectionPdfMutation,
    useExtractInspectionPdfMutation,
} = inspectionsApi;