import {Card, Layout, Space, Tabs, TabsProps} from "antd";
import {Content} from "antd/es/layout/layout";
import React, {useState} from "react";
import MintTable from "./mintTable";
import {MintSingle} from "./mintSingle";
import {ContractInfo} from "../contracts/contractInfo";
import {useParams} from "react-router-dom";
import {Contract} from "../../models";
import {AppNFTs} from "@pages/apps/MintTasks";

export default function MintFrame() {
	// prop:{contract:string, name:string, symbol:string}
	const [refreshNftList, setRefreshNftList] = useState(0);
	const [contract,setContract] = useState({app_id: ''} as Contract);
	const { id: paramId = ''} = useParams();
	const items: TabsProps['items'] = [
		{
			key: '10',			label: `单个铸造`,
			children: <MintSingle appId={contract.app_id} contract={contract}/>,
		},
		{
			key: '20',			label: `批量铸造`,
			children: <MintTable appId={contract.app_id||''} chainId={contract.chain_id} controlForm={false} contract={contract}/>,
		},
		{
			key: '30',			label: `高级模式`,
			children: <MintTable appId={contract.app_id||''} chainId={contract.chain_id} controlForm={true} contract={contract}/>,
		},
		{
			key: '40',			label: `铸造历史`,
			children: <AppNFTs id={contract.app_id} refreshTrigger={refreshNftList} setRefreshTrigger={setRefreshNftList}
			                   showRefresh={true}
				/>,
		},
		// {
		// 	key: '50',			label: `使用帮助`,
		// 	children: `帮助文案`,
		// }
	];
	if (!contract.app_id) {
		// return "载入中..."
	}
	return (
		<Space direction={'vertical'} style={{flexGrow:1, border: "0px solid green",}}>
			<ContractInfo id={paramId} reportContract={setContract}/>
			<Card bodyStyle={{paddingTop:'8px'}}>
				<Tabs defaultActiveKey="10" items={items}/>
			</Card>
		</Space>
	)
}