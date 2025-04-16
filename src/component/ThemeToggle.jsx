import React, { useEffect } from "react";
import { Switch } from "antd";

const ThemeToggle = () => {
  const toggleTheme = (checked) => {
    document.body.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.body.classList.add("dark");
  }, []);

  return (
    <Switch
      onChange={toggleTheme}
      defaultChecked={localStorage.getItem("theme") === "dark"}
    />
  );
};

export default ThemeToggle;
