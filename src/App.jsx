import React, { useEffect, useState } from "react";
import { Button } from "antd"; 
import Product from "./component/Product";
// import Header from "./component/Header";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("Пользователь установил приложение");
      } else {
        console.log("Пользователь отказался от установки");
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <div>
      {/* <Header /> */}
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      {showInstallButton && (
        <Button
          type="primary"
          size="large"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
          onClick={handleInstallClick}
        >
          Установить приложение
        </Button>
      )}
    </div>
  );
};

export default App;
