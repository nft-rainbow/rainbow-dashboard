import React, {useEffect, useState} from "react";
import {getContractInfo} from "@services/app";
import {Contract} from "../../models";
import {Card, Col, Row, Typography} from "antd";
import {mapChainAndNetworkName, mapSimpleStatus} from "../../utils";

export function ContractInfo(props: { id: string, reportContract:(c:Contract)=>void }) {
	const { Text, Link } = Typography;
	const [contract, setContract] = useState({} as Contract);
	useEffect(() => {
		getContractInfo(props.id).then(res => {
			props.reportContract(res.items[0]);
			setContract(res.items[0])
		})
	}, [props.id])
	return (
		<>
			<Card title={"合约信息"} style={{flexGrow:1, border: "1px dot blue"}}>
				<Row gutter={12}>
					<Col><Text type="secondary">合约名称</Text></Col><Col>{contract.name}</Col>
					<Col><Text type="secondary">通证标识</Text></Col><Col>{contract.symbol}</Col>
					<Col><Text type="secondary">合约地址</Text></Col><Col>{contract.address || '无'}</Col>
					<Col><Text type="secondary">状态</Text></Col><Col>{mapSimpleStatus(contract.status || 0)}</Col>
					<Col><Text type="secondary">区块链</Text></Col><Col>{mapChainAndNetworkName(contract.chain_type, contract.chain_id)}</Col>
					{contract.error &&
					<Col>
						<Text type="danger">{contract.error}</Text>
					</Col>
					}
				</Row>
			</Card>

			{/*Contract {JSON.stringify(contract)}*/}
		</>
	)
}