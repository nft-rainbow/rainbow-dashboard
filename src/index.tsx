import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  BrowserRouter,
  Routes,
  Route,
  // Navigate,
} from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';
import { AuthProvider, RequireAuth } from './Auth';

import Home from './routes/home/App';
import Login from './routes/login';
import Register from './routes/register';
import DashboardLayout from './routes/layout';
import Panel from './routes/panel';
import User from './routes/users/user';
import UserBalance from './routes/users/userBalance';
import Company from './routes/company';
import App from './routes/apps';
import AppDetail from './routes/apps/detail';
// import NotFound from './routes/404';
import Contracts from './routes/contracts';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/panels" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<Panel />} />
            <Route path="user" element={<User />} />
            <Route path="userBalance" element={<UserBalance />} />
            <Route path="company" element={<Company />} />
            <Route path="apps" element={<App />} />
            <Route path="apps/:id" element={<AppDetail />} />
            <Route path="contracts" element={<Contracts />} />
          </Route>
          {/* <Route path="*" element={<Navigate to="/panels" />} /> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
