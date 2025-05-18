import React, { useEffect, useState } from 'react';
import { Table, message, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const LogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Token not found in localStorage');
        return;
      }

      const response = await axios.get('https://chechnya-product.ru/api/admin/logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'text', // Важно!
      });

      const lines = response.data.split('\n').filter(line => line.trim().startsWith('{'));
      const parsedLogs = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);

      setLogs(parsedLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
      message.error('Ошибка загрузки логов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      title: 'Время',
      dataIndex: 'time',
      key: 'time',
      render: (t) => new Date(t).toLocaleString()
    },
    {
      title: 'Уровень',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Источник',
      dataIndex: 'caller',
      key: 'caller',
    },
    {
      title: 'Сообщение',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  return (
    <div>
      <Title level={3}>Системные логи</Title>
      <Table
        columns={columns}
        dataSource={logs}
        rowKey={(_, index) => index}
        loading={loading}
      />
    </div>
  );
};

export default LogsViewer;
