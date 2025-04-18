import React, { useContext, useState } from "react";
import { Input, Button, Form, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://chechnya-product.ru/api/login",
        {
          username: values.username,
          password: values.password,
        }
      );

      if (response.data.token) {
        login(response.data.token); // ✅ глобально обновит состояние
        message.success("Авторизация успешна!");
        navigate("/favorites");
      }
    } catch (error) {
      message.error("Ошибка авторизации. Проверьте логин и пароль.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // ✅ удалит токен и обновит глобальное состояние
    message.success("Вы вышли из системы.");
  };

  return (
    <div className="login-container">
      {!isAuthenticated ? (
        <Form
          name="login"
          onFinish={handleLogin}
          initialValues={{
            username: "",
            password: "",
          }}
        >
          <h2>Авторизация</h2>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Пожалуйста, введите логин!" }]}
          >
            <Input size="large" placeholder="Логин" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Пожалуйста, введите пароль!" }]}
          >
            <Input.Password size="large" placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <h2>Вы успешно авторизованы</h2>
          <Button size="large" type="primary" danger onClick={handleLogout} block>
            Выйти
          </Button>
        </div>
      )}
    </div>
  );
};

export default Login;
