// OrderForm.jsx
import React from 'react';
import { Form, Input, Radio } from 'antd';

const OrderForm = ({ form, cart, orderData, setOrderData }) => {
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
              <Input
                size="large"
                placeholder="С какой суммы нужна сдача?"
              />
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
      </Form>
    )
  );
};

export default OrderForm;
