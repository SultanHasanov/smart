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
    gap: 12
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <MenuOutlined {...listeners} style={{ cursor: "grab" }} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export { SortableItem };
