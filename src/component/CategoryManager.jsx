import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Button, Input, Space } from "antd";

const API_URL = "https://44899c88203381ec.mokky.dev/categories";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(API_URL);
      const sorted = res.data.sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(sorted);
    };
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    const response = await axios.post(API_URL, {
      name: newCategory,
      sortOrder: categories.length + 1
    });
    setCategories(prev => [...prev, response.data]);
    setNewCategory("");
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}`, {
      name: editingName
    });

    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, name: response.data.name } : cat))
    );
    setEditingId(null);
    setEditingName("");
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);

    const newItems = arrayMove(categories, oldIndex, newIndex);

    const updated = newItems.map((item, index) => ({
      ...item,
      sortOrder: (index + 1)
    }));

    setCategories(updated);

    await Promise.all(
      updated.map(cat =>
        axios.patch(`${API_URL}/${cat.id}`, {
          sortOrder: cat.sortOrder
        })
      )
    );
  };

  return (
    <div >
      <h3>Категории</h3>

      <Space style={{ marginBottom: 16 }}>
        <Input
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Новая категория"
        />
        <Button onClick={handleAdd}>Добавить</Button>
      </Space>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map(cat => (
            <SortableItem key={cat.id} id={cat.id}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                {editingId === cat.id ? (
                  <>
                    <Input
                      size="small"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onPressEnter={() => handleSaveEdit(cat.id)}
                    />
                    <Button size="small" type="primary" onClick={() => handleSaveEdit(cat.id)}>
                      Сохранить
                    </Button>
                  </>
                ) : (
                  <>
                    <span>{cat.name}</span>
                    <Space>
                      <Button size="small" onClick={() => handleEdit(cat.id, cat.name)}>
                        Редактировать
                      </Button>
                      <Button danger size="small" onClick={() => handleDelete(cat.id)}>
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
};

export default CategoryManager;
