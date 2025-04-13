import React, { useState, useEffect, useRef } from "react";
import { Input, Dropdown, Spin, List, Typography, message, Space } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const { Text } = Typography;
const DADATA_API_KEY = "a17c1b8db5c44bf264bf804062ffe577594171e5";

export default function AddressInput() {
  const [query, setQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  }, [query]);

  const fetchSuggestions = async (value) => {
    setLoading(true);
    try {
      const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Token ${DADATA_API_KEY}`
        },
        body: JSON.stringify({ query: value })
      });

      const result = await response.json();
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Ошибка при получении подсказок:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value) => {
    setQuery(value);
    setSelectedAddress(value);
    setSuggestions([]);
    console.log("Выбран адрес:", value);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedAddress);
      message.success("Адрес скопирован");
    } catch (err) {
      message.error("Не удалось скопировать");
    }
  };

  const dropdownContent = (
    <Spin spinning={loading} size="small">
      <List
        dataSource={suggestions}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: "pointer", padding: "8px 12px" }}
            onClick={() => handleSelect(item.value)}
          >
            {item.value}
          </List.Item>
        )}
        style={{
          maxHeight: 200,
          overflowY: "auto",
          borderRadius: 4,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      />
    </Spin>
  );

  return (
    <div style={{ width: "100%" }}>
      {selectedAddress && (
        <Space style={{ marginBottom: 8 }}>
          <Text strong>Выбранный адрес:</Text>
          <Text code>{selectedAddress}</Text>
          <CopyOutlined
            onClick={handleCopy}
            style={{ cursor: "pointer", color: "#1890ff" }}
            title="Скопировать адрес"
          />
        </Space>
      )}

      <Dropdown
        open={suggestions.length > 0}
        dropdownRender={() => dropdownContent}
        placement="bottomLeft"
      >
        <Input
          placeholder="Введите адрес"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          size="large"
        />
      </Dropdown>
    </div>
  );
}
