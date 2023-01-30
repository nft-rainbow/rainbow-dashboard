import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter
} from "react-router-dom";
import { RequireAuth } from './Auth';
import Login from '@pages/login';
import Register from '@pages/register';
import DashboardLayout from '@pages/layout';
import Panel from '@pages/panel';
import User from '@pages/users/user';
import UserBalance from '@pages/users/userBalance';
import Company from '@pages/company';
import App from '@pages/apps';
import AppDetail from '@pages/apps/detail';
import Contracts from '@pages/contracts';
import ContractSponsor from '@pages/contracts/sponsor'
import ContractDeployment from '@pages/contracts/new';
import Poaps from '@pages/poaps';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" >
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="panels" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<Panel />} />
            <Route path="user" element={<User />} />
            <Route path="userBalance" element={<UserBalance />} />
            <Route path="company" element={<Company />} />
            <Route path="apps" element={<App />} />
            <Route path="apps/:id" element={<AppDetail />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="contracts/sponsor" element={<ContractSponsor />} />
            <Route path="contracts/deploy" element={<ContractDeployment />} />
            <Route path="poaps" element={<Poaps />} />
          </Route>
          <Route path="/" element={<Navigate to="panels" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>

  )
}

export default AppRouter;