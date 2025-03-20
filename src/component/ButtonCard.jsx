import { Button } from "antd";
import React, { useEffect } from "react";
import { useTimeContext } from "../TimeContext";

const ButtonCard = ({ tables, setSelectedTable, setModalVisible }) => {
  const openModal = (table) => {
    if (table.reserved || table.pending) return;
    setSelectedTable(table);
    setModalVisible(true);
  };
  useEffect(() => {}, [tables]);

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
              {table.test && table.timestamptwo && (
  <div style={{ color: "blue", fontWeight: "bold", fontSize: 14 }}>
    ⏳ {formatTime(30 - Math.floor((Date.now() - table.timestamptwo) / 1000))}
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
