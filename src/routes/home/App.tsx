import React from 'react';
import { Link, Navigate } from "react-router-dom";
import { AuthStatus } from '../../Auth';

function App() {
  // NOTE: currently we do not have home page
  if (true) {
    return <Navigate to="/panels" />;
  }

  return (
    <div className="App">
      <h1>App</h1>
      <nav
        style={{
          borderBottom: "solid 1px",
          paddingBottom: "1rem",
        }}
      >
        <Link to="/login">Login</Link> | {" "}
        <Link to="/register">Register</Link> | {" "}
        <Link to="/panels">Dashboard</Link> | {" "}
        <Link to="/panels/user">User</Link>
      </nav>
      <AuthStatus />
    </div>
  );
}

export default App;
