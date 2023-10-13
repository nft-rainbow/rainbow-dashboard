import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { RequireAuth } from './Auth';
import Login from '@pages/userNotLogin/login';
import Register from '@pages/userNotLogin/register';
import ForgotPwd from '@pages/userNotLogin/forgotPwd';
import ResetPwd from '@pages/userNotLogin/resetPwd';
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
import MintFrame from "@pages/mint";
import AutoSponsors from "@pages/contracts/autoSponsorContracts";
import GaslessPoap from '@pages/activities/createPoap';
import ChargeBalance from '@pages/users/chargeBalance';
import Whitelist from '@pages/whitelist';
import WhitelistEditor from '@pages/whitelist/create';
import WhitelistDetail from '@pages/whitelist/detail';
import EasyMint from '@pages/mint/easyMint';
import Invoice from '@pages/invoice/index';
import InvoiceInfo from '@pages/invoice/info';
import InvoiceNew from '@pages/invoice/new';
import Web3ServiceRoute from '@pages/web3Services';

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgotPwd" element={<ForgotPwd />} />
                    <Route path="resetPwd" element={<ResetPwd />} />
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
                        <Route path="chargeBalance" element={<ChargeBalance />} />
                        <Route path="mintCountByMonth" element={<UserMintCountByMonth />} />
                        <Route path="company" element={<Company />} />
                        <Route path="invoice">
                            <Route index element={<Invoice />} />
                            <Route path="info" element={<InvoiceInfo />} />
                            <Route path="new" element={<InvoiceNew />} />
                        </Route>
                        <Route path="apps">
                            <Route index element={<App />} />
                            <Route path=":id" element={<AppDetail />} />
                        </Route>
                        <Route path="mint">
                            <Route path='easyMint' element={<EasyMint />} />
                            <Route path=':id' element={<MintFrame />} />
                        </Route>
                        <Route path='contracts'>
                            <Route path="" element={<Contracts />} />
                            <Route path="sponsor" element={<ContractSponsor />} />
                            <Route path="autoSponsors" element={<AutoSponsors />} />
                            <Route path="deploy" element={<ContractDeployment />} />
                        </Route>
                        <Route path='poaps'>
                            <Route path="" element={<Poaps />} />
                            <Route path=":appId/createGasless" element={<GaslessPoap />} />
                            <Route path="createGaslessInDefaultProject" element={<GaslessPoap />} />
                            <Route path=":activityId/updateGasless" element={<GaslessPoap />} />
                            <Route path="asset/single/:activityId" element={<Asset />} />
                            <Route path="asset/blind/:activityId" element={<Blind />} />
                            <Route path="building/:activityId" element={<Building />} />
                        </Route>
                        <Route path="metadata" element={<Metadata />} />
                        <Route path="socialBot" element={<Bots />} />
                        <Route path='whitelist'>
                            <Route index element={<Whitelist />} />
                            <Route path='create' element={<WhitelistEditor />} />
                            <Route path='detail/:id' element={<WhitelistDetail />} />
                        </Route>
                        {Web3ServiceRoute()}
                        <Route path="empty" element={<EmptyPage />} />
                    </Route>
                    <Route index path="/" element={<Navigate to="panels" />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
