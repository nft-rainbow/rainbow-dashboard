import React, {useEffect, useState} from "react";
import { Button, Image, Popover, Space, Table, TablePaginationConfig, Tooltip } from "antd";
import {
	CheckCircleTwoTone, ClockCircleTwoTone, CloseCircleTwoTone,
	FileImageOutlined, FilterOutlined, InfoCircleOutlined, QuestionCircleTwoTone
} from "@ant-design/icons/lib";
import { NFT } from "@models/index";
import { formatDate, mapChainName, mapNFTType, scanAddressLink, scanNFTLink, scanTxLink, short } from "@utils/index";
// import { reMintNFT } from "@services/NFT";
import { getAppNfts, getAppNftsOfContract } from "@services/app";
import axios from "axios";

export function AppNFTs(props: { id: string; contract?: string, refreshTrigger: number; setRefreshTrigger: (v: number) => void, showRefresh?: boolean, pageLimit?: number }) {
	const { id, refreshTrigger, setRefreshTrigger, showRefresh, contract, pageLimit } = props;
	const [items, setItems] = useState<NFT[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<string[]>([]);

	const columns = [
		{
			title: '区块链',
			dataIndex: 'chain_type',
			render: mapChainName,
		},
		{
			title: 'ChainID',
			dataIndex: 'chain_id',
		},
		{
			title: '类型',
			dataIndex: 'contract_type',
			render: mapNFTType,
		},
		{
			title: '合约',
			dataIndex: 'contract',
			render: (text: string, record: NFT) => (
				<a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>
					{short(text)}
				</a>
			),
		},
		{
			title: '接受地址',
			dataIndex: 'mint_to',
			render: (text: string, record: NFT) => (
				<a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>
					{short(text)}
				</a>
			),
		},
		{
			title: 'TokenID',
			dataIndex: 'token_id',
			render: (text: string, record: NFT, index: number) => (
				<>
					<a target="_blank" rel="noreferrer" href={scanNFTLink(record.chain_type, record.chain_id, record.contract, record.token_id)}>
						{text}
					</a>
					{/* SJR: render the preview button */}
					<Tooltip title="预览">
						<Popover placement="right" content={<Image width={200} src={images[index]} />} trigger="click">
							<Button style={{border: 'none'}} icon={<FileImageOutlined/>} onClick={() => showNFTImage(record.token_uri, index)}/>
						</Popover>
					</Tooltip>
				</>
			),
		},
		{
			title: '铸造数量',
			dataIndex: 'amount',
		},
		{
			title: (
				<>
					<span>状态</span>{' '}
					<a href="https://docs.nftrainbow.xyz/api-reference/common-errors" target="_blank" rel="noreferrer">
						<InfoCircleOutlined />
					</a>
				</>
			),
			dataIndex: 'status',
			render: (status: number, record: NFT) => mapSimpleStatus(status, dealError(record.error)),
		},
		{
			title: '哈希',
			dataIndex: 'hash',
			render: (text: string, record: NFT) => (
				<a target="_blank" rel="noreferrer" href={scanTxLink(record.chain_type, record.chain_id, text)}>
					{short(text)}
				</a>
			),
		},
		{
			title: '创建时间',
			dataIndex: 'created_at',
			render: formatDate,
		},
		/* {
			title: '操作',
			dataIndex: 'id',
			render: (id: number, item: NFT) => {
				return item.status === 2 && item.error.match('NotEnoughCash') ? (
					<Button
						size="small"
						type="primary"
						onClick={async () => {
							await reMintNFT(id);
							setRefreshTrigger(refreshTrigger + 1);
						}}
					>
						重新铸造
					</Button>
				) : null;
			},
		}, */
	];

	useEffect(() => {
		setLoading(true);
		const query = contract ? getAppNftsOfContract(id as string, contract, page, pageLimit || 10) : getAppNfts(id as string, page,  pageLimit || 10);
		query.then((res) => {
            setTotal(res.count);
            setItems(res.items);
        })
        .finally(() => {
            setLoading(false);
        });
	}, [id, page, refreshTrigger, pageLimit, contract]);

	// SJR: click button to load one image
	const showNFTImage = async (metadataUri: string, index: number) => {
		if (images[index] != null) return;
        let temp: string[] = [];
        temp = temp.concat(images);
        let res = await axios.get(metadataUri);
        temp[index] = res.data.image;
        setImages(temp);
	};

	return (
		<>
			<Space className={"mb-8"}>
				{showRefresh && <Button type={"dashed"} onClick={() => setRefreshTrigger(refreshTrigger + 1)}>刷新</Button>}
				{contract && <Button type={"text"}><Tooltip title={`已按合约过滤 ${contract}`}><FilterOutlined /></Tooltip></Button> }
			</Space>
			<Table
				rowKey="id"
				dataSource={items}
				columns={columns}
				loading={loading}
				pagination={{
					total,
					current: page,
                    pageSize: pageLimit,
					showTotal: (total) => `共 ${total} 条`,
				}}
				onChange={(info: TablePaginationConfig) => {setPage(info.current as number); setImages([])}}
			/>
		</>
	);
}


/**
  mint_task.block_reason:  
  TX_BLOCK_REASON_DB_ERR:                  "failed get sponsor status from db",
  TX_BLOCK_REASON_SPONSORING:              "sponsoring",
  TX_BLOCK_REASON_IO_ERR:                  "io error",
  TX_BLOCK_REASON_NOT_ENOUGH_CASH:         "not enough cash",
  TX_BLOCK_REASON_FAILED_GET_SPONSOR_INFO: "failed get sponsor info",
  TX_BLOCK_REASON_SPONSOR_NOT_ENOUGH:      "sponsor not enough",
 */
export function mapSimpleStatus(status: number, error: string, block_reason: string) {
	switch (status) {
		case 0:
            const title = block_reason === 'not enough cash' ? `余额不足,请充值` : '待处理';
			return (
				<Tooltip title={title}>
					<ClockCircleTwoTone />
				</Tooltip>
			);
		case 1:
			return (
				<Tooltip title="成功">
					<CheckCircleTwoTone />
				</Tooltip>
			);
		case 2:
			return (
				<Tooltip title={error}>
					<CloseCircleTwoTone twoToneColor={'#e3422f'} />
				</Tooltip>
			);
		default:
			return (
				<Tooltip title="未知">
					<QuestionCircleTwoTone />
				</Tooltip>
			);
	}
}

export function dealError(message: string) {
	if (message.match('NotEnoughCash') || message.match('discarded due to out of balance')) {
		return '合约代付余额不足';
	}
	if (message.match('AccessControl')) {
		return '操作权限错误';
	}
	if (message.match('ERC721: token already minted')) {
		return '该 TokenId 已经被使用';
	}
	if (message.match('NFT: URI different with previous')) {
		return '1155合约，同 TokenId 的 URI 不一致';
	}
	return message;
}