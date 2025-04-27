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

const API_URL = "https://chechnya-product.ru/api/admin/categories";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  console.log(categories)

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("https://chechnya-product.ru/api/categories");
      const sorted = res.data.data.sort((a, b) => a.sort_order - b.sort_order);
      setCategories(sorted);
    };
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('token'); // Точное имя ключа укажите здесь
  
      const response = await axios.post(API_URL, {
        name: newCategory,
        sort_order: categories.length + 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setCategories(prev => [...prev, response.data.data]);
      setNewCategory("");
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
      // Здесь можно обработать ошибку, например, показать уведомление
    }
  };
  

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Убедитесь, что ключ токена верный
  
      const response = await axios.put(`${API_URL}/${id}`, {
        name: editingName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setCategories(prev =>
        prev.map(cat => (cat.id === id ? { ...cat, name: response.data.data.name } : cat))
      );
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error('Ошибка при сохранении изменений категории:', error.response?.data || error.message);
      // Можно добавить уведомление об ошибке для пользователя
    }
  };
  

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = async (event) => {
    try {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
  
      const oldIndex = categories.findIndex(c => c.id === active.id);
      const newIndex = categories.findIndex(c => c.id === over.id);
  
      const newItems = arrayMove(categories, oldIndex, newIndex);
  
      const updated = newItems.map((item, index) => ({
        ...item,
        sort_order: index + 1 // меняем именно sort_order
      }));
  
      setCategories(updated);
  
      const token = localStorage.getItem('token');
  
      await Promise.all(
        updated.map(cat =>
          axios.put(`${API_URL}/${cat.id}`, 
            { 
              name: cat.name, 
              sort_order: cat.sort_order 
            }, 
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        )
      );
    } catch (error) {
      console.error('Ошибка при обновлении порядка категорий:', error);
    }
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
