import React, { useState } from "react";
import { Button, Form, Input, message, Modal } from "antd";

const ADMIN_PASSWORD = "0000"; // Пароль для входа в админку

const AdminPanelButton = ({ navigate }) => {
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  const [adminForm] = Form.useForm();

  const handleAdminLogin = (values) => {
    if (values.password === ADMIN_PASSWORD) {
      localStorage.setItem("isAuthenticated", "true"); // Запоминаем вход
      message.success("Доступ разрешён");
      navigate("/admin");
    } else {
      message.error("Неверный пароль!");
    }
    setAdminModalVisible(false);
    adminForm.resetFields();
  };

  const handleAdminPanelClick = () => {
    const isAuthenticated =
            localStorage.getItem("isAuthenticated") === "true";
          if (isAuthenticated) {
            navigate("/admin"); // Если уже вошли, сразу перекидываем в админку
          } else {
            setAdminModalVisible(true); // Иначе открываем модалку с вводом пароля
          }
  };

  return (
    <>
       <Button
        type="primary"
        style={{ margin: 21 }}
        onClick={handleAdminPanelClick}
      >
        Админ панель
      </Button>

      <Modal
        title="Введите пароль"
        open={adminModalVisible}
        onCancel={() => setAdminModalVisible(false)}
        footer={null}
      >
        <Form form={adminForm} onFinish={handleAdminLogin}>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Войти
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default AdminPanelButton;
