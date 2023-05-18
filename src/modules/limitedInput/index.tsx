import React, { useCallback } from 'react';
import { Form, Input } from 'antd';
import type { FormInstance, FormItemProps } from 'antd/es/form';
const { TextArea } = Input;

interface ILimitByteInputProps extends FormItemProps {
    form: FormInstance;
    id: string;
    message?: string;
    placeholder?: string;
    maxLength?: number;
}

const LimitedInput: React.FC<ILimitByteInputProps> = ({ form, id, placeholder, maxLength, message, ...props }) => {
    const calculator = useCallback((input: string) => {
        let length = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charAt(i);
            const isChineseChar = /[\u4e00-\u9fa5]/.test(char);
            if (isChineseChar) {
                length += 2;
            } else {
                length++;
            }
        }
        return length;
    }, []);

    const limitValidator = useCallback(async (rule: any, value: string = '') => {
        if (!maxLength) return null;
        const length = calculator(value);
        if (length > maxLength) {
            return '超出最大长度';
        } else {
            return null;
        }
    }, [calculator, maxLength]);

    return (
        <Form.Item rules={[{ required: true, message: message }, { validator: limitValidator }]} {...props} >
            <TextArea id={id} placeholder={placeholder} rows={3} />
        </Form.Item>
    );
};

export default LimitedInput;
