import React, { useState, useEffect } from 'react';
import { Alert, Col, Row, Statistic, Card } from 'antd';
import { userStatistics, UserStatistics } from '../services/user';

function Dashboard() {
  const defaultStatistics = {
    nft_count: 0,
    contract_count: 0,
    app_count: 0,
    request_count: 0,
  };
  const [statistics, setStatistics] = useState<UserStatistics>(defaultStatistics);

  useEffect(() => {
    userStatistics().then((_statistics) => {
      setStatistics(_statistics);
    });
  }, []);

  return (
    <div>
      <Alert message="新用户请先至个人中心完善信息" type="info" showIcon />
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

export default Dashboard;
