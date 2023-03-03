import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
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
import ContractSponsor from '@pages/contracts/sponsor';
import ContractDeployment from '@pages/contracts/new';
import Poaps from '@pages/activities';
import Asset from '@pages/activities/manageAssets';
import Building from '@pages/activities/Building';
import MintFrame from "@pages/mint/mintFrame";
import Metadata from "../routes/metadata";
import MetaTable from "../routes/metadata";
import {PlanFrame} from "@pages/plan/PlanFrame";
import {PlanList} from "@pages/plan/PlanList";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="panels"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Panel />} />
            <Route path="user" element={<User />} />
            <Route path="userBalance" element={<UserBalance />} />
            <Route path="company" element={<Company />} />
            <Route path="apps" element={<App />} />
            <Route path="apps/:id" element={<AppDetail />} />
            <Route path="mint/:id" element={<MintFrame />} />
            <Route path="plan/:id" element={<PlanFrame />} />
            <Route path="plan/list" element={<PlanList />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="metadata" element={<MetaTable />} />
            <Route path="contracts/sponsor" element={<ContractSponsor />} />
            <Route path="contracts/deploy" element={<ContractDeployment />} />
            <Route path="poaps" element={<Poaps />} />
            <Route path="poaps/asset/:activityId" element={<Asset />} />
            <Route path="poaps/building/:activityId" element={<Building />} />
          </Route>
          <Route path="/" element={<Navigate to="panels" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
