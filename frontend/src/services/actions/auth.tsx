import axios, { AxiosError } from "axios";
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
  LOGOUT,
} from "./types";

import { ThunkAction } from "redux-thunk";
import { RootState } from "../reducers";
import { ThunkDispatch } from "redux-thunk";

// Type guard to determine if the error is an AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

type ActionType =
  | { type: typeof LOGIN_SUCCESS; payload: { access: string; refresh: string } }
  | { type: typeof LOGIN_FAIL }
  | { type: typeof USER_LOADED_SUCCESS; payload: "" }
  | { type: typeof USER_LOADED_FAIL }
  | { type: typeof AUTHENTICATED_SUCCESS }
  | { type: typeof AUTHENTICATED_FAIL }
  | { type: typeof PASSWORD_RESET_SUCCESS }
  | { type: typeof PASSWORD_RESET_FAIL }
  | { type: typeof PASSWORD_RESET_CONFIRM_SUCCESS }
  | { type: typeof PASSWORD_RESET_CONFIRM_FAIL }
  | { type: typeof SIGNUP_SUCCESS; payload: "" }
  | { type: typeof SIGNUP_FAIL }
  | { type: typeof ACTIVATION_SUCCESS; payload: "" }
  | { type: typeof ACTIVATION_FAIL }
  | {
      type: typeof GOOGLE_AUTH_SUCCESS;
      payload: { access: string; refresh: string };
    }
  | { type: typeof GOOGLE_AUTH_FAIL }
  | {
      type: typeof FACEBOOK_AUTH_SUCCESS;
      payload: { access: string; refresh: string };
    }
  | { type: typeof FACEBOOK_AUTH_FAIL }
  | { type: typeof LOGOUT };

import { useDispatch as useReduxDispatch } from "react-redux";

export type ThunkType = ThunkAction<void, RootState, unknown, ActionType>;

export type AppDispatch = ThunkDispatch<RootState, unknown, ActionType>;

export const useDispatch = () => useReduxDispatch<AppDispatch>();

export const checkAuthenticated = () => async (dispatch: AppDispatch) => {
  if (localStorage.getItem("access")) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const body = JSON.stringify({ token: localStorage.getItem("access") });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    console.log(baseUrl);
    const url = `${baseUrl}/auth/jwt/verify/`;
    try {
      const res = await axios.post(url, body, config);

      if (res.data.code !== "token_not_valid") {
        dispatch({
          type: AUTHENTICATED_SUCCESS,
        });
      } else {
        dispatch({
          type: AUTHENTICATED_FAIL,
        });
      }
    } catch (err) {
      dispatch({
        type: AUTHENTICATED_FAIL,
      });
    }
  } else {
    dispatch({
      type: AUTHENTICATED_FAIL,
    });
  }
};
interface ErrorResponse {
  detail?: string;
}
export const load_user = (): ThunkType => async (dispatch: AppDispatch) => {
  if (localStorage.getItem("access")) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("access")}`,
        Accept: "application/json",
      },
    };
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    console.log(baseUrl);
    const url = `${baseUrl}/auth/users/me/`;
    try {
      const res = await axios.get(url, config);

      dispatch({
        type: USER_LOADED_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: USER_LOADED_FAIL,
      });
    }
  } else {
    dispatch({
      type: USER_LOADED_FAIL,
    });
  }
};

export const login =
  (email: string, password: string): ThunkType =>
  async (dispatch: AppDispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({ email, password });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    console.log(baseUrl);
    const url = `${baseUrl}/auth/jwt/create/`;
    try {
      const res = await axios.post(url, body, config);

      // Clear all session data from previous unauthenticated session
      sessionStorage.clear();

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data,
      });

      dispatch(load_user());
    } catch (err) {
      let errorMessage = "Login failed due to server error"; // Default error message
      if (isAxiosError(err) && err.response) {
        const errorData = err.response.data as ErrorResponse;
        errorMessage = errorData.detail || errorMessage;
      }

      dispatch({
        type: LOGIN_FAIL,
        payload: errorMessage,
      });
    }
  };

export const logout = () => async (dispatch: AppDispatch) => {
  // Clear all session data on logout for privacy
  sessionStorage.clear();

  dispatch({
    type: LOGOUT,
  });
};

export const reset_password =
  (email: string): ThunkType =>
  async (dispatch: AppDispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    console.log("yes");
    const body = JSON.stringify({ email });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = `${baseUrl}/auth/users/reset_password/`;
    try {
      await axios.post(url, body, config);

      dispatch({
        type: PASSWORD_RESET_SUCCESS,
      });
    } catch (err) {
      dispatch({
        type: PASSWORD_RESET_FAIL,
      });
    }
  };

export const reset_password_confirm =
  (
    uid: string,
    token: string,
    new_password: string,
    re_new_password: string
  ): ThunkType =>
  async (dispatch: AppDispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({ uid, token, new_password, re_new_password });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = `${baseUrl}/auth/users/reset_password_confirm/`;
    try {
      const response = await axios.post(url, body, config);
      dispatch({
        type: PASSWORD_RESET_CONFIRM_SUCCESS,
      });
      console.log(response);
    } catch (err) {
      dispatch({
        type: PASSWORD_RESET_CONFIRM_FAIL,
      });
    }
  };

// export const signup =
//   (first_name, last_name, email, password, re_password) =>
//   async (dispatch: Dispatch<ActionType>) => {
//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     const body = JSON.stringify({
//       first_name,
//       last_name,
//       email,
//       password,
//       re_password,
//     });

//     try {
//       const res = await axios.post(
//         `${process.env.REACT_APP_API_URL}/auth/users/`,
//         body,
//         config
//       );

//       dispatch({
//         type: SIGNUP_SUCCESS,
//         payload: res.data,
//       });
//     } catch (err) {
//       dispatch({
//         type: SIGNUP_FAIL,
//       });
//     }
//   };

// export const verify =
//   (uid, token) => async (dispatch: Dispatch<ActionType>) => {
//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     const body = JSON.stringify({ uid, token });

//     try {
//       await axios.post(
//         `${process.env.REACT_APP_API_URL}/auth/users/activation/`,
//         body,
//         config
//       );

//       dispatch({
//         type: ACTIVATION_SUCCESS,
//       });
//     } catch (err) {
//       dispatch({
//         type: ACTIVATION_FAIL,
//       });
//     }
//   };
