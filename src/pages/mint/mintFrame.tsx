import {Card, Layout, Space, Tabs, TabsProps} from "antd";
import {Content} from "antd/es/layout/layout";
import React, {useState} from "react";
import MintTable from "./mintTable";
import {MintSingle} from "./mintSingle";
import {ContractInfo} from "../contracts/contractInfo";
import {useParams} from "react-router-dom";
import {Contract} from "../../models";

export default function MintFrame() {
	// prop:{contract:string, name:string, symbol:string}
	const [contract,setContract] = useState({app_id: ''} as Contract);
	const { id: paramId = ''} = useParams();
	const items: TabsProps['items'] = [
		{
			key: '10',			label: `单个铸造`,
			children: <MintSingle appId={contract.app_id} contract={contract}/>,
		},
		{
			key: '20',			label: `批量铸造`,
			children: <MintTable appId={contract.app_id||''} chainId={contract.chain_id} controlForm={false}/>,
		},
		{
			key: '30',			label: `高级模式`,
			children: <MintTable appId={contract.app_id||''} chainId={contract.chain_id} controlForm={true}/>,
		},
		{
			key: '40',			label: `铸造历史`,
			children: `铸造历史`,
		},
		{
			key: '50',			label: `使用帮助`,
			children: `帮助文案`,
		}
	];
	return (
		<Space direction={'vertical'}>
			<ContractInfo id={paramId} reportContract={setContract}/>
			<Card bodyStyle={{paddingTop:'8px'}}>
				<Tabs defaultActiveKey="10" items={items}/>
			</Card>
		</Space>
	)
}