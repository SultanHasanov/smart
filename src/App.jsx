import React from "react";
import Product from "./component/Product";
import Header from "./component/Header";
import OfflineDetector from "./component/OfflineDetector";

const App = () => {
  return (
    <div>
      <OfflineDetector />
      <Product />
    </div>
  );
};

export default App;
