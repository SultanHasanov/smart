import React, { useEffect, useState } from "react";
import { Button, notification } from "antd"; // Импортируем компоненты Ant Design
import Product from "./component/Product";
import Header from "./component/Header";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Логика для отображения кнопки установки
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Предотвращаем стандартное поведение
      e.preventDefault();
      setDeferredPrompt(e); // Сохраняем событие
      setShowInstallButton(true); // Показываем кнопку

      // Уведомление
      notification.info({
        message: "Установка приложения",
        description: "Для установки приложения нажмите кнопку ниже.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Функция для обработки нажатия на кнопку установки
  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Показываем диалог установки
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
          setDeferredPrompt(null); // Очищаем событие
          setShowInstallButton(false); // Скрываем кнопку
        });
    }
  };

  return (
    <div>
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      {showInstallButton && (
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

export default App;
