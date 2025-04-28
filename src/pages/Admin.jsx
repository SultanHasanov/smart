import React, { useContext, useState, useEffect } from "react";
import { Input, Button, Form, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";
const IS_AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === "true";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка PWA-режима (уже установлено)
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    if (isInStandaloneMode()) {
      return;
    }

    // Проверяем сохранённый prompt в localStorage
    const savedPrompt = localStorage.getItem('deferredPrompt');
    if (savedPrompt) {
      setInstallPrompt(JSON.parse(savedPrompt));
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Сохраняем событие для последующего использования
      localStorage.setItem('deferredPrompt', JSON.stringify({
        prompt: () => e.prompt()
      }));
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      localStorage.removeItem('deferredPrompt');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    try {
      if (installPrompt.prompt) {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallPrompt(null);
          localStorage.removeItem('deferredPrompt');
        }
      } else if (installPrompt.prompt instanceof Function) {
        // Для сохранённого prompt из localStorage
        installPrompt.prompt();
      }
    } catch (error) {
      console.error('Ошибка при установке:', error);
    }
  };

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
        navigate("/favorites");
      }
    } catch (error) {
      message.error("Ошибка авторизации. Проверьте логин и пароль.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    message.success("Вы вышли из системы.");
  };

  return (
    <div className="login-container">
      {/* Кнопка установки приложения (отображается всегда, если доступна установка) */}
      {!installPrompt && (
        <Button 
          type="primary" 
          ghost
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
          onClick={handleInstallClick}
        >
          Установить приложение
        </Button>
      )}

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