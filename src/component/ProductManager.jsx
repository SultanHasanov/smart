import React, { useEffect, useState } from "react";
import {
  Tabs,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  List,
  Popconfirm,
  message,
  Space,
} from "antd";
import axios from "axios";
import { CloseOutlined, DeleteFilled, EditOutlined } from "@ant-design/icons";
import "../component/styles/Product.scss";

const { TabPane } = Tabs;
const { Option } = Select;

const categories = [
  { id: "1", name: "Блюда" },
  { id: "6", name: "Фастфуд" },
  { id: "2", name: "Напитки" },
  { id: "3", name: "Соки" },
  { id: "4", name: "Хлеб" },
  { id: "5", name: "Кофе" },
];

const apiUrl = "https://44899c88203381ec.mokky.dev/items";

const ProductManager = () => {
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [priceEdits, setPriceEdits] = useState({});

  const fetchItems = async () => {
    const res = await axios.get(apiUrl);
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (values) => {
    await axios.post(apiUrl, values);
    message.success("Товар добавлен");
    form.resetFields();
    fetchItems();
  };

  const handleUpdate = async (id, updatedValues) => {
    await axios.patch(`${apiUrl}/${id}`, updatedValues);
    message.success("Товар обновлён");
    fetchItems();
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${apiUrl}/${id}`);
    message.success("Товар удалён");
    fetchItems();
  };

  const handlePriceChange = (id, price) => {
    setPriceEdits((prev) => ({ ...prev, [id]: price }));
  };

  const saveEditedPrice = async (id) => {
    const newPrice = priceEdits[id];
    if (!newPrice) return;
    await axios.patch(`${apiUrl}/${id}`, { price: newPrice });
    message.success("Цена обновлена");
    fetchItems();
  };

  return (
    <Tabs defaultActiveKey="1" style={{ padding: "0 10px" }}>
      <TabPane tab="Добавить товар" key="1">
        <Form
          className="form-edit"
          form={form}
          layout="inline"
          onFinish={handleAdd}
        >
          <Form.Item
            className="input-form"
            name="name"
            label="Название"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            className="input-form"
            name="price"
            label="Цена"
            rules={[{ required: true }]}
          >
            <InputNumber size="large" min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            className="input-form"
            name="emoji"
            label="URL"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            className="input-form"
            name="category"
            label="Категория"
            rules={[{ required: true }]}
          >
            <Select size="large">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item className="input-form">
            <Button
              className="btn-form"
              size="large"
              type="primary"
              block
              htmlType="submit"
            >
              Добавить товар
            </Button>
          </Form.Item>
        </Form>
      </TabPane>

      <TabPane
        tab={
          <span>
            <EditOutlined style={{ marginRight: 8 }} />
            Товар
          </span>
        }
        key="2"
      >
        <List
          bordered
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              actions={
                editingId === item.id
                  ? [] // 🔒 Скрываем иконки при редактировании
                  : [
                      <EditOutlined
                        key="edit"
                        style={{ color: "green", fontSize: 20 }}
                        onClick={() => setEditingId(item.id)}
                      />,
                      <Popconfirm
                        key="delete"
                        title="Удалить товар?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Да"
                        cancelText="Нет"
                      >
                        <DeleteFilled style={{ color: "red", fontSize: 20 }} />
                      </Popconfirm>,
                    ]
              }
            >
              {editingId === item.id ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <CloseOutlined
                    onClick={() => setEditingId(null)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      fontSize: 18,
                      color: "red",
                      cursor: "pointer",
                      zIndex: 1,
                    }}
                  />

                  <Form
                    initialValues={item}
                    onFinish={(values) => handleUpdate(item.id, values)}
                    layout="inline"
                    style={{
                      width: "100%",
                      flexWrap: "wrap",
                      alignItems: "center",
                      paddingRight: 24, // чтобы не наезжали поля на крестик
                    }}
                  >
                    <Form.Item className="input-form-edit" name="name">
                      <Input />
                    </Form.Item>
                    <Form.Item className="input-form-edit" name="price">
                      <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item className="input-form-edit" name="emoji">
                      <Input />
                    </Form.Item>
                    <Form.Item className="input-form-edit" name="category">
                      <Select style={{ width: 120 }}>
                        {categories.map((cat) => (
                          <Option key={cat.id} value={cat.id}>
                            {cat.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item className="input-form-edit">
                      <Button htmlType="submit" type="primary">
                        Сохранить
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>
                    {item.name} — {item.price} ₽
                  </span>
                </div>
              )}
            </List.Item>
          )}
        />
      </TabPane>

      <TabPane
        key="3"
        tab={
          <span>
            <EditOutlined style={{ marginRight: 8 }} />
            Цены
          </span>
        }
      >
        <List
          bordered
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <Space>
                <span>{item.name}</span>
                <InputNumber
                  defaultValue={item.price}
                  min={0}
                  onChange={(val) => handlePriceChange(item.id, val)}
                />
                <Button  style={{
                      position: "absolute",
                      right: 8,
                      top: 10,
                      
                    }} type="primary" onClick={() => saveEditedPrice(item.id)}>
                  Сохранить цену
                </Button>
              </Space>
            </List.Item>
          )}
        />
      </TabPane>
    </Tabs>
  );
};

export default ProductManager;
