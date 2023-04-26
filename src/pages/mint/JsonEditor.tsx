import React, { useEffect, useState } from 'react';
import { CarryOutOutlined, FormOutlined } from '@ant-design/icons';
import { 
    Button, Col, Form, FormInstance, Input, message, 
    Row, Space, Tooltip, Tree, Typography 
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import ParseLocalFile from "@pages/mint/parseLocalFile";
import { QuestionCircleOutlined } from "@ant-design/icons/lib";
import { DownloadText } from "@pages/mint/downloadTxt";

const treeData: DataNode[] = [
    {
        title: 'parent 1',
        key: '0-0',
        icon: <CarryOutOutlined/>,
        children: [
            {
                title: 'parent 1-0',
                key: '0-0-0',
                icon: <CarryOutOutlined/>,
                children: [
                    {title: 'leaf', key: '0-0-0-0', icon: <CarryOutOutlined/>},
                    {
                        title: (
                            <>
                                <div>multiple line title</div>
                                <div>multiple line title <input value={"abc&UJM*IK<987"} style={{border: '0px'}}/>
                                </div>
                            </>
                        ),
                        key: '0-0-0-1',
                        icon: <CarryOutOutlined/>,
                    },
                    {title: 'leaf', key: '0-0-0-2', icon: <CarryOutOutlined/>},
                ],
            },
            {
                title: 'parent 1-1',
                key: '0-0-1',
                icon: <CarryOutOutlined/>,
                children: [{title: 'leaf', key: '0-0-1-0', icon: <CarryOutOutlined/>}],
            },
            {
                title: 'parent 1-2',
                key: '0-0-2',
                icon: <CarryOutOutlined/>,
                children: [
                    {title: 'leaf', key: '0-0-2-0', icon: <CarryOutOutlined/>},
                    {
                        title: 'leaf',
                        key: '0-0-2-1',
                        icon: <CarryOutOutlined/>,
                        switcherIcon: <FormOutlined/>,
                    },
                ],
            },
        ],
    },
    {
        title: 'parent 2',
        key: '0-1',
        icon: <CarryOutOutlined/>,
        children: [
            {
                title: 'parent 2-0',
                key: '0-1-0',
                icon: <CarryOutOutlined/>,
                children: [
                    {title: 'leaf', key: '0-1-0-0', icon: <CarryOutOutlined/>},
                    {title: 'leaf', key: '0-1-0-1', icon: <CarryOutOutlined/>},
                ],
            },
        ],
    },
];

function buildJsonFromTree(treeData: DataNode[], form: FormInstance) {
    const json = {} as any;
    treeData.forEach(d => {
        let k = d.key.toString();
        console.log(`key is`, k)
        const name = k.split(":")[1];
        if (d.children.length) {
            json[name] = buildJsonFromTree(d.children, form)
        } else {
            json[name] = form.getFieldValue(k) || "";
        }
    })
    return json;
}

export function jsonToAttributesArray(json:any) {
    const keys = Object.keys(json);
    const arr = []
    keys.forEach(k=>{
        arr.push({attribute_name: k, ...json[k]})
    })
    return arr;
}

const JsonEditor: React.FC<{setFetcher:(obj)=>void}> = ({setFetcher}:{setFetcher:(obj)=>void}) => {
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['0-0-0', '0-0-1']);
    const [selected, setSelected] = useState<React.Key>("");
    const [selectedArr, setSelectedArr] = useState<React.Key[]>([]);
    const [data, setData] = useState([] as DataNode[]);
    const [json, setJson] = useState({} as any);
    const [updater, setUpdater] = useState(1);
    const [form] = Form.useForm();

    const onSelect = (selectedKeys: React.Key[], info: any) => {
        console.log('selected', selectedKeys, info);
        let node = selectedKeys.length ? selectedKeys[0] : "";
        setSelected(node);
        // info.nativeEvent.preventDefault()
        // info.nativeEvent.stopPropagation()
        // setSelectedArr([node])
        // console.log(`children ${info.node?.children.length}`)
    };

    useEffect(() => {
        console.log(`data is`, data, 'updater', updater)
        let json = buildJsonFromTree(data, form);
        console.log(`changed`, json)
        setJson(json);
        setFetcher(json)
    }, [form, data, updater])

    function createNode(name, key) {
        return (<Space>
            {name}
            <Form.Item noStyle label={name} name={key} style={{border: '0px'}}>
                <Input bordered={false} onChange={() => {
                    setUpdater(Date.now())
                }}/>
            </Form.Item>
        </Space>)
    }
    function jsonToDataNodeArr(json:any, treeKeys:React.Key[], key_prefix = 0) {
        const arr:DataNode[] = [];
        const keys = Object.keys(json);
        keys.forEach(k=>{
            key_prefix ++;
            const v = json[k];
            let nodeKey = `${key_prefix}:${k}`;
            treeKeys.push(nodeKey)
            if (typeof v === 'string') {
                arr.push({key: nodeKey, children:[], title: createNode(k, nodeKey)})
                form.setFieldValue(nodeKey, v);
            } else {
                arr.push({key: nodeKey, children: jsonToDataNodeArr(v, treeKeys, key_prefix + 10000), title: k})
            }
        })
        return arr;
    }
    const addProp = (parent: any) => {
        const name = form.getFieldValue("field_name")
        if (!name) {
            message.info(`请填写属性名称`)
            return;
        }
        let key1 = `${Date.now().toString()}:${name}`;
        if (!parent) {
            setData(arr => [...arr, {
                title: createNode(name, key1),
                key: key1, children: []
            }]);
            setExpandedKeys([...expandedKeys, parent]);
            return;
        }

        function find(arr: DataNode[], key: React.Key) {
            let hit = null;
            for (let i = 0; i < arr.length; i++) {
                let e = arr[i];
                console.log(`check ${e.key} vs ${key}`)
                if (e.key == key) {
                    hit = e;
                    break;
                }
                hit = find(e.children, key);
                if (hit) {
                    break;
                }
            }
            return hit;
        }

        let curNode = find(data, selected);
        if (!curNode) {
            console.log(`not found`)
            return;
        }
        console.log(`that is`, curNode)
        //@ts-ignore
        curNode.children = [...curNode.children, {
            title: (createNode(name, key1)),
            key: key1, children: []
        }];
        curNode.title = curNode.key.toString().split(":")[1];
        setData([...data])
        setExpandedKeys([...expandedKeys, selected])
    }
    const removeProp = (key: React.Key) => {
        function iter(arr: DataNode[], key: React.Key) {
            const rest = []
            arr.forEach(e => {
                if (e.key != key) {
                    e.children = iter(e.children, key)
                    rest.push(e)
                }
            })
            return rest;
        }

        setData(iter(data, key));
        setSelected("")
    }
    const fileName = "meta_template.txt";
    const fileContent = JSON.stringify({
        "model_3d": {
            "url": "https://someurl.com/path.jpg",
            "display_type": "3d"
        },
        "height": "200px",
        "width": "300px",
        "test": "测试"
    }, null, 4);
    return (
        <div style={{flexGrow: 1, border: "0px solid blue"}} id={"outer_div"}>
            <Form form={form} style={{border:"0px solid yellow", flexGrow: 1}}>
                <Space direction={"vertical"} style={{border: "0px solid green", width:"100%", flexGrow: 1}}>
                    <Space>
                        <span style={{minWidth:'300px'}}>当前位置:[{selected ? selected.toString().split(":")[1] : ""}]</span>
                        <Button type={"link"} onClick={() => removeProp(selected)} disabled={!selected}>删除</Button>
                    </Space>
                    <Row gutter={16 }  style={{border: "0px solid darkgreen"}}>
                        <Col span={12} id={"col_for_tree"}>
                            <Space style={{marginBottom: 0, border: "0px solid blue"}}>
                                <Form.Item noStyle name={"field_name"}>
                                    <Input placeholder={"属性名称"} style={{width: '120px'}}/>
                                </Form.Item>
                                <Button onClick={() => addProp(selected)}>添加</Button>
                                <Tooltip title={"为选中的节点添加属性。再次点击选中的节点以取消选中。"}><QuestionCircleOutlined/></Tooltip>
                                <Button type={"link"}><DownloadText content={fileContent} filename={fileName} label={"下载模板"}/></Button>
                                <ParseLocalFile handleData={(data) => {
                                    console.log(`import data`, data)
                                    try {
                                        const json = JSON.parse(data)
                                        const keys = []
                                        setData(jsonToDataNodeArr(json, keys, 0))
                                        console.log(`expanded keys`, keys)
                                        setExpandedKeys(keys)
                                        setUpdater(Date.now())
                                    } catch (e) {
                                        message.info(`导入出错: ${e}`)
                                    }
                                }}/>
                            </Space>
                        </Col>
                        <Col span={12} id={"col_for_tree"} style={{border: "0px solid blue"}}>
                            <Typography.Text>预览</Typography.Text>
                            <Button type={"link"}><DownloadText content={JSON.stringify(json, null, 4)} filename={"meta.json.txt"} label={"下载"}/></Button>
                        </Col>
                    </Row>
                    <Row gutter={16 }>
                        <Col span={12} id={"col_for_tree"}>
                            <Tree id={"tree_id_000"}
                                showLine={true}
                                defaultExpandedKeys={['0-0-0']}
                                expandedKeys={expandedKeys}
                                onSelect={onSelect}
                                // selectedKeys={selectedArr}
                                treeData={data}
                            />
                        </Col>
                        <Col span={12} id={"col_for_preview"}>
                            <pre style={{}}>
                                {JSON.stringify(json, null, 4)}
                            </pre>
                        </Col>
                    </Row>
                </Space>
            </Form>
        </div>
    );
};

export default JsonEditor;