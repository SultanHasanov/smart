import React, { useState, useEffect, useRef } from "react";
import {
  Input,
  Dropdown,
  Spin,
  List,
  Typography,
  message,
  Space,
  Button,
  Tooltip,
} from "antd";
import {
  CopyOutlined,
  CompassOutlined,
  CloseOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const DADATA_API_KEY = "a17c1b8db5c44bf264bf804062ffe577594171e5";

const WAREHOUSE_COORDS = {
  lat: 43.267708, 
  lon: 45.263771,
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function AddressInput({
  query,
  setQuery,
  suggestions,
  setSuggestions,
  onDropdownOpenChange,
}) {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query || hasSelected) {
      setSuggestions([]);
      onDropdownOpenChange?.(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    onDropdownOpenChange?.(true);
  }, [query, hasSelected]);

  const fetchSuggestions = async (value) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${DADATA_API_KEY}`,
          },
          body: JSON.stringify({ query: value }),
        }
      );

      const result = await response.json();
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Ошибка при получении подсказок:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setHasSelected(false);
    setCoordinates(null);
    setDistanceKm(null);
  };

  const handleSelect = (value) => {
    const selected = suggestions.find((item) => item.value === value);
    setQuery(value);
    setSelectedAddress(value);
    setHasSelected(true);

    if (selected?.data?.geo_lat && selected?.data?.geo_lon) {
      const lat = parseFloat(selected.data.geo_lat);
      const lon = parseFloat(selected.data.geo_lon);
      setCoordinates({ lat, lon });

      const dist = calculateDistance(
        WAREHOUSE_COORDS.lat,
        WAREHOUSE_COORDS.lon,
        lat,
        lon
      );
      setDistanceKm(dist);
    }

    setSuggestions([]);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedAddress);
      message.success("Адрес скопирован");
    } catch (err) {
      message.error("Не удалось скопировать");
    }
  };

  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} м`;
    }
    return `${km.toFixed(1)} км`;
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
  const isDropdownOpen = suggestions.length > 0;

  return (
    <div style={{ width: "100%" }}>
      {selectedAddress && (
        <Space direction="vertical" style={{ marginBottom: 18, width: "100%" }}>
          <Text strong>Выбранный адрес:</Text>
          <Space style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Space>
              <Text code>{selectedAddress}</Text>
              <CopyOutlined
                onClick={handleCopy}
                style={{ cursor: "pointer", color: "#1890ff" }}
                title="Скопировать адрес"
              />
            </Space>
            {coordinates && (
              <Tooltip title="Открыть маршрут в Яндекс.Картах">
                <CompassOutlined
                  style={{ fontSize: 20, color: "#fa8c16", cursor: "pointer" }}
                  onClick={() => {
                    window.open(
                      `https://yandex.ru/maps/?rtext=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lon}~${coordinates.lat},${coordinates.lon}&rtt=auto`,
                      "_blank"
                    );
                  }}
                />
              </Tooltip>
            )}
          </Space>

          {distanceKm !== null && (
            <Space
              style={{
                background: "#f0f5ff",
                border: "1px solid #adc6ff",
                padding: "8px 12px",
                borderRadius: 8,
                marginTop: 6,
                alignItems: "center",
              }}
            >
              <EnvironmentOutlined style={{ color: "#2f54eb" }} />
              <Text style={{ fontSize: 16, color: "#2f54eb" }}>
                Расстояние: <b>{formatDistance(distanceKm)}</b>
              </Text>
            </Space>
          )}
        </Space>
      )}

      <Dropdown
        open={suggestions.length > 0}
        dropdownRender={() => dropdownContent}
        placement="bottomLeft"
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        align={{
          points: ["tl", "bl"],
          overflow: { adjustY: false, adjustX: false },
        }}
      >
         <div style={{ position: "relative", marginBottom: isDropdownOpen ? 210 : 10 }}>

          <Input
            placeholder="Введите адрес"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHasSelected(false);
            }}
            autoComplete="off"
            size="large"
          />
          {query && (
            <Button
              icon={<CloseOutlined />}
              onClick={handleClear}
              size="small"
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "red",
              }}
            />
          )}
        </div>
      </Dropdown>
    </div>
  );
}
