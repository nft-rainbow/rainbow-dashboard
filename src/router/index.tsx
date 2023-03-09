import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { RequireAuth } from './Auth';
import Login from '@pages/login';
import Register from '@pages/register';
import DashboardLayout from '@pages/layout';
import Panel from '@pages/panel';
import User from '@pages/users/user';
import UserBalance from '@pages/users/userBalance';
import UserMintCountByMonth from '@pages/users/userMintsByMonth';
import Company from '@pages/company';
import App from '@pages/apps';
import AppDetail from '@pages/apps/detail';
import Contracts from '@pages/contracts';
import ContractSponsor from '@pages/contracts/sponsor';
import ContractDeployment from '@pages/contracts/new';
import Poaps from '@pages/activities';
import Asset from '@pages/activities/manageAssets';
import Blind from '@pages/activities/manageAssetsBlind';
import Building from '@pages/activities/Building';
import Metadata from '@pages/metadata';
import EmptyPage from '@pages/emptyPage';
import Bots from '@pages/bots';
import MintFrame from "@pages/mint/mintFrame";
// import {PlanFrame} from "@pages/plan/PlanFrame";
// import {PlanList} from "@pages/plan/PlanList";

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
            <Route path="mintCountByMonth" element={<UserMintCountByMonth />} />
            <Route path="company" element={<Company />} />
            <Route path="apps" element={<App />} />
            <Route path="apps/:id" element={<AppDetail />} />
            <Route path="mint/:id" element={<MintFrame />} />
            {/* <Route path="plan/:id" element={<PlanFrame />} />
            <Route path="plan/list" element={<PlanList />} /> */}
            <Route path="contracts" element={<Contracts />} />
            <Route path="contracts/sponsor" element={<ContractSponsor />} />
            <Route path="contracts/deploy" element={<ContractDeployment />} />
            <Route path="poaps" element={<Poaps />} />
            <Route path="poaps/asset/single/:activityId" element={<Asset />} />
            <Route path="poaps/asset/blind/:activityId" element={<Blind />} />
            <Route path="poaps/building/:activityId" element={<Building />} />
            <Route path="metadata" element={<Metadata />} />
            <Route path="socialBot" element={<Bots />} />
            <Route path="empty" element={<EmptyPage />} />
          </Route>
          <Route path="/" element={<Navigate to="panels" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
