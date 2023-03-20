import {ContractInfo} from "@pages/contracts/contractInfo";
import React, {useEffect, useState} from "react";
import {Contract} from "@models/index";
import {useParams} from "react-router-dom";
import {PlanFields} from "@pages/plan/PlanFields";
import {Form, Space, Tabs, TabsProps} from "antd";
import {PlanWhitelist} from "@pages/plan/PlanWhitelist";
import MintTable from "@pages/mint/mintTable";
import {get} from "@services/index";

export function PlanFrame() {
	const { id: planId = ''} = useParams();
	// const { contractId: contractId = ''} = useParams();
	const [contract,setContract] = useState({app_id: ''} as Contract);
	const [plan,setPlan] = useState({} as any);
	const [form] = Form.useForm()
	useEffect(()=>{
		get(`/dashboard/plan/${planId}`).then(res=>{
			setPlan(res || {})
		})
	}, [planId])
	if (!plan.app_id) {
		return <span>"Loading..."</span>;
	}
	const items: TabsProps['items'] = [
		{key: '10',			label: `发行设置`,
			children: <PlanFields form={form} plan={plan}/>,
		},{key: '20',			label: `元数据`,
			children: <MintTable appId={plan.app_id} contract={contract} chainId={contract.chain_id} controlForm={form}/>,
		},{key: '30',			label: `白名单`,
			children: <PlanWhitelist/>,
		},{key: '40',			label: `空投`,
			children: `此处空投盲盒，空投具体NFT请前往铸造页面。`,
		},
	];
	return (
		<Space direction={"vertical"} style={{flexGrow:1}}>
			<ContractInfo id={plan.contract_id} reportContract={setContract}/>
			<Tabs items={items} defaultActiveKey="10"/>
		</Space>
	)
}