import React, { useEffect, useState } from "react";
import { Table, InputNumber, Button, message } from "antd";
import axios from "axios";
import "./styles/Product.scss"; // для кастомных стилей

const apiUrl = "https://44899c88203381ec.mokky.dev/items";

const PriceEditorTable = () => {
  const [items, setItems] = useState([]);
  const [editedPrices, setEditedPrices] = useState({});

  const fetchItems = async () => {
    const res = await axios.get(apiUrl);
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handlePriceChange = (id, newPrice) => {
    setEditedPrices((prev) => ({
      ...prev,
      [id]: newPrice
    }));
  };

  const handleSave = async () => {
    const updates = Object.entries(editedPrices);
    if (updates.length === 0) {
      message.info("Нет изменений для сохранения");
      return;
    }

    try {
      await Promise.all(
        updates.map(([id, price]) =>
          axios.patch(`${apiUrl}/${id}`, { price })
        )
      );
      message.success("Цены обновлены");
      setEditedPrices({});
      fetchItems();
    } catch (err) {
      message.error("Ошибка при сохранении цен");
    }
  };

  const handleReset = () => {
    setEditedPrices({});
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Цена (₽)",
      dataIndex: "price",
      key: "price",
      render: (price, record) => {
        const currentValue = editedPrices[record.id] ?? price;
        const isEdited = editedPrices.hasOwnProperty(record.id);
        return (
          <InputNumber
            min={0}
            value={currentValue}
            onChange={(value) => handlePriceChange(record.id, value)}
            style={isEdited ? { borderColor: "#faad14" } : {}}
          />
        );
      }
    }
  ];

  const rowClassName = (record) =>
    editedPrices.hasOwnProperty(record.id) ? "edited-row" : "";

  return (
    <div>
      <h3>Редактирование цен</h3>
      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <Button type="primary" onClick={handleSave}>
          Сохранить все
        </Button>
        <Button onClick={handleReset} danger>
          Сбросить изменения
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        rowClassName={rowClassName}
        pagination={false}
      />
    </div>
  );
};

export default PriceEditorTable;
