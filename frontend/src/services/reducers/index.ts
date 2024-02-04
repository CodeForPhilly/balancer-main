import { combineReducers } from 'redux';
// import auth from './auth';
import authReducer from './auth';

const rootReducer = combineReducers({
    auth: authReducer
});


export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;