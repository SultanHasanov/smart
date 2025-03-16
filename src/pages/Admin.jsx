import { useEffect, useState } from "react";
import { Button, Table, message, Modal, Form, Input, Select } from "antd";
import axios from "axios";
import InputMask from "react-input-mask";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

const API_URL = "https://1c298a0f688767c5.mokky.dev/items";

const Admin = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const tablesFilter = tables.filter((el) => el.name !== "");

  console.log({ tablesFilter });

  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      message.error("Нет доступа!");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchTables();
  }, []);

  const clearAllReservations = async (tablesFilter, fetchTables) => {
    Modal.confirm({
      title: "Вы уверены?",
      content: "Все брони будут удалены!",
      okText: "Да, удалить",
      cancelText: "Отмена",
      onOk: async () => {
        try {
          for (const table of tablesFilter) {
            await axios.patch(`${API_URL}/${table.id}`, {
              name: "",
              phone: "",
              time: "",
              people: "",
              reserved: false,
              pending: false,
            });
          }
          message.success("Все брони удалены!");
          fetchTables(); // Обновляем таблицу
        } catch (error) {
          message.error("Ошибка удаления броней!");
        }
      },
    });
  };
  

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      setTables(data);
    } catch (error) {
      message.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const updateTable = async (id, data) => {
    try {
      await axios.patch(`${API_URL}/${id}`, data);
      fetchTables();
    } catch (error) {
      message.error("Ошибка обновления данных");
    }
  };

  const updateTableWithConfirm = (id, data, actionText) => {
    Modal.confirm({
      title: `Вы уверены, что хотите ${actionText.toLowerCase()}?`,
      content: "Это действие нельзя отменить.",
      okText: "Да",
      cancelText: "Отмена",
      onOk: () => updateTable(id, data),
    });
  };

  const openModal = (table) => {
    if (table.reserved) return;
    setSelectedTable(table);
    setModalVisible(true);
  };

  const handleReserve = async (values) => {
    try {
      await axios.patch(`${API_URL}/${selectedTable.id}`, {
        name: values.name,
        phone: values.phone,
        time: values.time,
        people: values.people,
        reserved: true,
        pending: false,
      });
      message.success("Столик забронирован!");
      fetchTables();
    } catch (error) {
      message.error("Ошибка бронирования");
    }
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: "№", dataIndex: "id", key: "id" },
    { title: "Имя", dataIndex: "name", key: "name" },
    { title: "Телефон", dataIndex: "phone", key: "phone" },
    { title: "Время", dataIndex: "time", key: "time" },
    { title: "Человек", dataIndex: "people", key: "people" },
    {
      title: "Действие",
      key: "action",
      render: (_, record) =>
        record.pending ? (
          <>
            <Button
              type="primary"
              onClick={() =>
                updateTableWithConfirm(
                  record.id,
                  { reserved: true, pending: false },
                  "подтвердить бронь"
                )
              }
            >
              ✅ Подтвердить
            </Button>
            <Button
              danger
              onClick={() =>
                updateTableWithConfirm(
                  record.id,
                  { name: "", phone: "", time: "", people: "", pending: false },
                  "отклонить бронь"
                )
              }
            >
              ❌ Отклонить
            </Button>
          </>
        ) : record.reserved ? (
          <Button
            danger
            onClick={() =>
              updateTableWithConfirm(
                record.id,
                { name: "", phone: "", time: "", people: "", reserved: false },
                "отменить бронь"
              )
            }
          >
            🔄 Отменить
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="admin-container">
      <div style={{ position: "relative", width: "100%", padding: "10px" }}>
        <Button
          fill="none"
          style={{ marginLeft: -8 }}
          onClick={() => navigate("/")}
        >
          <ArrowLeftOutlined /> Назад
        </Button>

        <Button
          type="primary"
          style={{
            position: "absolute",
            top: 10,
            right: 20,
          }}
          onClick={() => {
            localStorage.removeItem("isAuthenticated");
            navigate("/");
          }}
        >
          Выйти
        </Button>
      </div>
      <div className="table-wrapper">
        <Table
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={tablesFilter}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSizeOptions: ["5", "10", "20", "30"], // Выбор количества строк
            showSizeChanger: true, // Позволяет менять число строк на странице
            defaultPageSize: 5, // Количество строк по умолчанию
            responsive: true,
          }}
        />
      </div>
      <div>
      <Button 
  type="dashed" 
  onClick={() => clearAllReservations(tablesFilter, fetchTables)} // Передаём tablesFilter!
>
  ❌ Удалить все брони
</Button>

      </div>

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
            Столик {table.id}
          </Button>
        ))}
      </div>

      <Modal
        title={`Бронирование столика №${selectedTable?.id}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleReserve}>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Введите имя" },
              { max: 10, message: "Имя должно содержать не более 10 символов" },
            ]}
          >
            <Input placeholder="Имя" />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[
              { message: "Введите телефон" },
              {
                pattern: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
                message: "Введите корректный номер телефона",
              },
            ]}
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
            rules={[
              { required: true, message: "Введите время" },
              {
                pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
                message: "Введите корректное время (чч:мм)",
              },
            ]}
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
  rules={[{ required: true, message: "Введите количество человек" }]}
>
  <Select
    placeholder="Количество человек"
    showSearch
    filterOption={false} // Позволяет вводить любое значение
    onSearch={(value) => {
      if (!isNaN(value) && value > 0) {
        form.setFieldsValue({ people: Number(value) });
      }
    }}
    onChange={(value) => form.setFieldsValue({ people: value })}
  >
    {[1, 2, 3, 4, 5, 6].map((num) => (
      <Select.Option key={num} value={num}>
        {num}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

          <Button type="primary" htmlType="submit">
            Забронировать
          </Button>
        </Form>
      </Modal>

      <style>
        {`
          .admin-container {
            padding: 20px;
          }

          .table-wrapper {
            overflow-x: auto;
            max-width: 100%;
          }

          .grid-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-top: 20px;
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

            .table-wrapper {
              font-size: 12px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Admin;
