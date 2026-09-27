import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../../store";
import {
  getProfileThunk,
  initializeAuth,
} from "../../../store/authSlice";
import { socketService } from "../../../services/socketService";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({
  children,
}: AuthInitializerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      dispatch(getProfileThunk());
    } else {
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      socketService.joinUserRoom(user._id, user.role);
    }
  }, [user]);

  return children;
};
