import React, {useCallback, useEffect, useState} from 'react';
import {CarryOutOutlined, CheckOutlined, FormOutlined} from '@ant-design/icons';
import {Button, Col, Form, FormInstance, Input, message, Row, Select, Space, Switch, Tree} from 'antd';
import type {DataNode} from 'antd/es/tree';
import ParseLocalFile from "@pages/mint/parseLocalFile";

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
        const name = k.split("_")[1];
        if (d.children.length) {
            json[name] = buildJsonFromTree(d.children, form)
        } else {
            json[name] = form.getFieldValue(k) || "";
        }
    })
    return json;
}

const JsonEditor: React.FC = () => {
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['0-0-0', '0-0-1']);
    const [selected, setSelected] = useState<React.Key>("");
    const [selectedArr, setSelectedArr] = useState<React.Key[]>([]);
    const [data, setData] = useState([] as DataNode[]);
    const [json, setJson] = useState({} as any);
    const [updater, setUpdater] = useState(1);
    const [form] = Form.useForm()

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

    const addProp = (parent: any) => {
        const name = form.getFieldValue("field_name")
        if (!name) {
            message.info(`请填写属性名称`)
            return;
        }
        let key1 = `${Date.now().toString()}_${name}`;
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
        curNode.title = curNode.key.toString().split("_")[1];
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
    var fileName = "meta_template.txt";
    var fileContent = JSON.stringify({
        "model_3d": {
            "url": "https://someurl.com/path.jpg",
            "display_type": "3d"
        },
        "height": "200px",
        "width": "300px",
        "test": "测试"
    }, null, 4);
    var myFile = new Blob([fileContent], {type: 'text/plain',});
    var URL = window.URL || window.webkitURL;
    var obj = URL.createObjectURL(myFile)
    return (
        <div style={{flexGrow: 1, border: "1px solid blue"}} id={"outer_div"}>
            <Form form={form} style={{border:"1px solid yellow", flexGrow: 1}}>
                <Space direction={"vertical"} style={{border: "1px solid green", width:"100%", flexGrow: 1}}>
                    <span>
                        当前节点:[{selected ? selected : "顶层节点"}][{selected}]
                    </span>
                    <Space style={{marginBottom: 16}}>
                        <Form.Item noStyle name={"field_name"}>
                            <Input placeholder={"属性名称"} style={{width: '100px'}}/>
                        </Form.Item>
                        <Button onClick={() => addProp(selected)}>添加属性</Button>
                        <Button onClick={() => removeProp(selected)}>删除</Button>
                        <Button type={"link"}><a href={obj} download={fileName}>下载模板</a></Button>
                        <ParseLocalFile handleData={(data) => {
                            console.log(`import data`, data)
                        }}/>
                    </Space>
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
                            预览：
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