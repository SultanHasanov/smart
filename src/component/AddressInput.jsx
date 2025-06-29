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
  Card,
  Row,
  Col,
  Statistic,
  Checkbox,
} from "antd";
import {
  CopyOutlined,
  CompassOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
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
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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
  const [showSaveOption, setShowSaveOption] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);
  const debounceRef = useRef(null);
  console.log(query)

  useEffect(() => {
    fetchDefaultAddress();
  }, []);
  const token = localStorage.getItem("token");
  const fetchDefaultAddress = async () => {
    try {
      const res = await fetch("https://chechnya-product.ru/api/me/address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data.data?.address);
      if (data.data?.address) {
        handleSelect(data.data.address, true);
      }
    } catch (error) {
      console.error("Ошибка при загрузке адреса:", error);
    }
  };

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
    setSelectedAddress("");
    setShowSaveOption(false);
    setSaveChecked(false);
  };

const handleSelect = (value, isDefault = false) => {
  let selected = suggestions.find((item) => item.value === value);

  // Если адрес не из подсказок — вызвать dadata API вручную
  const fetchFromDadata = async () => {
    try {
      const res = await fetch(
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
      const data = await res.json();
      selected = data.suggestions?.[0];
      if (!selected) return;

      processSelection(selected);
    } catch (e) {
      console.error("Не удалось получить координаты:", e);
    }
  };

  const processSelection = (selectedItem) => {
    const lat = parseFloat(selectedItem?.data?.geo_lat) || null;
    const lon = parseFloat(selectedItem?.data?.geo_lon) || null;
    setSelectedAddress(selectedItem.value);
    setQuery(selectedItem.value);
    setHasSelected(true);
    setSuggestions([]);
    setShowSaveOption(!isDefault);

    if (lat && lon) {
      setCoordinates({ lat, lon });
      const dist = calculateDistance(
        WAREHOUSE_COORDS.lat,
        WAREHOUSE_COORDS.lon,
        lat,
        lon
      );
      setDistanceKm(dist);
    }
  };

  if (!selected) {
    fetchFromDadata(); // если нет в suggestions — запрашиваем заново
  } else {
    processSelection(selected);
  }
};


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedAddress);
      message.success("Адрес скопирован");
    } catch (err) {
      message.error("Не удалось скопировать");
    }
  };

  const handleSaveAddress = async (checked) => {
    setSaveChecked(checked);
    if (!checked) return;
    try {
      const res = await fetch("https://chechnya-product.ru/api/me/address", {

        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: selectedAddress }),
      });
      if (!res.ok) throw new Error("Ошибка при сохранении");
      message.success("Адрес сохранён");
    } catch (error) {
      console.error("Ошибка при сохранении адреса:", error);
      message.error("Не удалось сохранить адрес");
    }
  };

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} м`;
    return `${km.toFixed(1)} км`;
  };

  const calculateDeliveryPrice = (km) => {
    const pricePerKm = 25;
    const minimumPrice = 50;
    const total = km * pricePerKm;
    return Math.max(minimumPrice, Math.round(total));
  };

  const calculateDeliveryTime = (km) => {
    const averageSpeed = 40;
    const baseTime = 10;
    const additionalTime = (km / averageSpeed) * 60;
    return Math.round(baseTime + additionalTime);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours} ч ${mins} мин`;
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return `${days} дн ${restHours} ч ${mins} мин`;
  };

  const deliveryPrice =
    distanceKm !== null ? calculateDeliveryPrice(distanceKm) : null;
  const deliveryTime =
    distanceKm !== null ? calculateDeliveryTime(distanceKm) : null;

  const dropdownContent = (
    <div
      style={{
        maxHeight: 200,
        overflowY: "auto",
        padding: 0,
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      onTouchStart={(e) => e.stopPropagation()}
    >
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
        />
      </Spin>
    </div>
  );

  const isDropdownOpen = suggestions.length > 0;

  return (
    <div style={{ width: "100%" }}>
      {selectedAddress && (
        <Card
          size="small"
          style={{ marginBottom: 16, borderRadius: 8 }}
          // bodyStyle={{ padding: 12 }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <Text strong>{selectedAddress}</Text>
            </div>

            {/* {distanceKm !== null && (
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Расстояние"
                    value={formatDistance(distanceKm)}
                    prefix={<EnvironmentOutlined />}
                    valueStyle={{ color: "#1890ff", fontSize: 14 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Стоимость"
                    value={deliveryPrice}
                    prefix={<DollarOutlined />}
                    suffix="₽"
                    valueStyle={{ color: "#52c41a", fontSize: 14 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Время доставки"
                    value={formatTime(deliveryTime)}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: "#fa8c16", fontSize: 14 }}
                  />
                </Col>
              </Row>
            )} */}
            {showSaveOption && (
              <Checkbox
                checked={saveChecked}
                onChange={(e) => handleSaveAddress(e.target.checked)}
              >
                Сохранить этот адрес по умолчанию
              </Checkbox>
            )}
          </Space>

          {/* <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 4,
              marginTop: 20,
            }}
          >
            <Tooltip title="Скопировать адрес">
              <Button
                type="text"
                size="small"
                onClick={handleCopy}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <CopyOutlined style={{ fontSize: 18, color: "#1890ff" }} />
                <span style={{ fontSize: 10, marginTop: 2 }}>Копировать</span>
              </Button>
            </Tooltip>

            <Tooltip title="Очистить">
              <Button
                onClick={handleClear}
                size="small"
                type="text"
                danger
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <CloseOutlined style={{ fontSize: 18 }} />
                <span style={{ fontSize: 10, marginTop: 2 }}>Удалить</span>
              </Button>
            </Tooltip>

            {coordinates && (
              <Tooltip title="Открыть маршрут">
                <Button
                  type="text"
                  size="small"
                  onClick={() => {
                    window.open(
                      `https://yandex.ru/maps/?rtext=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lon}~${coordinates.lat},${coordinates.lon}&rtt=auto`,
                      "_blank"
                    );
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <CompassOutlined style={{ fontSize: 18, color: "#fa8c16" }} />
                  <span style={{ fontSize: 10, marginTop: 2 }}>Навигатор</span>
                </Button>
              </Tooltip>
            )}
          </div> */}
        </Card>
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
        <div
          style={{
            position: "relative",
            marginBottom: isDropdownOpen ? 210 : 10,
          }}
        >
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
        </div>
      </Dropdown>
    </div>
  );
}
