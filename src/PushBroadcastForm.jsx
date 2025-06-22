import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import axios from 'axios';

const PushBroadcastForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('https://chechnya-product.ru/api/push/broadcast', {
        title: values.title,
        body: values.body,
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Уведомления успешно отправлены!');
      } else {
        message.error('Ошибка при отправке уведомлений');
      }
    } catch (error) {
      console.error(error);
      message.error('Произошла ошибка при отправке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Массовая рассылка Push-уведомлений" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Заголовок"
          rules={[{ required: true, message: 'Введите заголовок' }]}
        >
          <Input placeholder="Введите заголовок уведомления" />
        </Form.Item>

        <Form.Item
          name="body"
          label="Текст уведомления"
          rules={[{ required: true, message: 'Введите текст уведомления' }]}
        >
          <Input.TextArea rows={4} placeholder="Введите текст уведомления" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Отправить всем
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PushBroadcastForm;
