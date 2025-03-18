import { Button } from "antd";
import React from "react";

const ButtonCard = ({
  tables,
  setSelectedTable,
  setModalVisible,
  countdowns = { countdowns },
}) => {
  const openModal = (table) => {
    if (table.reserved || table.pending) return;
    setSelectedTable(table);
    setModalVisible(true);
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
                <div style={{ color: "red", fontWeight: "bold" }}>
                  ⏳ {countdowns[table.id]} сек
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
