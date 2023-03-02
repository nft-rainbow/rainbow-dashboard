import {ContractInfo} from "@pages/contracts/contractInfo";
import React, {useState} from "react";
import {Contract} from "@models/index";
import {useParams} from "react-router-dom";
import {PlanFields} from "@pages/plan/PlanFields";
import {Form, Space, Tabs, TabsProps} from "antd";
import {PlanWhitelist} from "@pages/plan/PlanWhitelist";
import MintTable from "@pages/mint/mintTable";

export function PlanFrame() {
	const { id: contractId = ''} = useParams();
	const [contract,setContract] = useState({app_id: ''} as Contract);
	const [form] = Form.useForm()
	const items: TabsProps['items'] = [
		{key: '10',			label: `发行设置`,
			children: <PlanFields form={form}/>,
		},{key: '20',			label: `元数据`,
			children: <MintTable contract={contract} chainId={contract.chain_id} controlForm={form}/>,
		},{key: '30',			label: `白名单`,
			children: <PlanWhitelist/>,
		},{key: '40',			label: `空投`,
			children: `此处空投盲盒，空投具体NFT请前往铸造页面。`,
		},
	]
	return (
		<Space direction={"vertical"} style={{flexGrow:1}}>
			<ContractInfo id={contractId} reportContract={setContract}/>
			<Tabs items={items} defaultActiveKey="10"/>
		</Space>
	)
}