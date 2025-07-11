import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button, Form, Input, message, Modal, Radio, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import AddressInput from "../component/AddressInput";
import axios from "axios";
import "../component/styles/Product.scss";
import CartList from "../component/CartList";
import CartStore from "../store/CartStore";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import OrderForm from "../component/OrderForm";

const { Text } = Typography;
const ADMIN_PHONE = "+79667283100";

const CartPage = () => {
  // const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [test, setTest] = useState(1);
  const navigate = useNavigate();
  const { Text, Paragraph } = Typography;
  const [form] = Form.useForm();
  const cart = CartStore.cart;
  const token = localStorage.getItem("token");
  const isManuallyChanged = useRef(false);
  const [whatsAppURL, setWhatsAppURL] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    setTest(cart.length !== 0 ? 1 : 2);
  }, [cart.length]);

  useEffect(() => {
    if (cart.length > 0 && !isManuallyChanged.current) {
      setSelectedIds(cart.map((item) => item.product_id));
    }
  }, [cart]);

  const [orderData, setOrderData] = useState({
    name: "",
    deliveryType: "",
    paymentType: "",
    address: query,
    changeFor: "",
    order_comment: "",
    latitude: "",
    longitude: "",
  });

  console.log(orderData)

  const calculateTotal = () => {
    return cart
      .filter((item) => selectedIds.includes(item.product_id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleRemoveFromCart = (id) => CartStore.removeItem(id);

  const handleRemoveSelected = () => {
    CartStore.clearSelected(selectedIds);
    setSelectedIds([]);
  };
  const increaseQuantity = (id) => CartStore.addQuantity(id);

  const decreaseQuantity = (id) => CartStore.decreaseQuantity(id);

  const toggleSelected = (dishId) => {
    isManuallyChanged.current = true;
    setSelectedIds((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId]
    );
  };

    const showOrderConfirmation = () => {
    const selectedItems = cart.filter((item) =>
      selectedIds.includes(item.product_id)
    );

    if (selectedItems.length === 0) return message.error("Ничего не выбрано!");
    if (!orderData.name) return message.error("Введите имя!");
    if (!orderData.paymentType) return message.error("Выберите способ оплаты!");
    if (!orderData.deliveryType) return message.error("Выберите способ получения!");
    if (orderData.deliveryType === "delivery" && !query)
      return message.error("Введите адрес доставки!");
    if (
      orderData.paymentType === "cash" &&
      orderData.deliveryType === "delivery" &&
      !orderData.changeFor &&
      !orderData.noChange
    )
      return message.error("Введите сумму, с которой нужна сдача, или отметьте 'Без сдачи'!");

    setIsModalVisible(true);
  };

  const handleConfirmOrder = () => {
    setIsModalVisible(false);
    sendOrderToWhatsApp();
  };

   const sendOrderToWhatsApp = useCallback(async () => {
   const selectedItems = cart.filter((item) =>
    selectedIds.includes(item.product_id)
  );

  // Проверки
  if (selectedItems.length === 0) return message.error("Ничего не выбрано!");
  if (!orderData.name) return message.error("Введите имя!");
  if (!orderData.paymentType) return message.error("Выберите способ оплаты!"); // <-- Добавьте эту проверку
  if (!orderData.deliveryType) return message.error("Выберите способ получения!");
  if (orderData.deliveryType === "delivery" && !query)
    return message.error("Введите адрес доставки!");
  if (
    orderData.paymentType === "cash" &&
    orderData.deliveryType === "delivery" &&
    !orderData.changeFor &&
    !orderData.noChange
  )
    return message.error("Введите сумму, с которой нужна сдача, или отметьте 'Без сдачи'!");

    let cartDetails = "";
    let totalAmount = 0;

    selectedItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      cartDetails += `${item.name} x${item.quantity} = ${itemTotal} ₽\n`;
      totalAmount += itemTotal;
    });

    let deliveryFee = 0;
    // if (orderData.deliveryType === "delivery" && totalAmount < 1000) {
    //   deliveryFee = 500;
    // }

    const finalTotal = totalAmount + deliveryFee;
    let paymentDetails = "";

    if (orderData.paymentType === "transfer") {
      paymentDetails = `Оплата: Перевод (Карта: 1234 5678 9012 3456)\n`;
    } else if (
      orderData.paymentType === "cash" &&
      orderData.deliveryType === "delivery"
    ) {
      paymentDetails = `Оплата: Наличными (Сдача с ${orderData.changeFor} ₽)\n`;
    } else {
      paymentDetails = "Оплата: Наличными\n";
    }

    const deliveryText =
      orderData.deliveryType === "delivery"
        ? `Доставка: ${orderData.address}\n${
            deliveryFee ? "Доставка: +500 ₽\n" : "0 ₽\n"
          }`
        : "Самовывоз\n";

    // Сначала сохраняем заказ в системе
    try {
      const response = await axios.post(
        "https://chechnya-product.ru/api/order",
        {
          name: orderData.name,
          address: orderData.deliveryType === "delivery" ? query : null,
          items: selectedItems,
          delivery_fee: deliveryFee,
          delivery_text: deliveryText,
          total: finalTotal,
          delivery_type: orderData.deliveryType,
          payment_type: orderData.paymentType,
          order_comment: orderData.order_comment,
          longitude: orderData.longitude,
          latitude: orderData.latitude,
          change_for:
            orderData.paymentType === "cash"
              ? (orderData.changeFor || "").trim() === ""
                ? null
                : Number(orderData.changeFor)
              : null,
          status: "новый",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderId = response.data.data.id;
      const orderLink = `https://chechnya-product.ru/orders/${orderId}`;
  console.log(orderId)
      // Теперь создаём сообщение WhatsApp
  //     const whatsappMessage = `
  // \`Заказ\`
  // Имя: ${orderData.name}
  // Тип: ${orderData.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
  // ${paymentDetails}
  // ${deliveryText}
  // ${orderData.deliveryType === "delivery" ? `Адрес: ${query}` : ""}
  // \`Ваш заказ:\`
  // ${cartDetails}
  // Общая сумма: ${finalTotal} ₽
  // 🔗 Ссылка на заказ: ${orderLink}
  // `;

  const whatsappMessage = `
  *Новый заказ*

  Номер заказа: ${orderId}
  🔗 Ссылка на заказ: ${orderLink}

  📱 Вы можете зарегистрироваться в приложении https://chechnya-product.ru/login и отслеживать статус своих заказов прямо в личном кабинете.
  `;

      const whatsappURL = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
        whatsappMessage
      )}`;

      window.open(whatsappURL, "_blank");

      message.success("Заказ отправлен админу!");

      setOrderData({
        name: "",
        deliveryType: "pickup",
        address: "",
        paymentType: "cash",
        changeFor: "",
        order_comment: '',
         latitude: "",
    longitude: "",
      });

      setSelectedIds([]);
      handleRemoveSelected();
    } catch (error) {
      message.error("Ошибка при сохранении заказа на сервере");
      console.error("Ошибка API:", error);
    }
  }, [selectedIds, orderData, query, cart, token]);

//   const sendOrderToWhatsApp = useCallback(async () => {
//     const selectedItems = cart.filter((item) =>
//       selectedIds.includes(item.product_id)
//     );

//     if (selectedItems.length === 0) return message.error("Ничего не выбрано!");
//     if (!orderData.name) return message.error("Введите имя!");
//     if (orderData.deliveryType === "delivery" && !query)
//       return message.error("Введите адрес доставки!");
//     if (
//       orderData.paymentType === "cash" &&
//       orderData.deliveryType === "delivery" &&
//       !orderData.changeFor
//     )
//       return message.error("Введите сумму, с которой нужна сдача!");

//     let cartDetails = "";
//     let totalAmount = 0;

//     selectedItems.forEach((item) => {
//       const itemTotal = item.price * item.quantity;
//       cartDetails += `${item.name} x${item.quantity} = ${itemTotal} ₽\n`;
//       totalAmount += itemTotal;
//     });

//     let deliveryFee = 0;
//     if (orderData.deliveryType === "delivery" && totalAmount < 1000) {
//       deliveryFee = 500;
//     }

//     const finalTotal = totalAmount + deliveryFee;
//     let paymentDetails = "";

//     if (orderData.paymentType === "transfer") {
//       paymentDetails = `Оплата: Перевод (Карта: 1234 5678 9012 3456)\n`;
//     } else if (
//       orderData.paymentType === "cash" &&
//       orderData.deliveryType === "delivery"
//     ) {
//       paymentDetails = `Оплата: Наличными (Сдача с ${orderData.changeFor} ₽)\n`;
//     } else {
//       paymentDetails = "Оплата: Наличными\n";
//     }

//     const deliveryText =
//       orderData.deliveryType === "delivery"
//         ? `Доставка: ${orderData.address}\n${
//             deliveryFee ? "Доставка: +500 ₽\n" : "0 ₽\n"
//           }`
//         : "Самовывоз\n";

//     try {
//       const response = await axios.post(
//         "https://chechnya-product.ru/api/order",
//         {
//           name: orderData.name,
//           address: orderData.deliveryType === "delivery" ? query : null,
//           items: selectedItems,
//           order_comment: orderData.order_comment,
//           delivery_fee: deliveryFee,
//           delivery_text: deliveryText,
//           total: finalTotal,
//           delivery_type: orderData.deliveryType,
//           payment_type: orderData.paymentType,
//           change_for:
//             orderData.paymentType === "cash"
//               ? (orderData.changeFor || "").trim() === ""
//                 ? null
//                 : Number(orderData.changeFor)
//               : null,
//           status: "новый",
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const orderId = response.data.data.id;
//       const orderLink = `https://chechnya-product.ru/orders/${orderId}`;

// //       const whatsappMessage = `
// // *Новый заказ*

// // Номер заказа: ${orderId}
// // 🔗 Ссылка на заказ: ${orderLink}

// // 📱 Вы можете зарегистрироваться в приложении https://chechnya-product.ru/login и отслеживать статус своих заказов прямо в личном кабинете.
// // `;

// //       const url = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
// //         whatsappMessage
// //       )}`;

// //       setWhatsAppURL(url); // Сохраняем URL в state
// //       setTimeout(() => {
// //         const link = document.createElement("a");
// //         link.href = url;
// //         link.target = "_blank";
// //         link.rel = "noopener noreferrer";
// //         document.body.appendChild(link);
// //         link.click();
// //         document.body.removeChild(link);
// //       }, 200);

//       message.success("Заказ отправлен админу и сохранён в системе!");

//       setOrderData({
//         name: "",
//         deliveryType: "pickup",
//         address: "",
//         paymentType: "cash",
//         changeFor: "",
//         order_comment: "",
//       });

//       setSelectedIds([]);
//       handleRemoveSelected();
//     } catch (error) {
//       message.error("Ошибка при сохранении заказа на сервере");
//       console.error("Ошибка API:", error);
//     }
//   }, [selectedIds, orderData, query, cart, token]);

   const handleClick = () => {
    if (whatsAppURL) {
      const link = document.createElement("a");
      link.href = whatsAppURL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setWhatsAppURL(null);
    } else {
      showOrderConfirmation();
    }
  };

  const renderOrderDetails = () => {
    const selectedItems = cart.filter(item => selectedIds.includes(item.product_id));
    const total = calculateTotal();
    
    return (
      <>
        <h3 style={{textAlign: "center"}}>Детали заказа:</h3>
        <div style={{ marginBottom: 16 }}>
          <strong>Имя:</strong> {orderData.name}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Способ получения:</strong> {orderData.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
        </div>
        {orderData.deliveryType === "delivery" && (
          <div style={{ marginBottom: 16 }}>
            <strong>Адрес:</strong> {query}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <strong>Способ оплаты:</strong> {orderData.paymentType === "cash" ? "Наличными" : "Перевод"}
        </div>
        {orderData.paymentType === "cash" && orderData.deliveryType === "delivery" && orderData.changeFor && (
          <div style={{ marginBottom: 16 }}>
            <strong>Сдача с:</strong> {orderData.changeFor} ₽
          </div>
        )}
        {orderData.order_comment && (
          <div style={{ marginBottom: 16 }}>
            <strong>Комментарий:</strong> {orderData.order_comment}
          </div>
        )}
        
        <h3 style={{textAlign: "center"}}>Товары:</h3>
        {selectedItems.map(item => (
          <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>{item.name} x{item.quantity}</span>
            <span>{item.price * item.quantity} ₽</span>
          </div>
        ))}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>
          <span>Итого:</span>
          <span>{new Intl.NumberFormat("ru-RU").format(total)} ₽</span>
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        padding: "5px",
        marginBottom: 150,
      }}
    >
      {cart.length !== 0 && <h2>Ваш заказ:</h2>}

      {cart.length > 0 ? (
        <>
          <Button
            onClick={() => {
              isManuallyChanged.current = true;
              if (selectedIds.length === cart.length) {
                setSelectedIds([]); // Снять всё
              } else {
                setSelectedIds(cart.map((item) => item.product_id)); // Выбрать всё
              }
            }}
            style={{ marginBottom: 10 }}
          >
            {selectedIds.length === cart.length
              ? "Снять выделение"
              : "Выбрать всё"}
          </Button>

          <CartList
            cart={cart}
            selectedIds={selectedIds}
            toggleSelected={toggleSelected}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            handleRemoveFromCart={handleRemoveFromCart}
          />
        </>
      ) : (
        <div
          style={{
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ccc",
            fontSize: "18px",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <ShoppingOutlined style={{ fontSize: 60, marginBottom: 16 }} />
          <div>Корзина пуста</div>
        </div>
      )}

      {test === 1 && (
        <div style={{ marginTop: "10px", display: "flex", gap: 8 }}>
          {cart.length !== 0 && (
            <Button
              danger
              onClick={handleRemoveSelected}
              disabled={selectedIds.length === 0}
            >
              Удалить выбранные
            </Button>
          )}

          <Button onClick={() => navigate("/")} icon={<PlusOutlined />}>
            {cart.length !== 0 ? "Добавить ещё" : "Добавить товары"}
          </Button>
        </div>
      )}

      <OrderForm
        form={form}
        cart={cart}
        orderData={orderData}
        setOrderData={setOrderData}
        query={query}
        setQuery={setQuery}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        setSuggestions={setSuggestions}
        suggestions={suggestions}
        onDropdownOpenChange={setIsAddressOpen}
      />
      {/* {orderData.deliveryType === "delivery" && ( */}

      {/* )} */}

      {test === 2 && (
        <Button
          size="large"
          style={{
            top: 60,

            fontSize: 20,
            color: "green",
            width: "100%",
            height: 50,
          }}
          onClick={() => navigate("/")}
          icon={<PlusOutlined />}
        >
          {cart.length === 0 && "Добавить товары"}
        </Button>
      )}

      {selectedIds.length !== 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 70,
            left: 0,
            right: 0,
            padding: "0 16px",
            zIndex: 999,
          }}
        >
          <Button
            type="primary"
            size="large"
            block
            style={{
              height: 50,
              fontSize: 16,
              display: "flex",
              justifyContent: "space-between",
            }}
            onClick={handleClick}
          >
            <div>{selectedIds.length} товаров</div>
            <div>Оформить</div>
            <div>
              {new Intl.NumberFormat("ru-RU").format(calculateTotal())} ₽
            </div>
          </Button>
        </div>
      )}
       <Modal
        title="Подтверждение заказа"
        visible={isModalVisible}
        onOk={handleConfirmOrder}
        onCancel={() => setIsModalVisible(false)}
        okText="Подтвердить"
        cancelText="Отменить"
        width={600}
      >
        {renderOrderDetails()}
      </Modal>
    </div>
  );
};

export default observer(CartPage);
