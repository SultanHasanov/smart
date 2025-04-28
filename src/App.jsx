import React, { useEffect, useState } from "react";
import Product from "./component/Product";
// import Header from "./component/Header";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
  useEffect(() => {
    // Регистрация Service Worker и обработка PWA установки
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

      // Обработчик события beforeinstallprompt
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        const installDiv = document.getElementById('divInstallApp');
        if (installDiv) {
          installDiv.innerHTML = '<button id="installApp" class="btn btn-outline-secondary ms-1">Установить приложение</button>';
          
          const installButton = document.getElementById('installApp');
          if (installButton) {
            installButton.addEventListener('click', () => {
              event.prompt();
              installDiv.innerHTML = "";
            });
          }
        }
      });
    }
  }, []);

  return (
    <div>
      {/* <Header /> */}
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      <div id="divInstallApp"></div>
    </div>
  );
};

export default App;
