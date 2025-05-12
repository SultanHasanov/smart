import React, { useState } from "react";
import { Upload, Button, Table, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const BulkProductUploader = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

 const columns = [
  { title: "Название", dataIndex: "name", key: "name" },
  { title: "Цена", dataIndex: "price", key: "price" },
  {
    title: "Ссылка",
    dataIndex: "url",
    key: "url",
    render: (text) =>
      text ? (
        <a href={text} target="_blank" rel="noopener noreferrer">
          Открыть
        </a>
      ) : (
        "-"
      ),
  },
  { title: "Категория", dataIndex: "category_id", key: "category_id" },
];


  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const rows = parsedData.slice(1).map((row) => {
        const product = {
          name: row[0],
          price: Number(row[1]),
          url: row[2],
        };
        if (row[3] !== undefined && row[3] !== null && row[3] !== "") {
          product.category_id = Number(row[3]);
        }
        return product;
      });

      setProducts(rows);
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleSubmit = async () => {
    if (products.length === 0) {
      return message.warning("Нет данных для загрузки");
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://chechnya-product.ru/api/admin/products/bulk",
        products,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      message.success("Товары успешно добавлены");
      setProducts([]);
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);
      message.error("Ошибка при добавлении товаров");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Upload beforeUpload={handleFileUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Загрузить Excel</Button>
      </Upload>

      {products.length > 0 && (
        <>
          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <Table
              dataSource={products.map((p, i) => ({ ...p, key: i }))}
              columns={columns}
              pagination={false}
              bordered
              scroll={{ x: "max-content" }}
            />
          </div>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            style={{ marginTop: 16 }}
            block
          >
            Добавить все товары
          </Button>
        </>
      )}
    </div>
  );
};

export default BulkProductUploader;
