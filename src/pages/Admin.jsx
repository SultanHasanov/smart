import React, { useContext, useEffect, useState } from "react";
import { Input, Button, Form, message, Tabs } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { AuthContext } from "../store/AuthContext";
import LogsViewer from "../component/LogsViewer";
import UserOrders from "../component/UserOrders";

const IS_AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === "true";

const PHONE_MASK = "+7 (999) 999-99-99";

const Login = () => {
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [regForm] = Form.useForm();
  const [loginForm] = Form.useForm();

  // For install button (existing)
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  useEffect(() => {
    const checkShouldShowButton = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const hasPrompt = !!window.deferredPrompt;
      const installShown = localStorage.getItem("installAlertShown");
      return !isStandalone && hasPrompt && installShown === "true";
    };
    setShowInstallBtn(checkShouldShowButton());
    const handleResize = () => setShowInstallBtn(checkShouldShowButton());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInstallClick = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          localStorage.setItem("installAlertShown", "false");
        }
      });
    }
  };

  // Login handler - same as yours but adapted to use form values from loginForm
  const handleLogin = async (values) => {
    if (IS_AUTH_DISABLED) {
      login("fake-token");
      message.success("Имитация авторизации успешна!");
      navigate("/favorites");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "https://chechnya-product.ru/api/login",
        {
          identifier: values.username,
          password: values.password,
        }
      );
      if (response.data.data.token) {
        login(response.data.data.token);
        message.success("Авторизация успешна!");
      }
    } catch (error) {
      message.error("Ошибка авторизации. Проверьте логин и пароль.");
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const handleRegister = async (values) => {
    // Validate phone: strip all except digits, expect +7XXXXXXXXXX (11 digits)
    const phoneDigits = values.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 11 || !phoneDigits.startsWith("7")) {
      message.error("Пожалуйста, введите корректный номер телефона.");
      return;
    }
    if (values.password.length < 6) {
      message.error("Пароль должен содержать не менее 6 символов.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://chechnya-product.ru/api/register", {
        phone: values.phone,
        password: values.password,
      });
      message.success("Регистрация прошла успешно! Теперь войдите в систему.");
      // Switch to login tab but keep form values intact
      setActiveTab("login");
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Ошибка регистрации. Попробуйте еще раз."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="login-container">
        <h2>Вы успешно авторизованы</h2>
        <Button size="large" type="primary" danger onClick={logout} block>
          Выйти
        </Button>

        {/* <LogsViewer/> */}
        <UserOrders/>
        {showInstallBtn && (
          <Button
            type="primary"
            onClick={handleInstallClick}
            style={{ margin: "16px 0" }}
          >
            Установить приложение
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="login-container" style={{ maxWidth: 400, margin: "auto" }}>
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        <Tabs.TabPane tab="Авторизация" key="login">
          <Form
            form={loginForm}
            name="login"
            onFinish={handleLogin}
            initialValues={{
              username: "",
              password: "",
            }}
            layout="vertical"
          >
            <Form.Item
              label="Логин"
              name="username"
              rules={[
                { required: true, message: "Пожалуйста, введите логин!" },
              ]}
            >
              <Input size="large" placeholder="Логин" />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: "Пожалуйста, введите пароль!" },
              ]}
            >
              <Input.Password size="large" placeholder="Пароль" />
            </Form.Item>

            <Form.Item>
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Регистрация" key="register">
          <Form
            form={regForm}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
          >
            <Form.Item
              label="Имя пользователя"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста, введите имя пользователя!",
                },
                {
                  min: 3,
                  message:
                    "Имя пользователя должно содержать не менее 3 символов",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Введите имя пользователя"
                maxLength={30}
              />
            </Form.Item>
            <Form.Item
              label="Номер телефона"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста, введите номер телефона!",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const digits = value.replace(/\D/g, "");
                    if (digits.length === 11 && digits.startsWith("7")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      "Номер должен содержать 11 цифр, начиная с 7"
                    );
                  },
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Введите номер телефона, например +7XXXXXXXXXX"
                maxLength={12}
              />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: "Пожалуйста, введите пароль!" },
                {
                  min: 6,
                  message: "Пароль должен содержать не менее 6 символов",
                },
              ]}
            >
              <Input.Password size="large" placeholder="Пароль" />
            </Form.Item>

            <Form.Item>
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Login;
