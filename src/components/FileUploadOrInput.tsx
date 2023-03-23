import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { Radio, Input } from 'antd';

export default function FileUploadOrInput(props: {
    onChange: (err: Error, file: object) => void,
    accept?: string,
    listType?: string,
    maxCount?: number,
    style?: any,
}) {
    const [type, setType] = useState<string>("0");
    return (
        <>
            <Radio.Group value={type} onChange={(e) => setType(e.target.value)}>
                <Radio.Button value="0">本地文件</Radio.Button>
                <Radio.Button value="1">网络链接</Radio.Button>
            </Radio.Group>
            <div style={{marginTop: "15px"}}>
            {
                type === "0" ? <FileUpload {...props} /> : null
            }
            {
                type === "1" ? <Input style={props.style} onChange={e => props.onChange(null as any as Error, {url: e.target.value})} /> : null
            }
            </div>
        </>
    );
}