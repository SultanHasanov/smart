import React, { useEffect, useState } from "react";
import { Alert } from "antd";
import axios from "axios";

const api = "https://44899c88203381ec.mokky.dev/banner";

const SiteBanner = () => {
  const [banner, setBanner] = useState(null);

//   useEffect(() => {
//     const fetchBanner = async () => {
//       try {
//         const res = await axios.get(api);
//         const now = Date.now();
//         const activeBanners = res.data.filter(
//           (b) => b.active && now < b.endTime
//         );
//         // берём только первый активный баннер, можно сделать и несколько
//         if (activeBanners.length > 0) {
//           setBanner(activeBanners[0]);
//         }
//       } catch {
//         console.error("Ошибка загрузки баннера");
//       }
//     };

//     fetchBanner();

//     // 🔁 обновлять каждые 30 секунд
//     const interval = setInterval(fetchBanner, 30 * 1000);
//     return () => clearInterval(interval);
//   }, []);

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
