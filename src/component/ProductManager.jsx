import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  List,
  Popconfirm,
  message,
  Space,
  Drawer,
  Menu,
} from "antd";
import axios from "axios";
import {
  AppstoreAddOutlined,
  CloseOutlined,
  DeleteFilled,
  EditOutlined,
  MenuOutlined,
  DollarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CategoryManager from "./CategoryManager";
import "../component/styles/Product.scss";
import PriceEditorTable from "./PriceEditorTable";

const { Option } = Select;

const apiUrl = "https://44899c88203381ec.mokky.dev/items";

const ProductManager = () => {
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [priceEdits, setPriceEdits] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://44899c88203381ec.mokky.dev/categories"
        );
        setCategories(res.data);
        if (res.data.length > 0 && !selectedCategory) {
          setSelectedCategory(res.data[0].id);
        }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error);
      }
    };
    fetchCategories();
  }, []);

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

  const tabItems = [
    { key: "1", label: "Добавить товар", icon: <PlusOutlined /> },
    { key: "2", label: "Товары", icon: <EditOutlined /> },
    { key: "3", label: "Цены", icon: <DollarOutlined /> },
    { key: "4", label: "Категории", icon: <AppstoreAddOutlined /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "1":
        return (
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
        );

      case "2":
        return (
          <List
            className="custom-list"
            bordered
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                actions={
                  editingId === item.id
                    ? []
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
                          <DeleteFilled
                            style={{ color: "red", fontSize: 20 }}
                          />
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
                        paddingRight: 24,
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
        );

      case "3":
        return <PriceEditorTable />;

      case "4":
        return <CategoryManager />;

      default:
        return null;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <Button
        icon={<MenuOutlined />}
        type="default"
        style={{ position: "absolute", top: -50, right: 0, zIndex: 1000 }}
        onClick={() => setDrawerVisible(true)}
      >
        Меню
      </Button>

      <Drawer
        title="Меню"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            setActiveTab(key);
            setDrawerVisible(false);
          }}
        >
          {tabItems.map((tab) => (
            <Menu.Item key={tab.key} icon={tab.icon}>
              {tab.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>

      <div style={{ marginTop: 64 }}>{renderTabContent()}</div>
    </div>
  );
};

export default ProductManager;
