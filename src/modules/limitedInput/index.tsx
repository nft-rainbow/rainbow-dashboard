import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Form, Input, Switch, DatePicker, Select, Popover, InputNumber, Radio } from 'antd';
import type { FormInstance, FormItemProps } from 'antd/es/form';
const Item = { Form };

interface ILimitByteInputProps extends FormItemProps {
  form: FormInstance;
  id: string;
  message?: string;
  placeholder?: string;
  maxLength?: number;
}

const LimitedInput: React.FC<ILimitByteInputProps> = ({ form, id, placeholder, maxLength, message, ...props }) => {
  const [isExessed, setIsExessed] = useState(false);

  const LimitValidator = useCallback((rule: any, value: any, callback: any) => {
    if (!maxLength) return callback();
    const length = calculator(value);
    if (length > maxLength) {
      callback('超出最大长度');
    } else {
      callback();
    }
  }, []);

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

  return (
    <Form.Item rules={[{ required: true, message: message }, { validator: LimitValidator }]} {...props}>
      <Input id={id} placeholder={placeholder} />
    </Form.Item>
  );
};

export default LimitedInput;
