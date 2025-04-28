import React, { useEffect, useState } from "react";
import { Button } from "antd";
import Product from "./component/Product";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже показано уведомление
    const installShown = localStorage.getItem('installAlertShown');
    
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
      
      // Показываем alert только при первом посещении
      if (!installShown) {
        alert('Вы можете установить это приложение на свое устройство для лучшего опыта использования!');
        localStorage.setItem('installAlertShown', 'true');
      }
      
      setShowInstallBanner(true);
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
          setShowInstallBanner(false);
        }
      });
    }
  };

  return (
    <div>
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      {/* Баннер для установки PWA */}
      {showInstallBanner && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          padding: '10px 16px',
          backgroundColor: '#fff',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>Установить приложение?</span>
          <Button 
            type="primary" 
            size="small"
            onClick={handleInstallClick}
          >
            Установить
          </Button>
          <Button 
            size="small"
            onClick={() => setShowInstallBanner(false)}
          >
            Позже
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;