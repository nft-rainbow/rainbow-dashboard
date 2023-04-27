import React, { useState } from "react";
import { Card, Space, Tabs, TabsProps, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { Contract } from "@models/index";
import { AppNFTs } from "@pages/apps/MintTasks";
import { MintSingle } from "./mintSingle";
import { ContractInfo } from "../contracts/contractInfo";
import MintTable from "./mintTable";
import { MintByMetadataUri } from "./mintByMetadataUri";
import { MintSingleByMetadataUri } from './MingSingleMetadataUril';

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
			key: '11',	
            label: <span>
                    单个铸造(元数据URI) &nbsp;
                    <Tooltip title="若 Metadata 已经事先创建好，可选择此铸造方式">
                        <QuestionCircleOutlined />
                    </Tooltip>
                </span>,
			children: <MintSingleByMetadataUri appId={contract.app_id || ''} chainId={contract.chain_id} contract={contract} />,
		},
		{
			key: '20',
            label: `批量铸造`,
			children: <MintTable appId={contract.app_id || ''} chainId={contract.chain_id} controlForm={false} contract={contract} />,
		},
		{
			key: '30',
            label: `高级模式`,
			children: <MintTable appId={contract.app_id || ''} chainId={contract.chain_id} controlForm={true} contract={contract} />,
		},
		{
			key: '40',
            label: `按序铸造`,
			children: <MintByMetadataUri appId={contract.app_id || ''} chainId={contract.chain_id} contract={contract} />,
		},
		{
			key: '50',
            label: `铸造历史`,
			children: <AppNFTs id={contract.app_id || ""} refreshTrigger={refreshNftList} setRefreshTrigger={setRefreshNftList} contract={contract.address} showRefresh={true} />,
		},
	];

	return (
		<Space direction={'vertical'} style={{flexGrow:1, border: "0px solid green",}}>
			<ContractInfo id={paramId} reportContract={setContract}/>
			<Card bodyStyle={{paddingTop: '8px'}}>
				<Tabs defaultActiveKey="10" items={items} />
			</Card>
		</Space>
	)
}