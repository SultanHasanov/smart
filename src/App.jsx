import React, { useEffect } from "react";
import Product from "./component/Product";
import Header from "./component/Header";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {

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
  
  return (
    <div>
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal/>
    </div>
  );
};

export default App;
