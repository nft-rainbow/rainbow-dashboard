import { Breadcrumb } from 'antd';

export default function RainbowBreadcrumb(props: { items: Array<string | JSX.Element> }) {
  const items = props.items.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>);
  return <Breadcrumb style={{ margin: '0 0 16px 0' }}>{items}</Breadcrumb>;
}
