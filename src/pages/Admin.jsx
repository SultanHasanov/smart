import React, { useState, useEffect } from "react";
import { Tabs, Form, Input, Button, message } from "antd";
import InputMask from "react-input-mask";
import FileUpload from "../component/FileUpload";

const { TabPane } = Tabs;

const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  // Функция для получения токена из localStorage
  const getToken = () => localStorage.getItem("authToken");

  // Автоматическая авторизация при загрузке компонента
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserData(token); // Загружаем данные пользователя при наличии токена
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const userRes = await fetch("https://44899c88203381ec.mokky.dev/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await userRes.json();
      setUserData(userData[0]); // Предполагается, что первый пользователь — это авторизованный
      setIsAuthenticated(true);
    } catch (err) {
      message.error("Ошибка при получении данных пользователя.");
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("https://44899c88203381ec.mokky.dev/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.phone, // Телефон отправляем как email
          password: values.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка регистрации");

      message.success("Регистрация успешна!");
    } catch (err) {
      message.error("Такой пользователь уже существует!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("https://44899c88203381ec.mokky.dev/auth", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.phone, // Телефон отправляем как email
          password: values.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка авторизации");

      // Сохраняем токен в localStorage
      localStorage.setItem("authToken", data.token);

      // Fetch user data after successful login
      fetchUserData(data.token);

      setIsAuthenticated(true); // User is authenticated
      message.success("Вы успешно вошли!");
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const PhoneInput = ({ value, onChange }) => (
    <InputMask mask="+7 (999) 999-99-99" value={value} onChange={onChange}>
      {(inputProps) => <Input size="large" {...inputProps} placeholder="+7 (___) ___-__-__" />}
    </InputMask>
  );

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Удаляем токен из localStorage
    localStorage.removeItem('uploadedImageUrl');
    setIsAuthenticated(false);
    setUserData(null);
    message.success("Вы вышли из системы.");
  };

  if (isAuthenticated && userData) {
    return (
      <div>
        <h2>Данные пользователя</h2>
        <p><strong>Имя:</strong> {userData.fullName}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>ID:</strong> {userData.id}</p>
        <Button onClick={handleLogout}>Выйти</Button>
        <FileUpload/>
      </div>
    );
  }

  return (
    <Tabs defaultActiveKey="login" centered>
      <TabPane tab="Вход" key="login">
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Телефон"
            name="phone"
            rules={[{ required: true, message: "Введите номер телефона" }]}
          >
            <PhoneInput />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password size="large" placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" block loading={loading}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </TabPane>

      <TabPane tab="Регистрация" key="register">
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Имя и фамилия"
            name="fullName"
            rules={[{ required: true, message: "Введите ФИО" }]}
          >
            <Input size="large" placeholder="Иван Иванов" />
          </Form.Item>

          <Form.Item
            label="Телефон"
            name="phone"
            rules={[{ required: true, message: "Введите номер телефона" }]}
          >
            <PhoneInput />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password size="large" placeholder="Придумайте пароль" />
          </Form.Item>

          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" block loading={loading}>
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
      </TabPane>
    </Tabs>
  );
};

export default AuthForm;
