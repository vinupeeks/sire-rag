import { combineReducers } from 'redux';
import authReducer from './authReducers';
import dataReducer from './dataReducers';
import optionsReducers from './optionsReducers';
import paginationReducers from './paginationReducers';
import { userApi } from '../services/userApi';
import { smsApi } from '../services/smsApi';
import { operatorComments } from '../services/operatorCommentsApi';

const rootReducer = combineReducers({
  auth: authReducer,
  data: dataReducer,
  options: optionsReducers,
  pagination: paginationReducers,
  [userApi.reducerPath]: userApi.reducer,
  [smsApi.reducerPath]: smsApi.reducer,
  [operatorComments.reducerPath]: operatorComments.reducer,
});

export default rootReducer;
