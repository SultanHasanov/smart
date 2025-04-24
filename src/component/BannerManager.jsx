import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Switch, Space, Popconfirm } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const durationOptions = [
  { label: "1 минута", value: 1 },
  { label: "5 минут", value: 5 },
  { label: "10 минут", value: 10 },
  { label: "20 минут", value: 20 },
  { label: "30 минут", value: 30 },
  { label: "1 час", value: 60 },
  { label: "2 часа", value: 120 },
  { label: "5 часов", value: 300 },
  { label: "10 часов", value: 600 },
  { label: "24 часа", value: 1440 },
];

const typeOptions = [
  { label: "Успех", value: "success" },
  { label: "Информация", value: "info" },
  { label: "Предупреждение", value: "warning" },
  { label: "Ошибка", value: "error" },
];

const api = "https://44899c88203381ec.mokky.dev/banner";

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingBanner, setEditingBanner] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(api);
      setBanners(res.data);
    } catch {
      message.error("Ошибка загрузки баннеров");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showForm = (banner = null) => {
    setEditingBanner(banner);
    setFormVisible(true);
    if (banner) {
      form.setFieldsValue({
        text: banner.text,
        duration: banner.duration,
        type: banner.type, // добавляем тип баннера
      });
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = async (values) => {
    const now = Date.now();
    const data = {
      ...values,
      active: false, // установим active как false по умолчанию
      startTime: now,
      endTime: now + values.duration * 60 * 1000, // перевод в миллисекунды
    };

    try {
      if (editingBanner) {
        await axios.patch(`${api}/${editingBanner.id}`, data);
        message.success("Баннер обновлен");
      } else {
        await axios.post(api, data);
        message.success("Баннер создан");
      }
      fetchBanners();
      setFormVisible(false);
    } catch {
      message.error("Ошибка при сохранении баннера");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${api}/${id}`);
      message.success("Баннер удален");
      fetchBanners();
    } catch {
      message.error("Ошибка удаления баннера");
    }
  };

  const toggleBanner = async (banner) => {
    const now = Date.now();
    const updated = {
      active: !banner.active,
      startTime: now,
      endTime: now + banner.duration * 60 * 1000,
    };
    try {
      await axios.patch(`${api}/${banner.id}`, updated);
      fetchBanners();
    } catch {
      message.error("Ошибка обновления статуса");
    }
  };

  const columns = [
    {
      title: "Текст",
      dataIndex: "text",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => showForm(record)}
        >
          {text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      ),
    },
    {
      title: "Активен",
      dataIndex: "active",
      render: (active, record) => (
        <Switch checked={active} onChange={() => toggleBanner(record)} />
      ),
    },
    {
      title: "Период",
      render: (record) =>
        `${record.duration} мин (до ${dayjs(record.endTime).format("HH:mm")})`,
    },
    {
      title: "Действия",
      render: (record) => (
        <Space>
          <Popconfirm
            title="Удалить баннер?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Удалить</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Управление баннерами</h2>
      <Button type="primary" onClick={() => showForm()} style={{ marginBottom: 16 }}>
        Создать баннер
      </Button>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingBanner ? "Редактировать баннер" : "Создать баннер"}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Текст баннера"
            name="text"
            rules={[{ required: true, message: "Введите текст баннера" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Время отображения"
            name="duration"
            rules={[{ required: true, message: "Выберите продолжительность" }]}
          >
            <Select options={durationOptions} />
          </Form.Item>

          <Form.Item
            label="Тип баннера"
            name="type"
            rules={[{ required: true, message: "Выберите тип баннера" }]}
          >
            <Select options={typeOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerManager;
