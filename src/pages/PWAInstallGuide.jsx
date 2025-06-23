import React from "react";
import { Collapse, Card, Typography, Image, Steps, Divider, List } from "antd";
import {
  AndroidFilled,
  AppleFilled,
  WindowsFilled,
  ChromeFilled,
} from "@ant-design/icons";
import image2 from "../assets/image2.png";
import image1 from "../assets/image1.png";
import image3 from "../assets/image3.png";
import smart2 from "../assets/smart2.jpg";
const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const PWAInstallGuide = () => {
  return (
    <div
      style={{
        padding: "5px",
        maxWidth: "700px",
        margin: "0 auto",
        marginBottom: 75,
      }}
    >
      <Title level={2} style={{ textAlign: "center" }}>
        <ChromeFilled style={{ color: "#4285F4" }} /> Руководство по установке
        PWA
      </Title>

      <Paragraph>
        Прогрессивные веб-приложения (PWA) можно установить на главный экран
        вашего устройства. Ниже приведены инструкции для разных платформ.
      </Paragraph>

      <Collapse accordion defaultActiveKey={["android"]}>
        {/* Android */}
        <Panel
          header={
            <Text strong>
              <AndroidFilled style={{ color: "#3DDC84" }} /> Android (Chrome)
            </Text>
          }
          key="android"
        >
          <Steps direction="vertical" current={4}>
            <Step
              title="Нажмите на меню (три точки)"
              description={
                <Image
                  src={image2}
                  alt="Меню Chrome"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
            <Step
              title="Выберите 'Установить приложение' или 'Добавить на гл. экран'"
              description={
                <Image
                  src={image1}
                  alt="Опция установки"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
            <Step
              title="Подтвердите установку"
              description={
                <Image
                  src={smart2}
                  alt="Подтверждение установки"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
            <Step
              title="Приложение появится на главном экране как обычное приложение."
              description={
                <Image
                  src={image3}
                  alt="Подтверждение установки"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
          </Steps>
        </Panel>

        {/* iOS */}
        <Panel
          header={
            <Text strong>
              <AppleFilled style={{ color: "#000000" }} /> iOS (Safari)
            </Text>
          }
          key="ios"
        >
          <Steps direction="vertical" current={5}>
            <Step
              title="Откройте наш сайт в Safari"
              description={
                <Image
                  src="/images/pwa-ios-1.jpg"
                  alt="Открытие в Safari"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
            <Step
              title="Нажмите кнопку 'Поделиться'"
              description={
                <Image
                  src="/images/pwa-ios-2.jpg"
                  alt="Кнопка поделиться"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
            <Step
              title="Выберите 'На экран Домой'"
              description={
                <Image
                  src="/images/pwa-ios-3.jpg"
                  alt="Добавить на главный экран"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
            <Step
              title="Назовите приложение и подтвердите"
              description={
                <Image
                  src="/images/pwa-ios-4.jpg"
                  alt="Название и подтверждение"
                  style={{ maxWidth: "300px", marginTop: "10px" }}
                />
              }
            />
            <Step
              title="Доступ с главного экрана"
              description={
                <>
                  <Image
                    src="/images/pwa-ios-5.jpg"
                    alt="Иконка на главном экране"
                    style={{ maxWidth: "300px", marginTop: "10px" }}
                  />
                  <Paragraph style={{ marginTop: "10px" }}>
                    PWA будет запускаться в отдельном окне без интерфейса
                    Safari.
                  </Paragraph>
                </>
              }
            />
          </Steps>
        </Panel>

        {/* Windows */}
        <Panel
          header={
            <Text strong>
              <WindowsFilled style={{ color: "#0078D7" }} /> Windows
              (Edge/Chrome)
            </Text>
          }
          key="windows"
        >
          <Card>
            <Steps direction="vertical" current={3}>
              <Step
                title="Откройте наш сайт в Edge/Chrome"
                description="Убедитесь, что у вас последняя версия браузера"
              />
              <Step
                title="Найдите предложение об установке"
                description="Браузер покажет кнопку установки в адресной строке"
              />
              <Step
                title="Нажмите 'Установить'"
                description={
                  <Image
                    src="/images/pwa-windows.jpg"
                    alt="Установка в Windows"
                    style={{ maxWidth: "300px", marginTop: "10px" }}
                  />
                }
              />
            </Steps>
          </Card>
        </Panel>
      </Collapse>

      <Divider />

      <Title level={4}>Преимущества PWA</Title>
      <List>
        <List.Item>Работает офлайн после первой загрузки</List.Item>
        <List.Item>Не требует скачивания из магазина приложений</List.Item>
        <List.Item>Всегда актуальная версия</List.Item>
        <List.Item>Занимает меньше места, чем нативные приложения</List.Item>
        <List.Item>Поддержка push-уведомлений</List.Item>
      </List>

      <Divider />

      <Title level={4}>Решение проблем</Title>
      <Collapse>
        <Panel header="Не вижу опцию установки" key="1">
          <Paragraph>
            <Text strong>Возможные причины:</Text>
          </Paragraph>
          <List>
            <List.Item>
              Ваш браузер не поддерживает PWA (обновите браузер)
            </List.Item>
            <List.Item>Сайт не реализовал PWA корректно</List.Item>
            <List.Item>Вы в режиме инкогнито/приватного просмотра</List.Item>
          </List>
        </Panel>
        <Panel header="Приложение не работает офлайн" key="2">
          <Paragraph>
            Некоторые функции могут требовать подключения к интернету.
            Приложение должно быть открыто хотя бы один раз онлайн для
            кэширования ресурсов.
          </Paragraph>
        </Panel>
      </Collapse>
      
    </div>
  );
};

export default PWAInstallGuide;
