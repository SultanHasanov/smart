import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";

const API_URL = "https://1c298a0f688767c5.mokky.dev/time";

// Создаем контекст
const TimeContext = createContext();

// Провайдер контекста
export const TimeProvider = ({ children }) => {
  const [countdownTime, setCountdownTime] = useState(null); // По умолчанию 2 минуты (120 секунд)
  const [countdowns, setCountdowns] = useState({});

  // Функция сохранения времени в API
  const saveTime = async (newTime) => {
    try {
      const response = await axios.get(API_URL); // Получаем текущие данные
      if (response.data.length > 0) {
        const updatedData = [{ countdownTime: newTime }]; // Обновляем первый объект
        await axios.patch(API_URL, updatedData, {
          headers: { "Content-Type": "application/json" },
        });
        message.success("Время обновлено!");
      } else {
        message.error("Ошибка: нет данных в API");
      }
    } catch (error) {
      console.error("Ошибка сохранения времени на сервере", error);
      message.error("Не удалось обновить время");
    }
  };
  
  // Получение времени из API при загрузке
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data.length > 0) {
          setCountdownTime(response.data[0].countdownTime);
        }
      } catch (error) {
        console.error("Ошибка загрузки времени", error);
      }
    };
    fetchTime();
  }, []);

  return (
    <TimeContext.Provider value={{ countdownTime, setCountdownTime, saveTime, countdowns, setCountdowns }}>
      {children}
    </TimeContext.Provider>
  );
};

// Кастомный хук для использования контекста
export const useTimeContext = () => {
  return useContext(TimeContext);
};
