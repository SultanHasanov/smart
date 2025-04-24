import React from "react";
import Product from "./component/Product";
import Header from "./component/Header";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";

const App = () => {
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
