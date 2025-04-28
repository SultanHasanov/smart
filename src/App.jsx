import React, { useEffect, useState } from "react";
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

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Установлено ✅");
        } else {
          console.log("Отклонено ❌");
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };


  return (
    <div>
      {/* <Header /> */}
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />

      <div>
      {showInstallButton && (
        <button onClick={handleInstallClick} style={{ position: "fixed", bottom: 20, right: 20 }}>
          Установить приложение
        </button>
      )}
      {/* твои компоненты */}
    </div>
    </div>
  );
};

export default App;
