import React from "react";
import {
  List,
  Popconfirm,
  Switch,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
} from "antd";
import {
  EditOutlined,
  DeleteFilled,
  CloseOutlined,
} from "@ant-design/icons";
import { div } from "framer-motion/client";

const { Option } = Select;

const ProductListEditor = ({
  items,
  editingId,
  setEditingId,
  handleUpdate,
  handleDelete,
  handleToggleAvailability,
  categoriesTwo,
}) => {
  return (
    <div style={{height: "100vh"}}>

        <h3>Редактирование товара</h3>
        <List
          className="custom-list"
          bordered
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              actions={
                editingId === item.id
                  ? []
                  : [
                      <EditOutlined
                        key="edit"
                        style={{ color: "green", fontSize: 20 }}
                        onClick={() => setEditingId(item.id)}
                      />,
                      <Popconfirm
                        key="delete"
                        title="Удалить товар?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Да"
                        cancelText="Нет"
                      >
                        <DeleteFilled style={{ color: "red", fontSize: 20 }} />
                      </Popconfirm>,
                      <Switch
                        key="toggleAvailability"
                        checked={item.availability}
                        onChange={() => handleToggleAvailability(item.id)}
                        checkedChildren="Активен"
                        unCheckedChildren="Не активен"
                      />,
                    ]
              }
            >
              {editingId === item.id ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <CloseOutlined
                    onClick={() => setEditingId(null)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      fontSize: 18,
                      color: "red",
                      cursor: "pointer",
                      zIndex: 1,
                    }}
                  />
                  <Form
                    initialValues={item}
                    onFinish={(values) => handleUpdate(item.id, values)}
                    layout="inline"
                    style={{
                      width: "100%",
                      flexWrap: "wrap",
                      alignItems: "center",
                      paddingRight: 24,
                    }}
                  >
                    <Form.Item className="input-form-edit" name="name">
                      <Input />
                    </Form.Item>
                    <Form.Item className="input-form-edit" name="price">
                      <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item className="input-form-edit" name="url">
                      <Input />
                    </Form.Item>
                    <Form.Item className="input-form-edit" name="category_id">
                      <Select style={{ width: 120 }}>
                        {categoriesTwo.map((cat) => (
                          <Option key={cat.id} value={cat.id}>
                            {cat.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item className="input-form-edit">
                      <Button htmlType="submit" type="primary">
                        Сохранить
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>
                    {item.name} — {item.price} ₽
                  </span>
                </div>
              )}
            </List.Item>
          )}
        />
    </div>
  );
};

export default ProductListEditor;
