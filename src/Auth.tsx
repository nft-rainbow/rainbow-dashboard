import { createContext, useState, ReactNode, useContext } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { userLogin, userLogout, LoginMeta } from "./services/user";
import { APIResponse } from "./services/";

interface AuthContextType {
  user: UserInfo | null;
  signin: (user: LoginMeta, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

interface UserInfo {
  id?: number;
  email: string;
  jwtToken: string;
  tokenExpire: Date;
}

let AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  let [user, setUser] = useState<UserInfo | null>(null);

  let signin = (newUser: LoginMeta, callback: VoidFunction) => {
    return userLogin(newUser).then((result: APIResponse) => {
      if (result.code === 0) {
        const user = {
          email: newUser.email,
          // @ts-ignore
          jwtToken: result.data.token,
          tokenExpire: new Date(result.data.expire),
        };
        setUser(user);
        // TODO write to local storage
        callback();
      } else {
        alert(result.message);
      }
    });
  };

  let signout = (callback: VoidFunction) => {
    return userLogout().then(() => {
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
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}