import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SmileOutlined } from '@ant-design/icons';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Result
        status="404"
        title="Ой! Такой страницы не существует"
        subTitle="Возможно, вы ошиблись адресом, либо эта страница была удалена."
        icon={<SmileOutlined style={{ fontSize: '48px', color: '#1890ff' }} />}
        extra={
          <Button type="primary" size="large" onClick={handleBackHome}>
            Вернуться на главную
          </Button>
        }
        style={{
          textAlign: 'center',
        }}
      />
    </div>
  );
};

export default NotFoundPage;
