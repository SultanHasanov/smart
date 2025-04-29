import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { categoryStore } from "../store/categoryStore";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Button, Input, Space } from "antd";

const CategoryManager = observer(() => {
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    categoryStore.fetchCategories();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoryStore.categories.findIndex((c) => c.id === active.id);
    const newIndex = categoryStore.categories.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(categoryStore.categories, oldIndex, newIndex);
    categoryStore.reorderCategories(reordered);
  };

  return (
    <div>
      <h3>Категории</h3>
      <Space style={{ marginBottom: 16 }}>
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Новая категория"
        />
        <Button onClick={() => {
          categoryStore.addCategory(newCategory);
          setNewCategory("");
        }}>
          Добавить
        </Button>
      </Space>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={categoryStore.categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {categoryStore.categories.map((cat) => (
            <SortableItem key={cat.id} id={cat.id}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                {categoryStore.editingId === cat.id ? (
                  <>
                    <Input
                      size="small"
                      value={categoryStore.editingName}
                      onChange={(e) => categoryStore.setEditingName(e.target.value)}
                      onPressEnter={categoryStore.saveEdit}
                    />
                    <Button size="small" type="primary" onClick={categoryStore.saveEdit}>
                      Сохранить
                    </Button>
                  </>
                ) : (
                  <>
                    <span>{cat.name}</span>
                    <Space>
                      <Button size="small" onClick={() => categoryStore.startEdit(cat.id, cat.name)}>
                        Редактировать
                      </Button>
                      <Button danger size="small" onClick={() => categoryStore.deleteCategory(cat.id)}>
                        Удалить
                      </Button>
                    </Space>
                  </>
                )}
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
});

export default CategoryManager;
