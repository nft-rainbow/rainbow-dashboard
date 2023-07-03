import React, { useContext, useEffect, useRef, useState } from 'react';
import {Form, Input, Popconfirm, Table} from "antd";
import type { InputRef } from 'antd';
import type { FormInstance } from 'antd/es/form';
import './editableTable.css';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
    key: string;
    name: string;
}
  
interface EditableRowProps {
    index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;
  
    useEffect(() => {
        if (editing) {
            inputRef.current!.focus();
        }
    }, [editing]);
  
    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };
  
    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
  
    let childNode = children;
  
    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
                {children}
            </div>
        );
    }
  
    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
    key: React.Key;
    name: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

export default function EditableTable(props: {
    dataSource: DataType[], 
    handleDelete: (key: React.Key) => void, 
    handleSave: (row: DataType) => void
}) {
    const { dataSource, handleDelete, handleSave } = props;
    
    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
          title: '条目',
          dataIndex: 'name',
          width: '80%',
          editable: true,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          render: (_, record: { key: React.Key }) =>
            dataSource.length >= 1 ? (
              <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.key)}>
                <a>删除</a>
              </Popconfirm>
            ) : null,
        },
    ];

    const components = {
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
    };
    
    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: DataType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    return (
        <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns as ColumnTypes}
        />
    );
}