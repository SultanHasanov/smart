import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Select, message } from "antd";
import axios from "axios";
import InputMask from "react-input-mask";
import { useNavigate } from "react-router-dom";
import AdminPanelButton from "./component/AdminPanelButton";
import ButtonCard from "./component/ButtonCard";
import ReservationModal from "./component/ReservationModal";

const ADMIN_PHONE = "+79667283100";

const API_URL = "https://1c298a0f688767c5.mokky.dev/items";

const App = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      // console.log({data})
      setTables(data);
    } catch (error) {
      message.error("Ошибка загрузки столиков");
    } finally {
      setLoading(false);
    }
  };

  const sendToWhatsApp = async (values) => {
    // Извлекаем корзину из localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Формируем строку с выбранными блюдами и общей суммой
    let cartDetails = '';
    let totalAmount = 0;
  
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      cartDetails += `${item.name} x${item.quantity} = ${itemTotal} ₽\n`;
      totalAmount += itemTotal;
    });
  
    // Формируем сообщение для WhatsApp
    const whatsappMessage = `
      Запрос на бронь
      Столик №${selectedTable.id}
      Имя: ${values.name}
      Телефон: ${values.phone}
      Время: ${values.time}
      Человек: ${values.people}
  
      Ваши выбранные блюда:
      ${cartDetails}
      Общая сумма: ${totalAmount} ₽
    `;
  
    const whatsappURL = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(whatsappMessage)}`;
  
    window.open(whatsappURL, "_blank");
  
    try {
      await axios.patch(`${API_URL}/${selectedTable.id}`, {
        name: values.name,
        phone: values.phone,
        time: values.time,
        people: values.people,
        pending: true,
        timestamp: Date.now(), // Фиксируем время заявки
      });
  
      message.success("Запрос отправлен админу!");
      fetchTables();
    } catch (error) {
      message.error("Ошибка сохранения в API");
    }
  
    setModalVisible(false);
    form.resetFields();
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCountdowns = {};

      tables.forEach((table) => {
        if (table.pending && table.timestamp) {
          const elapsedSeconds = Math.floor((now - table.timestamp) / 1000);
          const remainingSeconds = 60 - elapsedSeconds;

          if (remainingSeconds > 0) {
            newCountdowns[table.id] = remainingSeconds;
          } else {
            // Если время вышло, удаляем заявку
            axios
              .patch(`${API_URL}/${table.id}`, {
                name: "",
                phone: "",
                time: "",
                people: "",
                reserved: false,
                pending: false,
              })
              .then(() => fetchTables());
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [tables]);

  return (
    <>
      <AdminPanelButton navigate={navigate} />
      

      <div className="grid-container">
        <ButtonCard
          tables={tables}
          setSelectedTable={setSelectedTable}
          setModalVisible={setModalVisible}
          countdowns={countdowns}
        />

        <ReservationModal
        selectedTable={selectedTable}
          sendToWhatsApp={sendToWhatsApp}
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
        />

        <style>
          {`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            padding: 20px;
          }

          .table-button {
            height: 100px;
          }

          @media (max-width: 768px) {
            .grid-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 480px) {
            .grid-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
        </style>
      </div>
    </>
  );
};

export default App;
