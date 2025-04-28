import React, { useEffect, useState } from "react";
import { Button, Alert } from "antd";
import Product from "./component/Product";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallAlert, setShowInstallAlert] = useState(false);

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
    };

    // Проверка, если приложение уже установлено
    const handleAppInstalled = () => {
    
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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
    setShowInstallAlert(false);
  };

  return (
    <div>
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      {/* Alert при первом открытии */}
      {showInstallAlert && (
        <Alert
          message=""
          description="Установите приложение на телефон"
          type="info"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary"
              onClick={handleInstallClick}
            >
              Установить
            </Button>
          }
          closable
          onClose={() => setShowInstallAlert(false)}
          style={{
            position: 'fixed',
            top: 20,
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