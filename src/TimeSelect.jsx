import React from "react";
import { Select } from "antd"; 
import { useTimeContext } from "./TimeContext";


const TimeSelect = () => {
  const { countdownTime, setCountdownTime, saveTime } = useTimeContext();



  const handleTimeChange = (value) => {
    const newTime = value * 60;  // Переводим в секунды
    setCountdownTime(newTime);
    saveTime(newTime);  // Отправляем обновленное время на сервер
  };

  return (
    <Select 
      value={countdownTime / 60}  // Конвертируем обратно в минуты для отображения в Select
      onChange={handleTimeChange} 
      style={{ width: 120, position: "absolute",  right: 30 }}
    >
      <Select.Option value={1}>1 минута</Select.Option>
      <Select.Option value={2}>2 минуты</Select.Option>
      <Select.Option value={5}>5 минут</Select.Option>
      <Select.Option value={10}>10 минут</Select.Option>
      <Select.Option value={15}>15 минут</Select.Option>
      <Select.Option value={20}>20 минут</Select.Option>
    </Select>
  );
};

export default TimeSelect;
