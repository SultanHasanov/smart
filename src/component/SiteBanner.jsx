import React, { useEffect, useState } from "react";
import { Alert } from "antd";
import axios from "axios";

const api = "https://44899c88203381ec.mokky.dev/banner";

const SiteBanner = () => {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
   const fetchBanner = async () => {
    try {
      const res = await axios.get(api);
      console.log("Полученные данные:", res.data);
      console.log("Статус ответа:", res.status);
      
      const now = Date.now();
      const activeBanners = res.data.filter(
        (b) => b.active && now < b.endTime
      );
      
      console.log("Активные баннеры:", activeBanners);
      
      if (activeBanners.length > 0) {
        setBanner(activeBanners[0]);
      } else {
        console.log("Нет активных баннеров");
      }
    } catch (error) {
      console.error("Ошибка загрузки баннера:", error);
    }
  };

  fetchBanner();

    // 🔁 обновлять каждые 30 секунд
    const interval = setInterval(fetchBanner, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!banner) return null;

  return (
    <Alert
      message="Объявление"
      description={banner.text}
      type={banner.type || "warning"} // использует тип из данных баннера
      showIcon
      banner
      style={{ textAlign: "center", fontSize: 16 }}
    />
  );
};

export default SiteBanner;
