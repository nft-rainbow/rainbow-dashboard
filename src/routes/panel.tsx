import React, { useState, useEffect } from 'react';
import { Alert, Col, Row, Statistic, Card } from 'antd';
import { 
  userStatistics, 
  UserStatistics,
  userProfile,
} from '../services/user';
import { User } from '../models';

export default function Panel() {
  const defaultStatistics = {
    nft_count: 0,
    contract_count: 0,
    app_count: 0,
    request_count: 0,
  };
  const [statistics, setStatistics] = useState<UserStatistics>(defaultStatistics);
  const [user, setUser] = useState<User|null>(null);

  useEffect(() => {
    userStatistics().then(setStatistics);
  }, []);

  useEffect(() => {
    userProfile().then(setUser);
  }, []);

  return (
    <div>
      {user && user.status === 0 && user.id_no.length === 0 ? <Alert message="新用户请先至个人中心完善信息" type="info" showIcon /> : null}
      {user && user.status === 0 && user.id_no.length > 0 ? <Alert message="请耐心等待审核通过，我们会在2-3天完成审核。" type="info" showIcon /> : null}
      <Alert message="Rainbow 将会从 2023.1.1 开始正式商用" type="info" action={
        <a href="https://docs.nftrainbow.xyz/docs/price" target="_blank" rel="noreferrer">了解详情</a>
      } />
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
            <Statistic title="接口调用量" value={statistics.request_count} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
