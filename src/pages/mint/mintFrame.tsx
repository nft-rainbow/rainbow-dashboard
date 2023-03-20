import React, { useState } from "react";
import { Card, Space, Tabs, TabsProps } from "antd";
import { useParams } from "react-router-dom";
import { Contract } from "@models/index";
import { AppNFTs } from "@pages/apps/MintTasks";
import MintTable from "./mintTable";
import { MintSingle } from "./mintSingle";
import { ContractInfo } from "../contracts/contractInfo";

export default function MintFrame() {
	const [refreshNftList, setRefreshNftList] = useState(0);
	const [contract, setContract] = useState({app_id: ''} as Contract);
	const { id: paramId = '' } = useParams();
	const items: TabsProps['items'] = [
		{
			key: '10',	
            label: `单个铸造`,
			children: <MintSingle appId={contract.app_id} contract={contract} />,
		},
		{
			key: '20',
            label: `批量铸造`,
			children: <MintTable appId={contract.app_id||''} chainId={contract.chain_id} controlForm={false} contract={contract} />,
		},
		{
			key: '30',
            label: `高级模式`,
			children: <MintTable appId={contract.app_id||''} chainId={contract.chain_id} controlForm={true} contract={contract} />,
		},
		{
			key: '40',			
            label: `铸造历史`,
			children: <AppNFTs id={contract.app_id || ""} refreshTrigger={refreshNftList} setRefreshTrigger={setRefreshNftList} contract={contract.address} showRefresh={true} />,
		},
	];
	/* if (!contract.app_id) {
		return <span>"载入中..."</span>
	} */
	return (
		<Space direction={'vertical'} style={{flexGrow:1, border: "0px solid green",}}>
			<ContractInfo id={paramId} reportContract={setContract}/>
			<Card bodyStyle={{paddingTop:'8px'}}>
				<Tabs defaultActiveKey="10" items={items}/>
			</Card>
		</Space>
	)
}