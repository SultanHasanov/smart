import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, message, Typography } from "antd";
import InputMask from "react-input-mask";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const ReservationModal = ({ modalVisible, setModalVisible, sendToWhatsApp, selectedTable }) => {
  const [form] = Form.useForm();
  const [cart, setCart] = useState([]);

  const navigate = useNavigate();

  // Функция для извлечения данных корзины из localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Функция для вычисления общей суммы корзины
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleFinish = async (values) => {
    await sendToWhatsApp(values);
    
    // Очистка localStorage и состояния корзины
    localStorage.removeItem("cart");
    setCart([]);
    
    // Очистка формы
    form.resetFields();
    
    // Закрытие модального окна
    setModalVisible(false);
  };

  return (
    <Modal
      title={`Запрос на бронь столика №${selectedTable?.id}`}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
    >
      <Form form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          rules={[
            { required: true, message: "Введите имя" },
            { max: 10, message: "Имя должно содержать не более 10 символов" },
          ]}
        >
          <Input placeholder="Имя" size="large" />
        </Form.Item>

        <Form.Item
          name="phone"
          rules={[{ required: true, message: "Введите телефон" }]}
        >
          <InputMask mask="+7 (999) 999-99-99" maskChar={null}>
            {(inputProps) => (
              <Input {...inputProps} size="large" placeholder="Телефон" inputMode="numeric" />
            )}
          </InputMask>
        </Form.Item>

        <Form.Item
          name="time"
          rules={[{ required: true, message: "Введите время" }]}
        >
          <InputMask mask="99:99" maskChar={null}>
            {(inputProps) => (
              <Input {...inputProps} size="large" placeholder="Время (чч:мм)" inputMode="numeric" />
            )}
          </InputMask>
        </Form.Item>

        <Form.Item
          name="people"
          rules={[{ required: true, message: "Введите количество человек" }]}
        >
          <Select size="large" placeholder="Количество человек" showSearch filterOption={false}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <Select.Option key={num} value={num}>
                {num}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Отображение выбранных товаров и их стоимости */}
        <div style={{ marginTop: '10px' }}>
          <h3>Выбранные блюда:</h3>
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} >
                <Text style={{fontSize: 13}}>{item.name} x{item.quantity} = {item.price * item.quantity} ₽</Text>
              </div>
            ))
          ) : (
            <Text>Корзина пуста</Text>
          )}

          <div style={{ marginTop: '10px', display: "flex", justifyContent: "space-between" }}>
            <Text strong>Итоговая стоимость: {calculateTotal()} ₽</Text>
          <Button danger onClick={() => navigate("/")}>Добавить еще товар</Button>
          </div>
        </div>

        <Button size="large" type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
          Отправить админу
        </Button>
      </Form>
    </Modal>
  );
};

export default ReservationModal;
