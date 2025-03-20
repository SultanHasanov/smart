import { Button } from "antd";
import React, { useEffect } from "react";
import { useTimeContext } from "../TimeContext";

const ButtonCard = ({ tables, setSelectedTable, setModalVisible, setTables }) => {
  const openModal = (table) => {
    if (table.reserved || table.pending) return;
    setSelectedTable(table);
    setModalVisible(true);
  };
  useEffect(() => {
    const pusher = new Pusher("6abdde8ba81f348f1c97", {
      cluster: "eu",
      forceTLS: true,
    });

    const channel = pusher.subscribe("my-channel"); // Убедись, что сервер отправляет в этот канал
    channel.bind("my-event", (data) => {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === data.tableId ? { ...table, pending: true } : table
        )
      );
    });

    return () => {
      pusher.unsubscribe("my-channel");
    };
  }, [setTables]);

  const { countdowns } = useTimeContext();

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <>
      {tables.map((table) => (
        <Button
          key={table.id}
          className="table-button"
          style={{
            backgroundColor: table.reserved
              ? "gray"
              : table.pending
              ? "orange"
              : "green",
            color: "white",
          }}
          onClick={() => openModal(table)}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 12,
              justifyContent: "space-between",
            }}
          >
            <div>
              <b>Столик: </b> №{table.id}
            </div>
            <div>
              <div>
                {table.reserved && <b>Время: </b>}
                {table.time !== "" ? table.time : null}
              </div>
              <div>
                {table.reserved && <b>Имя: </b>}
                {table.reserved && table.name}
              </div>
              <div>
                {table.reserved && <b>Кол-во: </b>}
                {table.reserved && table.people}
              </div>
              {table.pending && countdowns[table.id] !== undefined && (
                <div style={{ color: "red", fontWeight: "bold", fontSize: 14 }}>
                  ⏳ {formatTime(countdowns[table.id])}
                </div>
              )}
            </div>
          </div>
        </Button>
      ))}
    </>
  );
};

export default ButtonCard;
