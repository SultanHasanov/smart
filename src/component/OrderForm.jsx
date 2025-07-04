import React, { useContext, useEffect, useRef } from "react";
import { Form, Input, Radio, Card, Divider, Checkbox } from "antd";
import { AuthContext } from "../store/AuthContext";
import AddressInput from "./AddressInput";
import {
  CreditCardOutlined,
  DollarOutlined,
  ShopOutlined,
  TruckOutlined,
  CommentOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const OrderForm = ({
  form,
  cart,
  orderData,
  setOrderData,
  query,
  setQuery,
  suggestions,
  setSuggestions,
  onDropdownOpenChange,
}) => {
  const { username } = useContext(AuthContext);

  const hasSetNameRef = useRef(false);

  useEffect(() => {
    if (
      username &&
      !hasSetNameRef.current &&
      !form.getFieldValue("name") // не перезаписывать пользовательский ввод
    ) {
      form.setFieldsValue({ name: username });
      setOrderData((prev) => ({ ...prev, name: username }));
      hasSetNameRef.current = true;
    }
  }, [username, form, setOrderData]);

  if (cart.length === 0) return null;

  return (
    <Card
      headStyle={{ border: "none", fontWeight: "500" }}
      bodyStyle={{ padding: "0" }}
      style={{ border: "none", marginTop: 10 }}
    >
     <Form
  form={form}
  layout="vertical"
  initialValues={orderData}
  onValuesChange={(changedValues, allValues) => {
    // Если включили "Без сдачи", очищаем поле сдачи
    if (changedValues.noChange && changedValues.noChange === true) {
      form.setFieldsValue({ changeFor: undefined });
    }
    setOrderData(allValues); // Это обновляет состояние в CartPage
  }}
>
        <Form.Item
          label="Ваше имя"
          name="name"
          rules={[{ required: true, message: "Пожалуйста, введите имя" }]}
        >
          <Input
            size="large"
            placeholder="Как к вам обращаться?"
            style={{ borderRadius: "8px" }}
            allowClear
          />
        </Form.Item>

        <Divider
          plain
          orientation="left"
          style={{ fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}
        >
          Способ оплаты
        </Divider>

        <Form.Item
          name="paymentType"
          rules={[{ required: true, message: "Выберите способ оплаты" }]}
        >
          <Radio.Group
            size="large"
            buttonStyle="solid"
            style={{ width: "100%" }}
          >
            <Radio.Button
              value="cash"
              style={{ width: "50%", textAlign: "center" }}
            >
              <DollarOutlined /> Наличными
            </Radio.Button>
            <Radio.Button
              value="transfer"
              style={{ width: "50%", textAlign: "center" }}
            >
              <CreditCardOutlined /> Перевод
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Divider
          orientation="left"
          plain
          style={{ fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}
        >
          Способ получения
        </Divider>

        <Form.Item
          name="deliveryType"
          rules={[{ required: true, message: "Выберите тип доставки" }]}
        >
          <Radio.Group
            size="large"
            buttonStyle="solid"
            style={{ width: "100%" }}
          >
            <Radio.Button
              value="pickup"
              style={{ width: "50%", textAlign: "center" }}
            >
              <ShopOutlined /> Самовывоз
            </Radio.Button>
            <Radio.Button
              value="delivery"
              style={{ width: "50%", textAlign: "center" }}
            >
              <TruckOutlined /> Доставка
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {orderData.paymentType === "cash" &&
          orderData.deliveryType === "delivery" && (
            <>
              {!orderData.noChange && (
                <Form.Item
                  label="Сдача с"
                  name="changeFor"
                  tooltip="Укажите сумму, с которой нужно дать сдачу"
                  rules={[
                    { required: true, message: "Укажите сумму для сдачи" },
                    { pattern: /^[0-9]+$/, message: "Только цифры" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Например: 2000"
                    addonAfter="₽"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
              )}
              <Form.Item name="noChange" valuePropName="checked">
                <Checkbox>Без сдачи</Checkbox>
              </Form.Item>
            </>
          )}

        {orderData.deliveryType === "delivery" && (
          <AddressInput
            query={query}
            setQuery={setQuery}
            setSuggestions={setSuggestions}
            suggestions={suggestions}
            onDropdownOpenChange={onDropdownOpenChange}
            setOrderData={setOrderData}
          />
        )}

        <Divider
          plain
          style={{ fontSize: "14px", margin: "20px 0", fontWeight: "bold" }}
          orientation="left"
        >
          Дополнительно
        </Divider>

        <Form.Item
          label={
            <span>
              <CommentOutlined style={{ marginRight: "8px" }} />
              Комментарий к заказу
            </span>
          }
          name="order_comment"
          tooltip="Необязательное поле"
        >
          <TextArea
            rows={3}
            size="large"
            placeholder="Например: позвонить за час до доставки"
            maxLength={300}
            showCount
            style={{ borderRadius: "8px" }}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OrderForm;
