import { Breadcrumb } from "antd";

export default function RainbowBreadcrumb (props: {items: string[]}) {
  const items = props.items.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>);
  return (
    <Breadcrumb style={{ margin: '16px 0' }}>
      {items}
    </Breadcrumb>
  );
}