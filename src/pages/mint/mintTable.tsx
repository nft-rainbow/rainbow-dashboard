import React, { useCallback, useEffect, useState } from 'react';
import { Button, Checkbox, Col, Form, FormInstance, Input, InputNumber, Popconfirm, Row, Space, Table, Tooltip, Typography, Image, message } from 'antd';
import MintFormFields, { checkMintInput } from './mintFormFields';
import FileUpload from '../../components/FileUpload';
import { PictureOutlined, QuestionCircleOutlined, QuestionOutlined } from '@ant-design/icons/lib';
import ImportImages from './ImportImages';
import UploadDir from './uploadDirectory';
import DragUpload from './dragUpload';
import ParseLocalFile from './parseLocalFile';
import { utils, writeFileXLSX } from 'xlsx';
import { mapChainAndNetworkName } from '@utils/index';
import { batchMint, easyMintUrl } from '@services/app';
import { Contract } from '@models/index';
const { Text } = Typography;

interface Item {
  key: string;
  file_url: string;
  name: string;
  desc: string;
  address: string;
  attributes: { [key: string]: string }[];
}

const originData: Item[] = [];

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'file';
  record: Item;
  index: number;
  children: React.ReactNode;
  form: FormInstance;
}

const EditableCell: React.FC<EditableCellProps> = ({ editing, dataIndex, title, inputType, record, index, form, children, ...restProps }) => {
  const url = () => form?.getFieldValue(dataIndex);
  const [trigger, setTrigger] = useState(0);
  const cbUrl = useCallback(url, [trigger]);
  const inputNode =
    inputType === 'file' ? (
      <>
        {cbUrl() && <Image src={cbUrl()} />}
        <FileUpload
          accept={'.png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae'}
          maxCounat={1}
          onChange={(err: Error, file: any) => {
            if (err) {
              message.error(`上传图片出错: ${err}`);
              return;
            }
            console.log(`set file : `, dataIndex, file.url);
            form.setFieldsValue({ [dataIndex]: file.url });
            setTrigger(trigger + 1);
          }}
        />
      </>
    ) : inputType === 'number' ? (
      <InputNumber />
    ) : (
      <Input />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入 ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

function MintTable(props: { appId: string; chainId: number; controlForm: boolean; contract: Contract }) {
  const { appId, chainId, controlForm, contract } = props;
  const [form] = Form.useForm();
  const [headForm] = Form.useForm();
  const [data, setData] = useState(originData);
  const [useCols, setUseCols] = useState({ sameName: false, sameImage: false, sameDesc: false, sameAddress: false });
  const [editingKey, setEditingKey] = useState('');
  const [mintLoading, setMintLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [step, setStep] = useState('edit' as 'edit' | 'submit' | 'done');

  const isEditing = (record: Item) => record.key === editingKey;

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.key);
  };
  const remove = (record: Partial<Item> & { key: React.Key }) => {
    const arr = data.filter((t) => t.key != record.key);
    setData(arr);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const newInput = (await form.validateFields()) as Item;

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const oldRow = newData[index];
        newData.splice(index, 1, {
          ...oldRow,
          ...newInput,
        });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(newInput);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'file_url',
      width: '15%',
      editable: true,
      render: (url: string) => {
        return url ? <Image alt={url} src={url} /> : '';
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: '15%',
      editable: true,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      width: '25%',
      editable: true,
    },
    {
      title: '接受地址',
      dataIndex: 'address',
      editable: true,
    },
    {
      title: '操作',
      width: '15%',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              保存
            </Typography.Link>
            <Typography.Link onClick={cancel}>取消</Typography.Link>
          </span>
        ) : (
          <Space>
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              编辑
            </Typography.Link>
            <Typography.Link disabled={editingKey !== ''} onClick={() => remove(record)}>
              删除
            </Typography.Link>
          </Space>
        );
      },
    },
  ].filter((c) => {
    switch (c.dataIndex) {
      case 'name':
        return !useCols.sameName;
      case 'file_url':
        return !useCols.sameImage;
      case 'desc':
        return !useCols.sameDesc;
      case 'address':
        return !useCols.sameAddress;
      default:
        return true;
    }
  });

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'file_url' ? 'file' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        form,
        editing: isEditing(record),
      }),
    };
  });
  useEffect(() => {
    console.log(`data length`, data.length);
  }, [data]);
  const addRow = (url = '', name = '') => {
    let newElement = { key: Date.now().toString(), file_url: url, name, address: '', desc: '', attributes: [] };
    setData((preArr) => [...preArr, newElement]);
  };
  const handleImportData = (arr: any[]) => {
    const map = { 图片链接: 'file_url', 名字: 'name', 描述: 'desc', 接受地址: 'address' };
    let metaKeys = Object.keys(map);
    let attrKeys = Object.keys(arr[0] || {}); //.filter(k=>k.endsWith("trait_type") || k.endsWith("value") || k.endsWith("display_type"))
    //console.log(`attrKeys`, attrKeys, 'on', arr[0])
    const newArr = arr.map((row, idx) => {
      const item = { key: `${idx}` } as { [key: string]: any };
      metaKeys.forEach((k) => {
        //@ts-ignore
        item[map[k]] = row[k];
      });
      const attributes = [];
      for (let i = 0; i < attrKeys.length; ) {
        let k = attrKeys[i];
        if (!k.endsWith('trait_type')) {
          i++;
          continue;
        }
        const attr: { [key: string]: any } = { trait_type: row[k].toString() || '' };
        while (i + 1 < attrKeys.length && !attrKeys[i + 1].endsWith('trait_type')) {
          k = attrKeys[++i];
          if (k.endsWith('value')) {
            attr.value = row[k]?.toString() || '';
          } else if (k.endsWith('display_type')) {
            attr.display_type = row[k]?.toString() || '';
          } else {
          }
        }
        if (attr.value === null || attr.value === undefined) {
          throw new Error(`value字段必填，行 [${idx + 1}] 列 [${k} 右侧]`);
        }
        attributes.push(attr);
      }
      item.attributes = attributes;
      return item;
    });
    // console.log(`converted`, newArr)
    setData(newArr as Item[]);
  };
  const exportData = () => {
    setExporting(true);
    new Promise(() => {
      exportAsync();
    })
      .then()
      .finally(() => setExporting(false));
  };
  const exportAsync = () => {
    const values = checkMintInput(headForm, { withAddress: useCols.sameAddress, withDesc: useCols.sameDesc, withName: useCols.sameName, withImage: useCols.sameImage });
    if (!values) {
      return;
    }
    if (exporting) {
      return;
    }
    setExporting(true);
    const { file_url, name, description, mint_to_address } = values;
    const colNames = ['图片链接', '名字', '描述', '接受地址'];
    if (data[0]?.attributes.length) {
      for (let i = 0; i < data[0].attributes.length; i++) {
        colNames.push(`属性${i + 1}:trait_type`, `属性${i + 1}:value`, `属性${i + 1}:display_type`);
      }
    }
    const aoa = [colNames];
    data.forEach((row) => {
      const arr = [
        useCols.sameImage ? file_url : row.file_url,
        useCols.sameName ? name : row.name,
        useCols.sameDesc ? description : row.desc,
        useCols.sameAddress ? mint_to_address : row.address,
      ];
      (row.attributes || []).forEach((attr) => {
        arr.push(attr.trait_type || '');
        arr.push(attr.value || '');
        arr.push(attr.display_type || '');
      });
      aoa.push(arr);
    });
    const ws = utils.aoa_to_sheet(aoa);
    // const ws = utils.json_to_sheet(exportArr);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'mint');
    const dt = new Date();
    writeFileXLSX(wb, `export_mints_${dt.getMonth() + 1}_${dt.getDate()}.xlsx`);
    setExporting(false);
  };
  const mint = () => {
    const values = checkMintInput(form, { withImage: useCols.sameImage, withName: useCols.sameName, withDesc: useCols.sameDesc, withAddress: useCols.sameAddress });
    if (!values) {
      return;
    }
    const arr = [] as any[];
    const { file_url, name, description, mint_to_address } = values;
    const chain = mapChainAndNetworkName(contract.chain_type, contract.chain_id);
    data.forEach((row) => {
      const nft = {
        file_url: useCols.sameImage ? file_url : row.file_url,
        name: useCols.sameName ? name : row.name,
        description: useCols.sameDesc ? description : row.desc,
        mint_to_address: useCols.sameAddress ? mint_to_address : row.address,
        contract_address: contract.address,
        chain,
        attributes: row.attributes,
      };
      arr.push(nft);
    });
    setMintLoading(true);
    batchMint(props.appId.toString(), arr)
      .then((res) => {
        message.info(`铸造任务提交成功！`);
        setStep('done');
      })
      .catch((e) => {
        const msg = e.response?.data?.message || e.toString();
        message.error(`铸造失败:${msg}`);
        console.log(`error is`, e);
        setMintLoading(false);
      })
      .finally(() => {
        setMintLoading(false);
      });
  };
  return (
    <>
      {controlForm && (
        <Form labelCol={{ span: 2 }} wrapperCol={{ span: 16 }}>
          <Form.Item label={'选项'}>
            <Space>
              {/*ugly code here :( */}
              <Checkbox
                checked={useCols.sameImage}
                onClick={() =>
                  setUseCols({
                    ...useCols,
                    sameImage: !useCols.sameImage,
                  })
                }
              >
                图片相同
              </Checkbox>
              <Checkbox checked={useCols.sameName} onClick={() => setUseCols({ ...useCols, sameName: !useCols.sameName })}>
                名字相同
              </Checkbox>
              <Checkbox checked={useCols.sameDesc} onClick={() => setUseCols({ ...useCols, sameDesc: !useCols.sameDesc })}>
                描述相同
              </Checkbox>
              <Checkbox
                checked={useCols.sameAddress}
                onClick={() =>
                  setUseCols({
                    ...useCols,
                    sameAddress: !useCols.sameAddress,
                  })
                }
              >
                接受地址相同
              </Checkbox>
              <Tooltip title={'勾选为相同的字段可在表单中填写，不会出现在表格里'}>
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          </Form.Item>
        </Form>
      )}
      <MintFormFields
        withImage={useCols.sameImage}
        form={headForm}
        appId={appId}
        chainId={chainId}
        withDesc={useCols.sameDesc}
        withAddress={useCols.sameAddress}
        withName={useCols.sameName}
      />

      {mergedColumns.length > 1 && (
        <>
          <Space>
            <Button onClick={() => addRow()} style={{ margin: '8px' }}>
              + 添加一行
            </Button>
            当前[{data.length}]行
            <ParseLocalFile handleData={handleImportData} />
            <Button type={'link'}>
              <a href={'/mint_template.xlsx'} style={{ color: 'gray' }}>
                下载模板
              </a>
            </Button>
            {!useCols.sameImage && <DragUpload onSuccess={({ url }: { url: string }, name: string) => addRow(url, name)} />}
            <Tooltip title={'通过批量导入图片，再导出，可以获得图片URL和名称的对应关系，完善信息后，即可再次导入。'}>
              <Button loading={exporting} onClick={exportData} type={'link'}>
                导出
              </Button>
            </Tooltip>
            <Button type={'link'} onClick={() => setData([])}>
              清空
            </Button>
          </Space>

          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              expandable={{
                expandedRowRender: (record) =>
                  record.attributes?.length ? (
                    <>
                      {record.attributes.map((a) => {
                        return (
                          <Row gutter={16}>
                            <Col span={2}>
                              <Text type="secondary">trait_type</Text>
                            </Col>
                            <Col span={2}>{a.trait_type}</Col>
                            <Col span={2}>
                              <Text type="secondary">display_type</Text>
                            </Col>
                            <Col span={2}>{a.display_type}</Col>
                            <Col span={2}>
                              <Text type="secondary">value</Text>
                            </Col>
                            <Col>{a.value}</Col>
                          </Row>
                        );
                      })}
                    </>
                  ) : (
                    '没有扩展属性，请使用模板中的扩展属性sheet导入。'
                  ),
                rowExpandable: (record) => true,
              }}
              bordered
              dataSource={data}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={false}
            />
          </Form>
        </>
      )}
      {step === 'edit' && (
        <Button loading={mintLoading} style={{ marginTop: '8px' }} htmlType={'submit'} type={'primary'} onClick={mint}>
          开始铸造
        </Button>
      )}
      {step === 'done' && (
        <Space style={{ marginTop: '8px' }}>
          <Typography.Text type={'success'}>铸造任务提交成功！请在铸造历史中查看结果。</Typography.Text>
          <Button
            onClick={() => {
              setData([]);
              setStep('edit');
            }}
          >
            清空数据
          </Button>
          <Button
            type={'link'}
            onClick={() => {
              exportData();
              setStep('edit');
            }}
          >
            导出数据
          </Button>
          <Button type={'primary'} onClick={() => setStep('edit')}>
            我知道了
          </Button>
        </Space>
      )}
    </>
  );
}

export default MintTable;
