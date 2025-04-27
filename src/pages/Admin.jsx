import React, { useContext, useState, useEffect } from "react";
import { Input, Button, Form, message, notification } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";
const IS_AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === "true";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // Для отложенного предложения установки
  const [showInstallButton, setShowInstallButton] = useState(false); // Показывать кнопку установки
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    // Если авторизация отключена, имитируем успешный логин. Удалить в продакшене!
    if (IS_AUTH_DISABLED) {
      login("fake-token"); // 🔒 Имитируем логин
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
        login(response.data.data.token); // ✅ глобально обновит состояние
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

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Показываем пользовательский запрос для установки
      deferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            notification.success({
              message: "Успешно установлено",
              description: "Ваше приложение было установлено!",
            });
          } else {
            notification.error({
              message: "Отказ от установки",
              description: "Пользователь отклонил установку приложения.",
            });
          }
          setDeferredPrompt(null);
          setShowInstallButton(false);
        });
    }
  };

  // Проверка события установки
  useEffect(() => {
    const beforeInstallPromptHandler = (e) => {
      e.preventDefault(); // Останавливаем стандартное поведение браузера
      setDeferredPrompt(e); // Сохраняем ссылку на отложенное предложение
      setShowInstallButton(true); // Показываем кнопку для установки
    };

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);

    // Очистка после демонтирования компонента
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    };
  }, []);

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

      {/* Кнопка установки приложения, если не установлено */}
      {showInstallButton && !window.matchMedia('(display-mode: standalone)').matches && (
        <Button
          type="primary"
          size="large"
          onClick={handleInstall}
          style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}
        >
          Установить приложение
        </Button>
      )}
    </div>
  );
};

export default Login;
