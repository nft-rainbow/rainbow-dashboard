import {Layout} from "antd";
import {Content} from "antd/es/layout/layout";
import React from "react";

export default function MintFrame() {
	// prop:{contract:string, name:string, symbol:string}
	return (
		<>
			<Layout>
				<Content style={{alignContent: 'middle'}}>即将上线，敬请期待！</Content>
			</Layout>
		</>
	)
}