import {Layout} from "antd";
import {Content} from "antd/es/layout/layout";
import React from "react";

export default function MintFrame() {
	// prop:{contract:string, name:string, symbol:string}
	return (
		<>
			<Layout>
				<Content style={{alignContent: 'middle'}}>程序化接口（API）已上线，请查阅相关文档。UI即将上线，敬请期待！</Content>
			</Layout>
		</>
	)
}