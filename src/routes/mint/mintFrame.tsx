import {Layout, Tabs, TabsProps} from "antd";
import {Content} from "antd/es/layout/layout";
import React from "react";
import Test from "./test";

export default function MintFrame() {
	// prop:{contract:string, name:string, symbol:string}
	const items: TabsProps['items'] = [
		{
			key: '1',
			label: `铸造1个`,
			children: `?`,
		},
		{
			key: '20',
			label: `铸造多个`,
			children: <Test/>,
		},
		{
			key: '30',
			label: `导入`,
			children: `导入`,
		}
	];
	return (
		<>
			<Tabs defaultActiveKey="20" items={items}/>
		</>
	)
}