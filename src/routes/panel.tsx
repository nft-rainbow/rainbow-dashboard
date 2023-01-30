import React, { useState, useEffect } from 'react';
import { Alert, Col, Row, Statistic, Card, Table } from 'antd';
import { 
  userStatistics, 
  UserStatistics,
  userProfile,
  userBalanceRuntime,
} from '../services/user';
import { User } from '../models';

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

  return (
    <div>
      {user && user.status === 0 && user.id_no.length === 0 ? <Alert message="新用户请先至个人中心完善信息" type="info" showIcon /> : null}
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
        <Col span={6}>
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
    </div>
  );
}
