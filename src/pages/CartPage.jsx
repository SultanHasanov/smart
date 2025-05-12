import { useCallback, useEffect, useState } from "react";
import { Button, Input, message, Radio, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import AddressInput from "../component/AddressInput";
import axios from "axios";
import "../component/styles/Product.scss";
import CartList from "../component/CartList";
import CartStore from "../store/CartStore";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

const { Text } = Typography;
const ADMIN_PHONE = "+79298974969";

const CartPage = () => {
  // const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [test, setTest] = useState(1);
  const navigate = useNavigate();

  const cart = toJS(CartStore.cart);
  console.log("cart", cart);

  console.log("suggestions", suggestions);
  console.log("selectedIds", selectedIds);

  useEffect(() => {
    setTest(cart.length !== 0 ? 1 : 2);
  }, [cart.length]);

  // useEffect(() => {
  //   if (cart.length > 0 && suggestions.length === 0) {
  //     console.log("selectedIds", selectedIds);
  //     UIStore.showOrderButton(sendOrderToWhatsApp);
  //   } else {
  //     UIStore.hideOrderButton();
  //   }

  //   return () => UIStore.hideOrderButton();

  // }, [cart.length]);

  const [orderData, setOrderData] = useState({
    name: "",
    deliveryType: "",
    paymentType: "",
    address: query,
    changeFor: "",
  });
  console.log("orderData", orderData);

  const calculateTotal = () => {
    return cart
      .filter((item) => selectedIds.includes(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleRemoveFromCart = (id) => CartStore.removeItem(id);

  const handleRemoveSelected = () => CartStore.clearSelected(selectedIds);

  const increaseQuantity = (id) => CartStore.addQuantity(id);

  const decreaseQuantity = (id) => CartStore.decreaseQuantity(id);

  const toggleSelected = (dishId) => {
    setSelectedIds((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId]
    );
  };
  const sendOrderToWhatsApp = useCallback(async () => {
    console.log("Отправка заказа в WhatsApp");
    const selectedItems = cart.filter((item) => selectedIds.includes(item.product_id));
    console.log("selectedItems", selectedItems);

    if (selectedItems.length === 0) return message.error("Ничего не выбрано!");
    if (!orderData.name) return message.error("Введите имя!");
    if (orderData.deliveryType === "delivery" && !query)
      return message.error("Введите адрес доставки!");
    if (
      orderData.paymentType === "cash" &&
      orderData.deliveryType === "delivery" &&
      !orderData.changeFor
    )
      return message.error("Введите сумму, с которой нужна сдача!");

    let cartDetails = "";
    let totalAmount = 0;

    selectedItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      cartDetails += `${item.name} x${item.quantity} = ${itemTotal} ₽\n`;
      totalAmount += itemTotal;
    });

    let deliveryFee = 0;
    if (orderData.deliveryType === "delivery" && totalAmount < 1000) {
      deliveryFee = 500;
    }

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

    const whatsappMessage = `
\`Заказ\`
Имя: ${orderData.name}
Тип: ${orderData.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
${paymentDetails}
${deliveryText}
${orderData.deliveryType === "delivery" ? `Адрес: ${query}` : ""}
\`Ваш заказ:\`
${cartDetails}
Общая сумма: ${finalTotal} ₽`;

    // const whatsappURL = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
    //   whatsappMessage
    // )}`;

    // window.open(whatsappURL, "_blank");

    // 2. Отправка на API
    try {
      await axios.post("https://chechnya-product.ru/api/order", {
        name: orderData.name,
        address: orderData.deliveryType === "delivery" ? query : null,
        items: selectedItems,
        delivery_fee: deliveryFee,
        delivery_text: deliveryText,
        total: finalTotal,
        delivery_type: orderData.deliveryType,
        payment_type: orderData.paymentType,
        change_for:
           orderData.paymentType === "cash"
    ? orderData.changeFor.trim() === ""
      ? null
      : Number(orderData.changeFor)
    : null,
        status: "новый",
      });

      message.success("Заказ отправлен админу и сохранён в системе!");
      setOrderData({
        name: "",
        deliveryType: "pickup",
        address: "",
        paymentType: "cash",
        changeFor: "",
      });
  
      setSelectedIds([]);
      handleRemoveSelected();
    } catch (error) {
      message.error("Ошибка при сохранении заказа на сервере");
      console.error("Ошибка API:", error);
    }

  }, [selectedIds, orderData, query, cart]);

  return (
    <div
      style={{
        padding: "10px",
        // transition: "min-height 0.3s ease",
        minHeight: isAddressOpen ? 815 : "auto",
      }}
    >
      {cart.length !== 0 && <h2>Ваш заказ:</h2>}

      {cart.length > 0 ? (
        <>
          <Button
            onClick={() => {
              if (selectedIds.length === cart.length) {
                setSelectedIds([]); // Снимаем всё
              } else {
                setSelectedIds(cart.map((item) => item.product_id)); // Выбираем всё
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

      {cart.length !== 0 && (
        <div style={{ marginTop: "10px" }}>
          <Text
            style={{
              fontSize: 17,
              color: "green",
              textDecoration: "underline",
            }}
            strong
          >
            Итоговая сумма: {calculateTotal()} ₽
          </Text>
        </div>
      )}

      {cart.length !== 0 && (
        <div style={{ marginTop: 20 }}>
          <Input
            size="large"
            placeholder="Имя"
            value={orderData.name}
            onChange={(e) =>
              setOrderData({ ...orderData, name: e.target.value })
            }
            style={{ marginBottom: 10 }}
          />

          <Radio.Group
            size="large"
            value={orderData.paymentType}
            onChange={(e) =>
              setOrderData({ ...orderData, paymentType: e.target.value })
            }
            style={{ marginBottom: 10 }}
          >
            <Radio.Button value="cash">Наличными</Radio.Button>
            <Radio.Button value="transfer">Перевод</Radio.Button>
          </Radio.Group>

          {orderData.paymentType === "cash" &&
            orderData.deliveryType === "delivery" && (
              <Input
                size="large"
                placeholder="С какой суммы нужна сдача?"
                value={orderData.changeFor}
                onChange={(e) =>
                  setOrderData({ ...orderData, changeFor: e.target.value })
                }
                style={{ marginBottom: 10 }}
              />
            )}

          <Radio.Group
            size="large"
            value={orderData.deliveryType}
            onChange={(e) =>
              setOrderData({ ...orderData, deliveryType: e.target.value })
            }
            style={{ marginBottom: 10 }}
          >
            <Radio.Button value="pickup">Самовывоз</Radio.Button>
            <Radio.Button value="delivery">Доставка</Radio.Button>
          </Radio.Group>
        </div>
      )}
      {orderData.deliveryType === "delivery" && (
        <AddressInput
          query={query}
          setQuery={setQuery}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
          setSuggestions={setSuggestions}
          suggestions={suggestions}
          onDropdownOpenChange={setIsAddressOpen}
        />
      )}
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

     {cart.length !== 0 &&
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
       onClick={sendOrderToWhatsApp}
     >
       <div>{CartStore.totalQuantity} товаров</div>
       <div>Оформить</div>
       <div>
         {new Intl.NumberFormat("ru-RU").format(CartStore.totalPrice)} ₽
       </div>
     </Button>
   </div>
     } 
    </div>
  );
};

export default observer(CartPage);
