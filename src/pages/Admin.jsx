import { useEffect, useState } from "react";
import { Button, Table, message, Modal, Form, Input } from "antd";
import axios from "axios";
import InputMask from "react-input-mask";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteFilled,
  SettingFilled,
} from "@ant-design/icons";
import TimeSelect from "../TimeSelect";

const API_URL = "https://1c298a0f688767c5.mokky.dev/items";

const Admin = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const tablesFilter = tables.filter((el) => el.name !== "");

  // console.log({ tablesFilter });

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
    if (table.reserved || table.pending) return;
    setSelectedTable(table);
    setModalVisible(true);
  };

  const handleReserve = async (values) => {
    try {
      await axios.patch(`${API_URL}/${selectedTable.id}`, {
        name: values.name,
        time: values.time,
        people: values.people,
        reserved: true, // Ожидание подтверждения
        pending: false,
        timestamp: Date.now(), // Фиксируем время заявки
      });
      message.success("Заявка создана, ожидает подтверждения!");
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
    { title: "Время", dataIndex: "time", key: "time" },
    { title: "Кол-во", dataIndex: "people", key: "people" },
    {
      title: <SettingFilled />,
      key: "action",
      render: (_, record) =>
        record.pending ? (
          <>
            <button
              style={{
                padding: "8px 15px",
                backgroundColor: "transparent",
                marginRight: 10,
                color: "#f44336",
                border: "1px solid #f44336",
                borderRadius: "7px",
                cursor: "pointer",
              }}
              onClick={() =>
                updateTableWithConfirm(
                  record.id,
                  { name: "", time: "", people: "", pending: false },
                  "отклонить бронь"
                )
              }
            >
              <CloseOutlined />
            </button>
            <button
              style={{
                padding: "8px 15px",
                backgroundColor: "transparent",
                color: "#4CAF50",
                border: "1px solid #4CAF50",
                borderRadius: "7px",
                cursor: "pointer",
              }}
              onClick={() =>
                updateTableWithConfirm(
                  record.id,
                  { reserved: true, pending: false },
                  "подтвердить бронь"
                )
              }
            >
              <CheckOutlined />
            </button>
          </>
        ) : record.reserved ? (
          <DeleteFilled
            onClick={() =>
              updateTableWithConfirm(
                record.id,
                { name: "", time: "", people: "", reserved: false },
                "отменить бронь"
              )
            }
            style={{ color: "#f44336", cursor: "pointer", fontSize: "20px" }}
          />
        ) : null,
    },
  ];

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="admin-container">
      <div style={{ position: "relative", width: "100%", padding: "10px" }}>
        <Button
          fill="none"
          style={{ marginLeft: -8 }}
          onClick={() => navigate("/booking")}
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
      <div
        className="table-wrapper"
        style={tablesFilter.length === 0 ? { marginBottom: 10 } : undefined}
      >
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
      {tablesFilter.length > 0 && (
        <Button
          type="dashed"
          onClick={() => clearAllReservations(tablesFilter, fetchTables)}
        >
          ❌ Удалить все брони
        </Button>
      )}
      <TimeSelect />

      <div
        className="grid-container"
        style={tablesFilter.length === 0 ? { marginTop: 50 } : undefined}
      >
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 12,
                justifyContent: "space-between",
              }}
            >
              <div>
                <b>Столик: </b> №{table.id}
              </div>
              <div>
                <div>
                  {table.reserved && <b>Время: </b>}
                  {table.time !== "" ? table.time : null}
                </div>
                <div>
                  {table.reserved && <b>Имя: </b>}
                  {table.reserved && table.name}
                </div>
                <div>
                  {table.reserved && <b>Кол-во: </b>}
                  {table.reserved && table.people}
                </div>
              </div>
            </div>
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
              {
                max: 10,
                message: "Имя должно содержать не более 10 символов",
              },
            ]}
          >
            <Input placeholder="Имя" size="large" />
          </Form.Item>

          <Form.Item
            name="time"
            rules={[{ required: true, message: "Введите время" }]}
          >
            <InputMask mask="99:99" maskChar={null}>
              {(inputProps) => (
                <Input
                  size="large"
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
            <Input
              placeholder="Количество человек"
              size="large"
              inputMode="numeric"
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              style={{ width: "auto" }}
            >
              Отправить заявку
            </Button>
          </div>
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
