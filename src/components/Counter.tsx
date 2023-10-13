import { useState } from 'react';
import { MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { Space } from 'antd';

// minimal value is 1
export default function Counter(props: {initialNum: number, onChange: (val: number) => void}) {
    const [num, setNum] = useState(props.initialNum || 1);
    const updateNum = (n: number) => {
        setNum(n);
        if (props.onChange) props.onChange(n);
    }
    return (
        <Space style={{fontSize: '16px'}}>
            <MinusSquareOutlined onClick={() => updateNum(num > 1 ? num - 1 : num)}/>
            <span>{num}</span>
            <PlusSquareOutlined onClick={() => updateNum(num+1)}/>
        </Space>
    );
}