import { combineReducers } from 'redux';
import authReducer from './authReducers';
import dataReducer from './dataReducers';
import optionsReducers from './optionsReducers';
import paginationReducers from './paginationReducers';
import { userApi } from '../services/userApi';
import { smsApi } from '../services/smsApi';

const rootReducer = combineReducers({
  auth: authReducer,
  data: dataReducer,
  options: optionsReducers,
  pagination: paginationReducers,
  [userApi.reducerPath]: userApi.reducer,
  [smsApi.reducerPath]: smsApi.reducer,
});

export default rootReducer;
