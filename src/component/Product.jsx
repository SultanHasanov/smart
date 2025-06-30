import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Skeleton,
  Switch,
  message,
} from "antd";
import React, { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import "../App.css";
import "../component/styles/Product.scss"; // Подключаем стили для компонента
import {
  MinusOutlined,
  PlusOutlined,
  AppstoreOutlined,
  AppstoreAddOutlined,
  FileImageOutlined,
  EllipsisOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CartStore from "../store/CartStore";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { categoryStore } from "../store/categoryStore";
import { AuthContext } from "../store/AuthContext";

const Product = () => {
  const [dishes, setDishes] = useState(() => {
    const cachedDishes = localStorage.getItem("dishes");
    return cachedDishes ? JSON.parse(cachedDishes) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [columnsCount, setColumnsCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(() => {
    const cachedCategories = localStorage.getItem("categories");
    return cachedCategories ? JSON.parse(cachedCategories) : [];
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const cart = toJS(CartStore.cart);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const categoriesTwo = toJS(categoryStore.categories);
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem("token");
  const { userRole } = useContext(AuthContext);
  useEffect(() => {
    if (!loading) {
      const selected = localStorage.getItem("selectedCategory");
      if (selected) {
        setSelectedCategory(selected);
        localStorage.removeItem("selectedCategory");
      }
    }
  }, [loading]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Пытаемся получить свежие данные
        const [categoriesRes, dishesRes] = await Promise.all([
          axios.get("https://chechnya-product.ru/api/categories"),
          axios.get("https://chechnya-product.ru/api/products"),
        ]);

        const allCategory = { id: "all", name: "Все", sortOrder: -1 };
        const sortedCategories = [
          allCategory,
          ...categoriesRes.data.data.sort(
            (a, b) => a.sort_order - b.sort_order
          ),
        ];

        setCategories(sortedCategories);
        setDishes(dishesRes.data.data);

        // Сохраняем в localStorage
        localStorage.setItem("categories", JSON.stringify(sortedCategories));
        localStorage.setItem("dishes", JSON.stringify(dishesRes.data.data));
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);

        // Если онлайн, но ошибка - пытаемся получить из кеша через Service Worker
        if (navigator.onLine) {
          const cachedResponse = await caches.match(
            "https://chechnya-product.ru/api/products"
          );
          if (cachedResponse) {
            const data = await cachedResponse.json();
            setDishes(data.data || []);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Если оффлайн, сначала проверяем кеш Service Worker
    if (isOffline) {
      caches
        .match("https://chechnya-product.ru/api/products")
        .then((response) => {
          if (response) {
            return response.json();
          }
          throw new Error("No cached data");
        })
        .then((data) => {
          setDishes(data.data || []);
          setLoading(false);
        })
        .catch(() => {
          // Если нет в кеше SW, используем localStorage
          setLoading(false);
        });
    } else {
      fetchData();
    }
  }, [isOffline]);

  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        // При восстановлении соединения обновляем данные
        setIsOffline(false);
        setLoading(true);
        // Здесь можно добавить логику для фонового обновления данных
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isOffline]);

  const getGridTemplateColumns = () => {
    return columnsCount === 2
      ? "repeat(2, minmax(160px, 1fr))"
      : "repeat(3, minmax(105px, 1fr))";
  };

  const handleAddToCart = (dishId) => {
    const item = CartStore.cart.find((item) => item.product_id === dishId);
    if (item && item.quantity >= 10) return;

    const dish = dishes.items?.find((d) => d.id === dishId);
    if (!dish) return;

    const newItem = {
      product_id: dishId,
      quantity: 1,
      name: dish.name,
      price: dish.price,
    };

    if (item) {
      CartStore.addQuantity(dishId);
    } else {
      CartStore.setCart([...CartStore.cart, newItem]);
    }
  };

  const handleDecreaseQuantity = (dishId) => {
    CartStore.decreaseQuantity(dishId);
  };

  const filteredDishes = dishes.items
    ?.filter(
      (dish) =>
        selectedCategory === "all" ||
        String(dish.category_id) === String(selectedCategory)
    )
    .filter((dish) =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const calculateTotal = () => {
    return new Intl.NumberFormat("ru-RU").format(CartStore.totalPrice);
  };

  let charCount = 0;
  const visibleCategories = [];
  const hiddenCategories = [];
  const MAX_CHAR_COUNT = 26;

  for (const category of categories) {
    if (charCount + category.name.length <= MAX_CHAR_COUNT) {
      visibleCategories.push(category);
      charCount += category.name.length;
    } else {
      hiddenCategories.push(category);
    }
  }

  const [form] = Form.useForm();

  const handleEditProduct = (values) => {
    axios
      .put(
        `https://chechnya-product.ru/api/admin/products/${currentEditItem.id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        const updatedItems = dishes.items.map((item) =>
          item.id === currentEditItem.id ? res.data.data : item
        );
        const updatedDishes = { ...dishes, items: updatedItems };
        setDishes(updatedDishes);
        localStorage.setItem("dishes", JSON.stringify(updatedDishes));
        setEditModalVisible(false);
        form.resetFields(); // Дополнительно сбросим форму
      })
      .catch((error) => {
        console.error("Ошибка при обновлении товара:", error);
      });
  };

  const handleToggleAvailability = async (id) => {
    const item = dishes.items?.find((item) => item.id === id);

    if (item) {
      const updatedAvailability = !item.availability;
      const updatedValues = { ...item, availability: updatedAvailability };

      await handleUpdate(id, updatedValues);
    }
  };

  const handleUpdate = async (id, updatedValues) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `https://chechnya-product.ru/api/admin/products/${id}`,
        updatedValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedItems = dishes.items?.map((item) =>
        item.id === id ? res.data.data : item
      );
      const updatedDishes = { ...dishes, items: updatedItems };

      setDishes(updatedDishes);
      localStorage.setItem("dishes", JSON.stringify(updatedDishes));
      message.success("Товар обновлён");
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.error);
      } else {
        console.error("Request Error:", error.message);
        message.error("Ошибка обновления товара");
      }
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://chechnya-product.ru/api/admin/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedItems = dishes.items?.filter((item) => item.id !== id);
      const updatedDishes = { ...dishes, items: updatedItems };

      setDishes(updatedDishes);
      localStorage.setItem("dishes", JSON.stringify(updatedDishes));
      message.success("Товар удалён");
    } catch (error) {
      message.error("Ошибка удаления товара");
      console.error(error);
    }
  };

  return (
    <div className="product-wrapper">
      <div className="product-search-container">
        <div className="product-search-input">
          <Input
            className="custom-allow-clear"
            size="large"
            allowClear
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="product-categories">
          {visibleCategories.map((category) => (
            <Button
              size="middle"
              key={category.id}
              className={`product-category-button ${
                selectedCategory === category.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchTerm("");
              }}
            >
              {category.name}
            </Button>
          ))}

          {hiddenCategories.length > 0 && (
            <Popover
              placement="bottom"
              content={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxHeight: 200,
                    overflowY: "auto",
                    width: 150,
                  }}
                >
                  {hiddenCategories.map((category) => (
                    <Button
                      size="middle"
                      key={category.id}
                      className={`product-category-button ${
                        selectedCategory === category.id ? "active" : ""
                      }`}
                      style={{ display: "flex", justifyContent: "start" }}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSearchTerm("");
                      }}
                    >
                      {category.name.length > 14
                        ? `${category.name.substring(0, 14)}...`
                        : category.name}
                    </Button>
                  ))}
                </div>
              }
              trigger="click"
            >
              <Button size="middle" icon={<EllipsisOutlined />} />
            </Popover>
          )}
        </div>
      </div>

      <div className="product-toggle">
        <Button
          shape="circle"
          icon={
            columnsCount === 3 ? <AppstoreAddOutlined /> : <AppstoreOutlined />
          }
          onClick={() => setColumnsCount(columnsCount === 3 ? 2 : 3)}
        />
      </div>

      <div className="product-grid-wrapper">
        <div
          className="product-grid"
          style={{
            gridTemplateColumns: getGridTemplateColumns(),
            ...(cart.length > 0 && { marginBottom: 50 }),
          }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="product-card">
                <Skeleton.Image style={{ width: "100%", height: 80 }} active />
                <Skeleton active title={false} paragraph={{ rows: 2 }} />
              </div>
            ))
          ) : filteredDishes.length === 0 ? (
            <div className="product-empty">Ничего не найдено</div>
          ) : (
            filteredDishes.map((dish) => {
              const currentDish = cart.find(
                (item) => item.product_id === dish.id
              );
              const quantity = currentDish ? currentDish.quantity : 0;
              const isUnavailable = !dish.availability;

              return (
                <div
                  key={dish.id}
                  className={`product-card ${isUnavailable ? "inactive" : ""}`}
                  style={{ position: "relative" }}
                >
                  <div
                    className="product-card-content"
                    onClick={() => !isUnavailable && handleAddToCart(dish.id)}
                    style={{ pointerEvents: isUnavailable ? "none" : "auto" }}
                  >
                    <div className="product-card-emoji">
                      {dish.url ? (
                        <img
                          style={{
                            width: columnsCount === 2 ? "100px" : "50px",
                          }}
                          src={dish.url}
                          alt=""
                        />
                      ) : (
                        <FileImageOutlined
                          style={{ fontSize: "48px", color: "#ccc" }}
                        />
                      )}
                    </div>
                    <span className="product-card-title">
                      <b>
                        {dish.name.length > 12
                          ? dish.name.slice(0, 10) + "..."
                          : dish.name}
                      </b>
                    </span>
                    <div className="product-card-price">
                      <b>Цена:</b> {dish.price} ₽
                    </div>
                  </div>

                  <div
                    className={
                      quantity === 0
                        ? "product-card-actions2"
                        : "product-card-actions"
                    }
                  >
                    {isUnavailable ? (
                      <div className="product-unavailable-wrapper">
                        <div className="product-unavailable-label">
                          <StopOutlined className="unavailable-icon"  />
                        </div>
                        {userRole === "admin" && (
                          <Button
                            type="link"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAvailability(dish.id);
                            }}
                            className="make-available-btn"
                          >
                            Включить
                          </Button>
                        )}
                      </div>
                    ) : quantity === 0 ? (
                      <Button
                        size={columnsCount === 3 ? "small" : "medium"}
                        onClick={() => handleAddToCart(dish.id)}
                        className="product-btn-add"
                      >
                        В корзину
                      </Button>
                    ) : (
                      <>
                        <Button
                          size={columnsCount === 3 ? "small" : "large"}
                          onClick={() => handleDecreaseQuantity(dish.id)}
                          className="product-btn-minus"
                        >
                          <MinusOutlined />
                        </Button>
                        {cart.find((item) => item.product_id === dish.id)
                          ?.quantity >= 10 && (
                          <div className="product-max-quantity">
                            Макс. 10 шт
                          </div>
                        )}
                        <Button
                          size={columnsCount === 3 ? "small" : "large"}
                          onClick={() => handleAddToCart(dish.id)}
                          disabled={
                            cart.find((item) => item.product_id === dish.id)
                              ?.quantity >= 10
                          }
                          className="product-btn-plus"
                        >
                          <PlusOutlined />
                        </Button>
                        <span className="product-card-quantity">
                          <b>{quantity}</b>
                        </span>
                      </>
                    )}
                    {userRole === "admin" && (
                      <div
                        className="edit-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentEditItem(dish);
                          form.setFieldsValue(dish);
                          setEditModalVisible(true);
                        }}
                      >
                        <EditOutlined />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {cart.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 70,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1000000,
            padding: "0 16px",
          }}
        >
          <Button
            type="primary"
            size="large"
            block
            onClick={() => navigate("/cart")}
            style={{
              height: 50,
              fontSize: 16,
              display: "flex",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}
          >
            <div>
              {cart.reduce((acc, item) => acc + item.quantity, 0)} товаров
            </div>
            <div>К оформлению</div>
            <div>{calculateTotal()} ₽</div>
          </Button>
        </div>
      )}
      <Modal
        title="Редактировать товар"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              handleEditProduct(values);
            })
            .catch(() => {});
        }}
        okText="Сохранить"
        cancelText="Отмена"
        footer={[
          <Button
            key="delete"
            danger
            onClick={() => {
              Modal.confirm({
                title: "Удалить товар",
                content: "Вы уверены, что хотите удалить этот товар?",
                okText: "Удалить",
                cancelText: "Отмена",
                onOk: () => {
                  handleDelete(currentEditItem.id);
                  setEditModalVisible(false);
                },
              });
            }}
          >
            Удалить
          </Button>,
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Отмена
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then((values) => {
                  handleEditProduct(values);
                })
                .catch(() => {});
            }}
          >
            Сохранить
          </Button>,
        ]}
      >
        <Form layout="vertical" form={form} initialValues={currentEditItem}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Цена" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="url" label="URL изображения">
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="Категория">
            <Select style={{ width: "100%" }}>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="availability"
            label="Доступность"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="В наличии"
              unCheckedChildren="Нет в наличии"
              onChange={(checked) => {
                form.setFieldsValue({ availability: checked });
                handleToggleAvailability(currentEditItem.id);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default observer(Product);
