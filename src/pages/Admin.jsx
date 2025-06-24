import React, { useContext, useEffect, useState } from "react";
import {
  Input,
  Button,
  Form,
  message,
  Tabs,
  Drawer,
  Menu,
  Typography,
  Card,
} from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { AuthContext } from "../store/AuthContext";
import LogsViewer from "../component/LogsViewer";
import UserOrders from "./UserOrders";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  SettingOutlined,
} from "@ant-design/icons";
// import PushSubscribeButton from "../PushSubscribeButton";
import PushSender from "../PushSender";
import PushBroadcastForm from "../PushBroadcastForm";
import "../component/styles/Product.scss";
const { Text, Title } = Typography;
import { motion } from "framer-motion";
const IS_AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === "true";

const PHONE_MASK = "+7 (999) 999-99-99";
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};
const Login = () => {
  const { isAuthenticated, login, logout, username, userRole } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [regForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettingsDrawer = () => {
    navigate("/favorites");
  };

  // For install button (existing)
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  useEffect(() => {
  if (activeTab === "login") {
    const savedPhone = sessionStorage.getItem("savedPhone");
    const savedPassword = sessionStorage.getItem("savedPassword");

    if (savedPhone || savedPassword) {
      // Преобразуем сохранённый телефон к маске
      const raw = savedPhone?.replace(/\D/g, "") || "";
      const formattedPhone =
        raw.length === 11
          ? `+7 (${raw.slice(1, 4)}) ${raw.slice(4, 7)}-${raw.slice(
              7,
              9
            )}-${raw.slice(9, 11)}`
          : "";

      loginForm.setFieldsValue({
        username: formattedPhone,
        password: savedPassword,
      });

      // Удаляем после установки, чтобы не подставлялось в будущем
      sessionStorage.removeItem("savedPhone");
      sessionStorage.removeItem("savedPassword");
    }
  } else {
    // 🔒 ОЧИЩАЕМ форму регистрации, чтобы исключить случайные подстановки
    regForm.resetFields();
  }
}, [activeTab, loginForm, regForm]);


  useEffect(() => {
    const checkShouldShowButton = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const hasPrompt = !!window.deferredPrompt;
      const installShown = localStorage.getItem("installAlertShown");
      return !isStandalone && hasPrompt && installShown === "true";
    };
    setShowInstallBtn(checkShouldShowButton());
    const handleResize = () => setShowInstallBtn(checkShouldShowButton());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInstallClick = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          localStorage.setItem("installAlertShown", "false");
        }
      });
    }
  };

  // Login handler - same as yours but adapted to use form values from loginForm
  const handleLogin = async (values) => {
    if (IS_AUTH_DISABLED) {
      login("fake-token");
      message.success("Имитация авторизации успешна!");
      navigate("/favorites");
      return;
    }

    let identifier = values.username;
    if (identifier.startsWith("+7")) {
      identifier = "+7" + identifier.replace(/\D/g, "").slice(1);
    }

    if (values.password.length < 6) {
      message.error("Пароль должен содержать не менее 6 символов.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://chechnya-product.ru/api/login",
        {
          identifier,
          password: values.password,
        }
      );

      if (response.data.data.token) {
        const token = response.data.data.token;
        const username = response.data.data.username;

        login(token, username); // ✅ авторизуем

        // ⏬ ДОБАВЛЕНО: запрос адреса после авторизации
        try {
          const meResponse = await axios.get(
            "https://chechnya-product.ru/api/me/address",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Адрес пользователя:", meResponse.data);
          // ⏬ тут можно navigate или сохранить в store
        } catch (addressError) {
          console.error("Ошибка при получении адреса:", addressError);
        }

        message.success(`Добро пожаловать, ${username}!`);
      }
    } catch (error) {
      message.error(
        error.response?.data?.error ||
          "Ошибка авторизации. Проверьте логин и пароль."
      );
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const handleRegister = async (values) => {
    console.log(values);
    const phoneDigits = "+7" + values.phone.replace(/\D/g, "").slice(1);
    // → "79667283200"
    console.log(phoneDigits);
    if (phoneDigits.length !== 12 || !phoneDigits.startsWith("+7")) {
      message.error("Пожалуйста, введите корректный номер телефона.");
      return;
    }

    if (values.password.length < 6) {
      message.error("Пароль должен содержать не менее 6 символов.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://chechnya-product.ru/api/register", {
        username: values.username,
        phone: phoneDigits,
        password: values.password,
      });
      message.success("Регистрация прошла успешно! Теперь войдите в систему.");
      sessionStorage.setItem("savedPhone", phoneDigits);
      sessionStorage.setItem("savedPassword", values.password);
      setActiveTab("login");
    } catch (error) {
      console.log(error.response?.data?.error);
      message.error(
        error.response?.data?.error || "Ошибка регистрации. Попробуйте еще раз."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="login-container">
        <h2>Здравствуйте, {username || "гость"}!</h2>
        {userRole === "admin" && (
          <Button
            icon={<SettingOutlined />}
            size="large"
            type="default"
            onClick={toggleSettingsDrawer}
            style={{ marginBottom: 16 }}
            block
          >
            Настройки
          </Button>
        )}

        <Button size="large" type="primary" danger onClick={logout} block>
          Выйти
        </Button>

        <PushSender />

        <div style={{ margin: "24px 0", textAlign: "center" }}>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Хотите установить приложение на свой телефон?
          </Text>
          <Link to="/info">
            <Button type="link" style={{ padding: 0 }}>
              Инструкция по установке
            </Button>
          </Link>
        </div>

        {/* <Footer /> */}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="auth-container"
    >
      <Card className="auth-card">
        <motion.div variants={itemVariants}>
          <Title level={3} className="auth-title">
            {activeTab === "login" ? "Вход в аккаунт" : "Регистрация"}
          </Title>
        </motion.div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          centered
          className="auth-tabs"
        >
          <Tabs.TabPane tab="Войти" key="login">
            <Form
              form={loginForm}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              className="auth-form"
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  label="Номер телефона"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, введите номер телефона!",
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const digits = value.replace(/\D/g, "");
                        if (digits.length === 11 && digits.startsWith("7")) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          "Номер должен содержать 11 цифр и начинаться с 7"
                        );
                      },
                    },
                  ]}
                >
                  <InputMask
                    mask="+7 (999) 999-99-99"
                    maskChar={null}
                    alwaysShowMask={false}
                    onChange={(e) => {
                      let raw = e.target.value.replace(/\D/g, "");
                      if (raw.length > 11) raw = raw.slice(0, 11);
                      const formatted =
                        "+7 (" +
                        raw.slice(1, 4) +
                        ") " +
                        raw.slice(4, 7) +
                        "-" +
                        raw.slice(7, 9) +
                        "-" +
                        raw.slice(9, 11);
                      loginForm.setFieldsValue({ username: formatted });
                    }}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        size="large"
                        placeholder="+7 (___) ___-__-__"
                        prefix={<PhoneOutlined className="auth-input-icon" />}
                        className="auth-input"
                      />
                    )}
                  </InputMask>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  label="Пароль"
                  name="password"
                  rules={[
                    { required: true, message: "Пожалуйста, введите пароль!" },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Пароль"
                    prefix={<LockOutlined className="auth-input-icon" />}
                    className="auth-input"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item>
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="auth-button"
                    block
                  >
                    Войти
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Зарегистрироваться" key="register">
            <Form
              form={regForm}
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              className="auth-form"
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  label="Имя пользователя"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, введите имя пользователя!",
                    },
                    {
                      min: 3,
                      message:
                        "Имя пользователя должно содержать не менее 3 символов",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Введите имя пользователя"
                    prefix={<UserOutlined className="auth-input-icon" />}
                    className="auth-input"
                    maxLength={30}
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  label="Номер телефона"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, введите номер телефона!",
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const digits = value.replace(/\D/g, "");
                        if (digits.length === 11 && digits.startsWith("7")) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          "Номер должен содержать 11 цифр и начинаться с 7"
                        );
                      },
                    },
                  ]}
                >
                  <InputMask
                    mask="+7 (999) 999-99-99"
                    maskChar={null}
                    alwaysShowMask={false}
                    onChange={(e) => {
                      let raw = e.target.value.replace(/\D/g, "");
                      if (raw.length > 11) raw = raw.slice(0, 11);
                      const formatted =
                        "+7 (" +
                        raw.slice(1, 4) +
                        ") " +
                        raw.slice(4, 7) +
                        "-" +
                        raw.slice(7, 9) +
                        "-" +
                        raw.slice(9, 11);
                      regForm.setFieldsValue({ phone: formatted });
                    }}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        size="large"
                        placeholder="+7 (___) ___-__-__"
                        prefix={<PhoneOutlined className="auth-input-icon" />}
                        className="auth-input"
                      />
                    )}
                  </InputMask>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  label="Пароль"
                  name="password"
                  rules={[
                    { required: true, message: "Пожалуйста, введите пароль!" },
                    {
                      min: 6,
                      message: "Пароль должен содержать не менее 6 символов",
                    },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Пароль"
                    prefix={<LockOutlined className="auth-input-icon" />}
                    className="auth-input"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item>
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="auth-button"
                    block
                  >
                    Зарегистрироваться
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>
          </Tabs.TabPane>
        </Tabs>

        <motion.div variants={itemVariants} className="auth-switch-text">
          {activeTab === "login" ? (
            <Text>
              Ещё нет аккаунта?{" "}
              <Button
                type="link"
                onClick={() => setActiveTab("register")}
                className="auth-switch-link"
              >
                Зарегистрироваться
              </Button>
            </Text>
          ) : (
            <Text>
              Уже есть аккаунт?{" "}
              <Button
                type="link"
                onClick={() => setActiveTab("login")}
                className="auth-switch-link"
              >
                Войти
              </Button>
            </Text>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};

// import {
//   GithubOutlined,
//   PlusOutlined,
//   SettingOutlined,
// } from "@ant-design/icons";
// import { SiTelegram, SiWhatsapp } from "react-icons/si";
// const iconStyle = {
//   fontSize: "20px",
//   color: "#1890ff",
// };

// const Footer = () => (
//   <div
//     style={{
//       position: "fixed",
//       bottom: 50,
//       left: 0,
//       width: "100%",
//       background: "#f9f9f9",
//       borderTop: "1px solid #ddd",
//       padding: "16px 10px",
//       fontSize: "14px",
//       zIndex: 1000,
//     }}
//   >
//     <div style={{ marginBottom: 10 }}>
//       <strong>Контакты:</strong> +7 (928) 123-45-67
//     </div>
//     <div style={{ marginBottom: 16 }}>
//       <strong>Адрес:</strong> Чеченская Республика, Ачхой-Мартан
//     </div>

//     <div
//       style={{
//         display: "flex",
//         gap: 10,
//         flexWrap: "wrap",
//       }}
//     >
//       <div>
//         <strong>Разработчики:</strong>
//       </div>
//       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//         <img
//           src="https://randomuser.me/api/portraits/men/32.jpg"
//           alt="Ахмед Абдулаев"
//           style={{
//             width: 38,
//             height: 38,
//             borderRadius: "50%",
//             objectFit: "cover",
//             border: "1px solid #ccc",
//           }}
//         />
//         <div style={{ textAlign: "left" }}>
//           <div>
//             <strong>Имя:</strong> Ахмед Абдулаев
//           </div>
//           <div>
//             <strong>Направление:</strong> Frontend (React, UI/UX)
//           </div>
//           <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
//             <a
//               href="https://t.me/ahmed_dev"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <SiTelegram style={iconStyle} />
//             </a>

//             <a
//               href="https://github.com/ahmeddev"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <GithubOutlined style={iconStyle} />
//             </a>
//             <a
//               href="https://linkedin.com/in/ahmeddev"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <SiWhatsapp style={iconStyle} />
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Разработчик 2 */}
//       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//         <img
//           src="https://randomuser.me/api/portraits/men/44.jpg"
//           alt="Магомед Исаев"
//           style={{
//             width: 38,
//             height: 38,
//             borderRadius: "50%",
//             objectFit: "cover",
//             border: "1px solid #ccc",
//           }}
//         />
//         <div style={{ textAlign: "left" }}>
//           <div>
//             <strong>Имя:</strong> Магомед Исаев
//           </div>
//           <div>
//             <strong>Направление:</strong> Backend (Node.js, API, DevOps)
//           </div>
//           <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
//             <a
//               href="https://t.me/ahmed_dev"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <SiTelegram style={iconStyle} />
//             </a>

//             <a
//               href="https://github.com/magomeddev"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <GithubOutlined style={iconStyle} />
//             </a>
//             <a
//               href="https://linkedin.com/in/magomeddev"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <SiWhatsapp style={iconStyle} />
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

export default Login;
