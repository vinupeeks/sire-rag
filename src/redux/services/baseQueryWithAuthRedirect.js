import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASEURL } from '../../config/config';
import { toggleSnackbar } from '../reducers/optionsReducers.js';
import { logout } from '../reducers/authReducers.js';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: BASEURL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState()?.auth?.user?.jwttoken;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        } else {
            headers.delete('Authorization');
        }
        return headers;
    },
});


export const baseQueryWithAuthRedirect = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result?.error?.data?.error) {
        // api.dispatch(logout());
        api.dispatch(toggleSnackbar({
            open: true,
            severity: "error",
            position: "top-center",
            message: result?.error?.data?.message,
            description: result?.error?.data?.description
        }));
    }
    
    return result;
};