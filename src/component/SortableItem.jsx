import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuOutlined } from "@ant-design/icons";

const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 12,
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "#fff",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 12,
    touchAction: "none", // Отключаем стандартное поведение для мобильных устройств
    cursor: "grab", // Можно заменить на pointer
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <MenuOutlined
        {...listeners}
        style={{
          cursor: "grab", // Для мобильных также работает grab или pointer
          touchAction: "none", // Предотвращаем стандартное поведение на мобильных
        }}
      />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export { SortableItem };
