import React from 'react';
import { Link } from "react-router-dom";
import { AuthStatus } from '../../Auth';

function App() {
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
        <Link to="/dashboard">Dashboard</Link> | {" "}
        <Link to="/dashboard/user">User</Link>
      </nav>
      <AuthStatus />
    </div>
  );
}

export default App;
