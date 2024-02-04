import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_CONFIRM_SUCCESS,
    PASSWORD_RESET_CONFIRM_FAIL,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ACTIVATION_SUCCESS,
    ACTIVATION_FAIL,
    GOOGLE_AUTH_SUCCESS,
    GOOGLE_AUTH_FAIL,
    FACEBOOK_AUTH_SUCCESS,
    FACEBOOK_AUTH_FAIL,
    LOGOUT
} from '../actions/types';


type ActionType =
    | { type: typeof LOGIN_SUCCESS; payload: { access: string; refresh: string } }
    | { type: typeof LOGIN_FAIL }
    | { type: typeof USER_LOADED_SUCCESS; payload: ""  } 
    | { type: typeof USER_LOADED_FAIL }
    | { type: typeof AUTHENTICATED_SUCCESS }
    | { type: typeof AUTHENTICATED_FAIL }
    | { type: typeof PASSWORD_RESET_SUCCESS} 
    | { type: typeof PASSWORD_RESET_FAIL }
    | { type: typeof PASSWORD_RESET_CONFIRM_SUCCESS; payload: ""  } 
    | { type: typeof PASSWORD_RESET_CONFIRM_FAIL }
    | { type: typeof SIGNUP_SUCCESS; payload: ""  } 
    | { type: typeof SIGNUP_FAIL }
    | { type: typeof ACTIVATION_SUCCESS; payload: "" } 
    | { type: typeof ACTIVATION_FAIL }
    | { type: typeof GOOGLE_AUTH_SUCCESS; payload: { access: string; refresh: string } }
    | { type: typeof GOOGLE_AUTH_FAIL }
    | { type: typeof FACEBOOK_AUTH_SUCCESS; payload: { access: string; refresh: string } }
    | { type: typeof FACEBOOK_AUTH_FAIL }
    | { type: typeof LOGOUT };

// Define the shape of your state
interface StateType {
    access: string | null;
    refresh: string | null;
    isAuthenticated: boolean | null;
    user: string; // 
}

// Initial state with correct types
const initialState: StateType = {
    access: localStorage.getItem('access'),
    refresh: localStorage.getItem('refresh'),
    isAuthenticated: null,
    user: ""
};

export default function authReducer(state = initialState, action: ActionType): StateType {
    switch(action.type) {
        case AUTHENTICATED_SUCCESS:
            return {
                ...state,
                isAuthenticated: true
            }
        case LOGIN_SUCCESS:
        case GOOGLE_AUTH_SUCCESS:
        case FACEBOOK_AUTH_SUCCESS:
            localStorage.setItem('access', action.payload.access);
            localStorage.setItem('refresh', action.payload.refresh);
            return {
                ...state,
                isAuthenticated: true,
                access: action.payload.access,
                refresh: action.payload.refresh
            }
        case SIGNUP_SUCCESS:
            return {
                ...state,
                isAuthenticated: false
            }
        case USER_LOADED_SUCCESS:
            return {
                ...state,
                user: action.payload
            }
        case AUTHENTICATED_FAIL:
            return {
                ...state,
                isAuthenticated: false
            }
        case USER_LOADED_FAIL:
            return {
                ...state,
                user: ""
            }
        case GOOGLE_AUTH_FAIL:
        case FACEBOOK_AUTH_FAIL:
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
        case LOGOUT:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return {
                ...state,
                access: null,
                refresh: null,
                isAuthenticated: false,
                user: ""
            }
        case PASSWORD_RESET_SUCCESS:
        case PASSWORD_RESET_FAIL:
        case PASSWORD_RESET_CONFIRM_SUCCESS:
        case PASSWORD_RESET_CONFIRM_FAIL:
        case ACTIVATION_SUCCESS:
        case ACTIVATION_FAIL:
            return {
                ...state
            }
        default:
            return state
    }
}