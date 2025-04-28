import React, { useEffect, useState } from "react";
import { Button, Modal, Alert } from "antd";
import Product from "./component/Product";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallAlert, setShowInstallAlert] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже показано уведомление
    const installShown = localStorage.getItem('installAlertShown');
    if (!installShown) {
      setShowInstallAlert(true);
      localStorage.setItem('installAlertShown', 'true');
    }

    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/serviceworker.js', { scope: '/' })
        .then((registration) => {
          registration.unregister().then((boolean) => {
            // Можно добавить логирование или другие действия
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Обработчик события beforeinstallprompt
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsModalVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
    setIsModalVisible(false);
  };

  const handleCancelInstall = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      {/* Модальное окно для установки PWA */}
      <Modal
        title="Установить приложение"
        visible={isModalVisible}
        onOk={handleInstallClick}
        onCancel={handleCancelInstall}
        okText="Установить"
        cancelText="Позже"
      >
        <p>Хотите установить это приложение на ваше устройство?</p>
        <p>Это позволит открывать его как обычное приложение и работать офлайн.</p>
      </Modal>

      {/* Alert при первом открытии */}
      {showInstallAlert && (
        <Alert
          message="Доступно как PWA"
          description="Вы можете установить это приложение на свое устройство для лучшего опыта использования."
          type="info"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary"
              onClick={() => {
                setShowInstallAlert(false);
                setIsModalVisible(true);
              }}
            >
              Установить
            </Button>
          }
          closable
          onClose={() => setShowInstallAlert(false)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            maxWidth: 400
          }}
        />
      )}
    </div>
  );
};

export default App;