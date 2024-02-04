import { useEffect } from "react";
import { checkAuthenticated, load_user } from "../../services/actions/auth";
import {useDispatch } from "react-redux";
import { AppDispatch } from "../../services/actions/auth";

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
  
    useEffect(() => {
      dispatch(checkAuthenticated());
      dispatch(load_user());
    }, [dispatch]);
  };
  