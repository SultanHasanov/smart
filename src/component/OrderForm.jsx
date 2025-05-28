// OrderForm.jsx
import React, { useContext, useEffect } from "react";
import { Form, Input, Radio } from "antd";
import { AuthContext } from "../store/AuthContext";

const { TextArea } = Input;

const OrderForm = ({ form, cart, orderData, setOrderData }) => {
  const { username } = useContext(AuthContext);
  useEffect(() => {
    if (username && !orderData.name) {
      setOrderData({ ...orderData, name: username });
      form.setFieldsValue({ name: username }); // для синхронизации формы
    }
  }, [username, orderData, setOrderData, form]);

  return (
    cart.length !== 0 && (
      <Form
        form={form}
        layout="vertical"
        initialValues={orderData}
        onValuesChange={(changedValues, allValues) => {
          setOrderData(allValues);
        }}
      >
        <Form.Item
          className="my-custom-form-item"
          label="Введите свое имя"
          name="name"
          rules={[{ required: true, message: "Пожалуйста, введите имя" }]}
        >
          <Input size="large" placeholder="Имя" />
        </Form.Item>

        <Form.Item
          className="my-custom-form-item"
          label="Способ оплаты"
          name="paymentType"
          rules={[{ required: true, message: "Выберите способ оплаты" }]}
        >
          <Radio.Group size="large">
            <Radio.Button value="cash">Наличными</Radio.Button>
            <Radio.Button value="transfer">Перевод</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {orderData.paymentType === "cash" &&
          orderData.deliveryType === "delivery" && (
            <Form.Item
              className="my-custom-form-item"
              label="С какой суммы нужна сдача?"
              name="changeFor"
              rules={[
                { required: true, message: "Укажите сумму, с которой сдача" },
              ]}
            >
              <Input size="large" placeholder="С какой суммы нужна сдача?" />
            </Form.Item>
          )}

        <Form.Item
          className="my-custom-form-item"
          label="Тип доставки"
          name="deliveryType"
          rules={[{ required: true, message: "Выберите тип доставки" }]}
        >
          <Radio.Group size="large">
            <Radio.Button value="pickup">Самовывоз</Radio.Button>
            <Radio.Button value="delivery">Доставка</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          className="my-custom-form-item"
          label="Добавьте комментарий"
          name="order_comment"
        >
          <TextArea rows={4} size="large" placeholder="Комментарий к заказу если необходимо" maxLength={300} showCount/>
        </Form.Item>
      </Form>
    )
  );
};

export default OrderForm;
