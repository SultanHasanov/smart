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
  AutoComplete,
  Modal,
  Switch,
  Upload,
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
  ProfileOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import CategoryManager from "./CategoryManager";
import "../component/styles/Product.scss";
import PriceEditorTable from "./PriceEditorTable";
import OrderManager from "../pages/OrderManager";
import BannerManager from "./BannerManager";
import { observer } from "mobx-react-lite";
import { categoryStore } from "../store/categoryStore";
import { toJS } from "mobx";
import BulkProductUploader from "./BulkProductUploader";
import ProductListEditor from "./ProductListEditor";

const { Option } = Select;

const apiUrl = "https://chechnya-product.ru/api/admin/products";

const ProductManager = () => {
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [priceEdits, setPriceEdits] = useState({});
 
  const [activeTab, setActiveTab] = useState("1");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const [images, setImages] = useState([]);
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get("https://44899c88203381ec.mokky.dev/image");
        setImages(res.data);
      } catch (err) {
        console.error("Ошибка загрузки изображений:", err);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    categoryStore.fetchCategories();
  }, []);

  const categoriesTwo = toJS(categoryStore.categories);

  const fetchItems = async () => {
    const res = await axios.get("https://chechnya-product.ru/api/products");
    setItems(res?.data?.data.items || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (values) => {
    const token = localStorage.getItem("token");
    try{
      setIsLoading(true)

      await axios.post(apiUrl, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Товар добавлен");
      form.resetFields();
      fetchItems();
    setIsLoading(false)

    }
    catch (error){
      message.error(error.response.data.error);
    }
  };

  const handleUpdate = async (id, updatedValues) => {
    const token = localStorage.getItem("token"); // Use the correct token key
    try {
      await axios.put(`${apiUrl}/${id}`, updatedValues, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Товар обновлён");
      fetchItems();
      setEditingId(null);
    } catch (error) {
      // Enhanced error logging
      if (error.response) {
        message.error(error.response.data.error);
      } else {
        console.error("Request Error:", error.message);
        message.error("Ошибка обновления товара");
      }
    }
  };

  const handleDelete = async (id) => {
    // Получаем токен из localStorage или другого хранилища
    const token = localStorage.getItem("token"); // Используй правильный ключ для токена

    try {
      // Отправляем DELETE-запрос с токеном в заголовках
      await axios.delete(`${apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Добавляем токен в заголовок
        },
      });
      message.success("Товар удалён");
      fetchItems(); // Обновляем список товаров
    } catch (error) {
      message.error("Ошибка удаления товара");
      console.error(error);
    }
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
    { key: "5", label: "Заказы", icon: <ProfileOutlined /> },
    { key: "6", label: "Баннер", icon: <NotificationOutlined /> },
  ];

  const handleToggleAvailability = async (id) => {
    // Найти элемент с данным id
    const item = items.find((item) => item.id === id);

    if (item) {
      // Переключить доступность товара
      const updatedAvailability = !item.availability;

      // Создать объект обновленных значений
      const updatedValues = { ...item, availability: updatedAvailability };

      // Обновить товар через handleUpdate
      await handleUpdate(id, updatedValues);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "1":
        return (
          <>
            <h3>Добавить товар</h3>
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
  label="Загрузить фото"
  shouldUpdate={(prevValues, currentValues) => prevValues.url !== currentValues.url}
>
  {({ getFieldValue, setFieldsValue }) => {
    const url = getFieldValue("url");

    return url ? (
      <div
        style={{
          position: "relative",
          width: 120,
          height: 120,
          border: "1px solid #ccc",
          borderRadius: 8,
          overflow: "hidden",
          display: "inline-block",
        }}
      >
        <img
          src={url}
          alt="uploaded"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Button
          shape="circle"
          size="small"
          icon={<CloseOutlined />}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            background: "rgba(255,255,255,0.8)",
          }}
          onClick={async () => {
            const token = localStorage.getItem("token");
            const filename = url?.split("/")?.pop();

            if (!filename) {
              message.error("Невозможно определить имя файла");
              return;
            }

            try {
              await axios.delete(
                `https://chechnya-product.ru/api/admin/upload/${filename}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              message.success("Фото удалено");
              setFieldsValue({ url: null });
            } catch (err) {
              console.error(err);
              message.error("Ошибка удаления фото");
            }
          }}
        />
      </div>
    ) : (
      <Upload
        name="file"
        showUploadList={false}
        customRequest={async ({ file, onSuccess, onError }) => {
          const formData = new FormData();
          formData.append("image", file);

          try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
              "https://chechnya-product.ru/api/admin/upload",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const imageUrl =
              response.data?.url || response.data?.data?.url;
            if (!imageUrl)
              throw new Error("URL не найден в ответе");

            setFieldsValue({ url: imageUrl });
            message.success("Фото загружено");
            onSuccess("ok");
          } catch (err) {
            console.error("Ошибка загрузки:", err);
            message.error("Не удалось загрузить фото");
            onError(err);
          }
        }}
        accept="image/*"
      >
        <Button type="dashed">Загрузить фото</Button>
      </Upload>
    );
  }}
</Form.Item>


              <Form.Item
                className="input-form"
                name="url"
                label="URL"
                rules={[
                  {
                    required: true,
                    message: "Введите или выберите URL картинки",
                  },
                ]}
              >
                <AutoComplete
                  size="large"
                  options={images.map((img) => ({
                    value: img.url,
                    label: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <img
                          src={img.url}
                          alt="preview"
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #eee",
                          }}
                        />
                        <span style={{ fontSize: 12, wordBreak: "break-all" }}>
                          {img.url}
                        </span>
                      </div>
                    ),
                  }))}
                  filterOption={(inputValue, option) =>
                    option?.value
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                className="input-form"
                name="category_id"
                label="Категория"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  dropdownRender={(menu) => (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: 8,
                        }}
                      >
                        <Button
                          size="small"
                          type="link"
                          icon={<PlusOutlined />}
                          onClick={() => setCategoryModalOpen(true)}
                        >
                          Добавить категорию
                        </Button>
                      </div>
                      {menu}
                    </>
                  )}
                >
                  {categoriesTwo.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item className="input-form">
                <Button
                loading={isLoading}
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

            <BulkProductUploader />
          </>
        );

      case "2":
        return (
          <ProductListEditor
            items={items}
            editingId={editingId}
            setEditingId={setEditingId}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            handleToggleAvailability={handleToggleAvailability}
            categoriesTwo={categoriesTwo}
          />
        );

      case "3":
        return <PriceEditorTable />;

      case "4":
        return <CategoryManager />;
      case "5":
        return <OrderManager />;
      case "6":
        return <BannerManager />;

      default:
        return null;
    }
  };

  return (
    <div>
      <Button
        icon={<MenuOutlined />}
        type="dashed"
        style={{
          position: "fixed",
          right: 10,
          zIndex: 1000,
          fontSize: 20,
          padding: 20,
          top: 95,
        }}
        onClick={() => setDrawerVisible(true)}
      ></Button>

      <Drawer
        title="Меню"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        // width={250}
        styles={{
          body: { padding: 0 },
        }}
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
            <Menu.Item
              style={{ border: "0.5px dashed", marginBottom: 7 }}
              key={tab.key}
              icon={tab.icon}
            >
              {tab.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>

      <div style={{ marginTop: 10 }}>{renderTabContent()}</div>
      <Modal
        title="Новая категория"
        open={categoryModalOpen}
        onCancel={() => {
          setCategoryModalOpen(false);
          setNewCategoryName("");
        }}
        onOk={() => {
          categoryStore.addCategory(newCategoryName);
          setNewCategoryName("");
          setCategoryModalOpen(false);
        }}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название категории"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default observer(ProductManager);
