import React, { useContext, useEffect, useState } from "react";
import { Form, Input, Button, message, Tooltip, Popconfirm } from "antd";
import {
  CloseOutlined,
  CopyOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "../component/styles/Product.scss"; // Создай тут стили, объясню ниже
import { AuthContext } from "../store/AuthContext";

const apiUrl = "https://44899c88203381ec.mokky.dev/image";

const ImageGalleryManager = () => {
  const [images, setImages] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useContext(AuthContext);

  const fetchImages = async () => {
    try {
      const res = await axios.get(apiUrl);
      setImages(res.data.reverse());
    } catch (err) {
      console.error("Ошибка при загрузке изображений", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAdd = async (values) => {
    try {
      setLoading(true); // блокируем кнопку
      await axios.post(apiUrl, { url: values.url });
      message.success("Изображение добавлено");
      form.resetFields();
      fetchImages();
    } catch (err) {
      message.error("Не удалось добавить изображение");
    } finally {
      setLoading(false); // разблокируем
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Ссылка скопирована!");
    } catch {
      message.error("Не удалось скопировать");
    }
  };

  const deleteImg = async (id) => {
    await axios.delete(`${apiUrl}/${id}`);
    fetchImages();
  };

  return (
    <div className="image-gallery-wrapper">
      <p style={{ marginBottom: 5 }}>
        Загружено изображений: <b>{images.length}</b>
      </p>
      {isAuthenticated && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            name="url"
            rules={[{ required: true, message: "Введите URL изображения" }]}
          >
            <Input
              placeholder="https://example.com/image.jpg"
              style={{ width: 300 }}
              prefix={<PictureOutlined />}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
            >
              Добавить
            </Button>
          </Form.Item>
        </Form>
      )}

      <div className="image-grid">
        {images.map((img) => (
          <div key={img.id} className="image-card">
            <img src={img.url} alt="" className="image-preview" />
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(img.url)}
            />
            {isAuthenticated && (
              <Popconfirm
                key="delete"
                title="Удалить фото?"
                onConfirm={() => deleteImg(img.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button type="text" icon={<CloseOutlined />} />
              </Popconfirm>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGalleryManager;
