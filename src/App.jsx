import React, { useEffect, useState } from "react";
import { Button, Alert } from "antd";
import Product from "./component/Product";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
  // const [installPrompt, setInstallPrompt] = useState(null);
  // const [showInstallAlert, setShowInstallAlert] = useState(false);

  // useEffect(() => {
  //   // Проверяем, было ли уже показано уведомление
  //   const installShown = localStorage.getItem('installAlertShown');
  //   if (installShown !== 'false') { // Показываем, если не 'false'
  //     setShowInstallAlert(true);
  //   }

  //   // Регистрация Service Worker
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker
  //       .register('/serviceworker.js', { scope: '/' })
  //       .catch(error => {
  //         console.error('SW registration failed:', error);
  //       });
  //   }

  //   const handleBeforeInstallPrompt = (event) => {
  //     event.preventDefault();
  //     setInstallPrompt(event);
  //     window.deferredPrompt = event; // Сохраняем для других компонентов
  //   };

  //   const handleAppInstalled = () => {
  //     localStorage.setItem('installAlertShown', 'false');
  //     setInstallPrompt(null);
  //     delete window.deferredPrompt;
  //   };

  //   window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  //   window.addEventListener('appinstalled', handleAppInstalled);

  //   return () => {
  //     window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  //     window.removeEventListener('appinstalled', handleAppInstalled);
  //   };
  // }, []);

  // const handleInstallClick = () => {
  //   if (installPrompt) {
  //     installPrompt.prompt();
  //     installPrompt.userChoice.then(choiceResult => {
  //       if (choiceResult.outcome === 'accepted') {
  //         localStorage.setItem('installAlertShown', 'false');
  //       }
  //     });
  //   }
  // };

  // const handleAlertClose = () => {
  //   setShowInstallAlert(false);
  //   localStorage.setItem('installAlertShown', 'true'); // Пользователь закрыл алерт
  // };
  return (
    <div>
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      {/* Alert при первом открытии */}
      {/* {showInstallAlert && (
        <Alert
          message=""
          description="Установите приложение на телефон"
          type="info"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleInstallClick}>
              Установить
            </Button>
          }
          closable
          onClose={handleAlertClose}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            maxWidth: 400
          }}
        />
      )} */}

     
    </div>
  );
};

export default App;