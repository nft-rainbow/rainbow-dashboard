import React, { useState, useEffect } from 'react';
import { Alert, Col, Row, Statistic, Card, Table, Typography } from 'antd';
import { 
  userStatistics, 
  UserStatistics,
  userProfile,
  userBalanceRuntime,
} from '@services/user';
import { User } from '@models/index';
const { Title, Paragraph, Text } = Typography;

export default function Panel() {
    const defaultStatistics = {
        nft_count: 0,
        contract_count: 0,
        app_count: 0,
        request_count: 0,
    };
    const defaultFreeQuota = {
        free_deploy_quota: 0,
        free_mint_quota: 0,
        free_other_api_quota: 0,
    };
    const [statistics, setStatistics] = useState<UserStatistics>(defaultStatistics);
    const [user, setUser] = useState<User|null>(null);
    const [freeQuota, setFreeQuota] = useState<any>(defaultFreeQuota);

    const columns = [{
        title: '名称',
        dataIndex: 'name',
    },{
        title: '额度',
        dataIndex: 'amount',
    }];

    const items = [{
        id: 1,
        name: "合约部署",
        amount: freeQuota.free_deploy_quota,
    }, {
        id: 2,
        name: "藏品铸造",
        amount: freeQuota.free_mint_quota,
    }, {
        id: 3,
        name: "接口调用",
        amount: freeQuota.free_other_api_quota,
    }];

    useEffect(() => {
        userStatistics().then(setStatistics);
    }, []);

    useEffect(() => {
        userProfile().then(setUser);
    }, []);

    useEffect(() => {
        userBalanceRuntime().then(setFreeQuota);
    }, []);

    return (<div style={{flexGrow: 1}}>
        {user && user.status === 0 && user.id_no.length === 0 ? <Alert message="新用户请先至右上角个人中心完善信息" type="info" showIcon /> : null}
        {user && user.status === 0 && user.id_no.length > 0 ? <Alert message="请耐心等待审核通过，我们会在2-3天完成审核。" type="info" showIcon /> : null}
        <Row gutter={16} style={{margin: '16px 0'}}>
            <Col span={6}>
                <Card>
                    <Statistic title="数字藏品" value={statistics.nft_count} />
                </Card>
            </Col>
            <Col span={6}>
                <Card>
                    <Statistic title="合约" value={statistics.contract_count}/>
                </Card>
            </Col>
            <Col span={6}>
                <Card>
                    <Statistic title="项目" value={statistics.app_count} />
                </Card>
            </Col>
            <Col span={6}>
                <Card>
                    <Statistic title="当月接口用量" value={statistics.request_count} />
                </Card>
            </Col>
        </Row>
        <Row gutter={16} style={{margin: '16px 0'}}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <p>当月剩余免费次数</p>
                    <Table
                        rowKey='id'
                        dataSource={items}
                        columns={columns}
                        pagination={false}
                    />
                </Card>
            </Col>
        </Row>
        <Row style={{margin: '16px 0', padding: '16px 16px'}}>
            <Col>
                <Typography>
                    <Title level={4}>快速上手</Title>
                    <Paragraph>
                        <ul>
                            <li>1. 新用户请先至个人中心（右上角）进行 KYC 信息填写，待管理员审核通过后即可使用。</li>
                            <li>2. KYC 通过后请先创建项目，创建项目后即可创建合约。</li>
                            <li>3. 在合约页面可进行代付设置，及<Text code>藏品铸造</Text></li>
                        </ul>
                    </Paragraph>
                    <Title level={4}>注意事项</Title>
                    <Paragraph>
                        <ul>
                            <li>铸造藏品前请确保合约<Text code>正确</Text>且设置了<Text code>足够</Text>的代付赞助。否则藏品铸造会失败。</li>
                            <li>建议为合约打开代付自动补充功能，且保证账户有足够的余额.</li>
                        </ul>
                    </Paragraph>
                    <Title level={4}>常见问题</Title>
                    <Title level={5}>为什么的我的 NFT 铸造失败了?</Title>
                    <Paragraph>
                        NFT 铸造失败的常见原因有以下几种：
                        <ul>
                            <li>1. 合约代付不足</li>
                            <li>2. ERC721 合约同 TokenId 重复铸造</li>
                            <li>3. AccessControl 铸造权限问题</li>
                        </ul>
                        关于铸造失败的详细原因请查看 <a href="https://docs.nftrainbow.xyz/api-reference/common-errors" target={"_blank"} rel={"noreferrer"}>Rainbow 文档</a>
                    </Paragraph>
                </Typography>
            </Col>
        </Row>
    </div>
  );
}
