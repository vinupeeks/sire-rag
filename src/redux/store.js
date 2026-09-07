import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import rootReducer from './reducers';
import { userApi } from './services/userApi.js';
import { smsApi } from './services/smsApi.js';
import { operatorComments } from './services/operatorCommentsApi';
import { inspectionsApi } from './services/inspectionsApi';

import storageModule from 'redux-persist/lib/storage';
const storage = storageModule.default || storageModule;

const persistConfig = {
    key: 'root',
    storage,
    blacklist: [
        'pagination',
        userApi.reducerPath,
        smsApi.reducerPath,
        operatorComments.reducerPath,
        inspectionsApi.reducerPath,
    ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        })
            .concat(userApi.middleware)
            .concat(smsApi.middleware)
            .concat(operatorComments.middleware)
            .concat(inspectionsApi.middleware),
});

export const persistor = persistStore(store);
