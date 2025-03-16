import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Select, message } from "antd";
import axios from "axios";
import InputMask from "react-input-mask";
import { useNavigate } from "react-router-dom";

const API_URL = "https://1c298a0f688767c5.mokky.dev/items";
const ADMIN_PHONE = "+79667283100";
const ADMIN_PASSWORD = "0000"; // Пароль для входа в админку

const App = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [adminForm] = Form.useForm();
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

  const openModal = (table) => {
    if (table.reserved) return;
    setSelectedTable(table);
    setModalVisible(true);
  };

  const sendToWhatsApp = async (values) => {
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
      });

      message.success("Запрос отправлен админу!");
      fetchTables();
    } catch (error) {
      message.error("Ошибка сохранения в API");
    }

    setModalVisible(false);
    form.resetFields();
  };

  const handleAdminLogin = (values) => {
    if (values.password === ADMIN_PASSWORD) {
      localStorage.setItem("isAuthenticated", "true"); // Запоминаем вход
      message.success("Доступ разрешён");
      navigate("/admin");
    } else {
      message.error("Неверный пароль!");
    }
    setAdminModalVisible(false);
    adminForm.resetFields();
  };

  return (
    <>
      <Button
        type="primary"
        style={{ margin: 21 }}
        onClick={() => {
          const isAuthenticated =
            localStorage.getItem("isAuthenticated") === "true";
          if (isAuthenticated) {
            navigate("/admin"); // Если уже вошли, сразу перекидываем в админку
          } else {
            setAdminModalVisible(true); // Иначе открываем модалку с вводом пароля
          }
        }}
      >
        Админ панель
      </Button>

      <div className="grid-container">
        {tables.map((table) => (
          <Button
            key={table.id}
            className="table-button"
            style={{
              backgroundColor: table.reserved
                ? "gray"
                : table.pending
                ? "orange"
                : "green",
              color: "white",
            }}
            onClick={() => openModal(table)}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>Столик {table.id}</div>
              <div>{table.time !== "" ? table.time : null}</div>
            </div>
          </Button>
        ))}

        <Modal
          title="Запрос на бронирование"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={sendToWhatsApp}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Введите имя" }]}
            >
              <Input placeholder="Имя" />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[{ required: true, message: "Введите телефон" }]}
            >
              <InputMask mask="+7 (999) 999-99-99" maskChar={null}>
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    placeholder="Телефон"
                    inputMode="numeric"
                  />
                )}
              </InputMask>
            </Form.Item>
            <Form.Item
              name="time"
              rules={[{ required: true, message: "Введите время" }]}
            >
              <InputMask mask="99:99" maskChar={null}>
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    placeholder="Время (чч:мм)"
                    inputMode="numeric"
                  />
                )}
              </InputMask>
            </Form.Item>
            <Form.Item
              name="people"
              rules={[
                { required: true, message: "Введите количество человек" },
              ]}
            >
              <Select placeholder="Количество человек">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Select.Option key={num} value={num}>
                    {num}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Отправить админу
            </Button>
          </Form>
        </Modal>

        <Modal
          title="Введите пароль"
          open={adminModalVisible}
          onCancel={() => setAdminModalVisible(false)}
          footer={null}
        >
          <Form form={adminForm} onFinish={handleAdminLogin}>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password placeholder="Пароль" />
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Войти
            </Button>
          </Form>
        </Modal>

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
