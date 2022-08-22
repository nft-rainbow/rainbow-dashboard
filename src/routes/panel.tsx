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
      {user && user.status === 0 ? <Alert message="新用户请先至个人中心完善信息，并耐心等待审核通过，我们会在2-3天完成审核。" type="info" showIcon /> : null}
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
            <Statistic title="应用" value={statistics.app_count} />
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
