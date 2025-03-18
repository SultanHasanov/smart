import axios from "axios";
import { message } from "antd";

export const API_URL = "https://1c298a0f688767c5.mokky.dev/items";
export const ADMIN_PHONE = "+79667283100";
export const ADMIN_PASSWORD = "0000";

// Функция для получения списка столиков
export const fetchTables = async () => {
  try {
    const { data } = await axios.get(API_URL);
    return data;
  } catch (error) {
    message.error("Ошибка загрузки столиков");
    return [];
  }
};

// Функция для отправки запроса на WhatsApp
export const sendToWhatsApp = async (values, selectedTable) => {
  const whatsappMessage = `Запрос на бронь\nСтолик №${selectedTable.id}\nИмя: ${values.name}\nТелефон: ${values.phone}\nВремя: ${values.time}\nЧеловек: ${values.people}`;
  const whatsappURL = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
    whatsappMessage
  )}`;

  window.open(whatsappURL, "_blank");

  try {
    await axios.patch(`${API_URL}/${selectedTable.id}`, {
      name: values.name,
      phone: values.phone,
      time: values.time,
      people: values.people,
      pending: true,
      timestamp: Date.now(),
    });

    message.success("Запрос отправлен админу!");
  } catch (error) {
    message.error("Ошибка сохранения в API");
  }
};

// Функция для обработки входа админа
export const handleAdminLogin = (values, navigate, setAdminModalVisible, form) => {
  if (values.password === ADMIN_PASSWORD) {
    localStorage.setItem("isAuthenticated", "true");
    message.success("Доступ разрешён");
    navigate("/admin");
  } else {
    message.error("Неверный пароль!");
  }
  setAdminModalVisible(false);
  form.resetFields();
};