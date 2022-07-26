import React from 'react';
import { Alert, Col, Row, Statistic, Card } from 'antd';

function Dashboard() {
  return (
    <div>
      <Alert message="新用户请先至个人中心完善信息" type="info" showIcon />
      <Row gutter={16} style={{margin: '16px 0'}}>
        <Col span={6}>
          <Card>
            <Statistic title="数字藏品" value={112893} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="合约" value={112}/>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="应用" value={112893} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="接口调用量" value={112} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
