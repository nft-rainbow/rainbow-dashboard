import React, { useEffect } from 'react';
import { Card, Button, Form, Input } from 'antd';
import { HexColorPicker } from "react-colorful";
import { getActivityById } from '@services/activity';
import { useParams } from 'react-router-dom';
import useSWR from 'swr'

const Building: React.FC = () => {
  const { activityId } = useParams();
  const { data, error, isLoading } = useSWR('/api/user', () => getActivityById(activityId))
  console.log(data);

  return (
    <Form name="build-site">
      <Card title="网页链接" className="mb-24px">
        <Form.Item label="https://nftrainbow.com/" name="link">
          <Input placeholder="请输入网页链接" />
        </Form.Item>
      </Card>

      <div className="flex gap-24px">
        <Card title="快速编辑" className="w-full">
          <Form.Item label="标题字号" name="title_size">
            <Input defaultValue="40" />
          </Form.Item>
          <Form.Item label="标题颜色" name="title_color">
            <Input defaultValue="40" />
          </Form.Item>
        </Card>
        <Card title="网页预览" className="w-full"></Card>
      </div>
    </Form>
  );
};

export default Building;
