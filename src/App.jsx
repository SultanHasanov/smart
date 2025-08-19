import React, { useEffect, useState } from "react";
import { Button, Alert } from "antd";
import Product from "./component/Product";
import OfflineDetector from "./component/OfflineDetector";
import DevTerminal from "./component/DevTerminal";
import SiteBanner from "./component/SiteBanner";
import axios from "axios";

const App = () => {
  return (
    <div>
      <OfflineDetector />
      <SiteBanner />
      <Product />
      <DevTerminal />
    </div>
  );
};

export default App;
