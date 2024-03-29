import { Route } from 'react-router-dom';

import Apps from './Apps';
import BuyService from './BuyService';
import AppDetail from './AppDetail';
import ServiceDetail from './ServiceDetail';

export default function Web3ServiceRoute() {
    return <Route path='web3Service'>
        <Route path='' element={<Apps />} />
        <Route path=':id' element={<AppDetail />} />
        <Route path='buy' element={<BuyService />} />
        <Route path='service' element={<AppDetail />} />
        <Route path='service/:service_type' element={<ServiceDetail />} />
    </Route>
}