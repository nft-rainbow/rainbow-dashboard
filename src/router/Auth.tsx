import { createContext, useState, ReactNode, useContext } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { userLogin, userLogout, LoginMeta } from "@services/user";
import { 
  UserInfo,
  USER_LOCALSTORAGE_KEY,
  ErrorCallback,
  tryToGetLocalStorageUser
} from "@services/index"

interface AuthContextType {
  user: UserInfo | null;
  signin: (user: LoginMeta, callback: ErrorCallback) => void;
  signout: (callback: VoidFunction) => void;
}

let AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  let [user, setUser] = useState<UserInfo | null>(tryToGetLocalStorageUser());
  
  let signin = (newUser: LoginMeta, callback: ErrorCallback) => {
    return userLogin(newUser).then((result: object) => {      
      const user = {
        email: newUser.email,
        // @ts-ignore
        jwtToken: result.token,
        // @ts-ignore
        tokenExpire: new Date(result.expire),
      };
      localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(user));
      setUser(user);
      callback(null);
    }).catch((err) => {
      callback(err);
    });
  };

  let signout = (callback: VoidFunction) => {
    return userLogout().then(() => {
      localStorage.removeItem(USER_LOCALSTORAGE_KEY);
      setUser(null);
      callback();
    });
  };

  let value = { user, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthStatus() {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <p>
      Welcome {auth.user.email}!{" "}
      <button
        onClick={() => {
          auth.signout(() => navigate("/"));
        }}
      >
        Sign out
      </button>
    </p>
  );
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
