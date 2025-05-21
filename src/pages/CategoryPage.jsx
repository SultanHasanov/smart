import React, { useEffect, useState } from "react";
import { Button, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../component/styles/Product.scss"; // Подключаем ваши стили

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cached = localStorage.getItem("categories");
        if (cached) {
          setCategories(JSON.parse(cached));
          setLoading(false);
        }

        const response = await axios.get("https://chechnya-product.ru/api/categories");
        const allCategory = { id: "all", name: "Все", sortOrder: -1 };
        const sorted = [
          allCategory,
          ...response.data.data.sort((a, b) => a.sort_order - b.sort_order),
        ];
        setCategories(sorted);
        localStorage.setItem("categories", JSON.stringify(sorted));
      } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    localStorage.setItem("selectedCategory", categoryId);
    navigate("/");
  };

  return (
    <div className="category-page-wrapper">
      <h2 style={{ marginBottom: 24 }}>Выберите категорию</h2>
      <div className="category-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Button
                active
                key={i}
                size="default"
                style={{ width: "100%", height: 40 }}
              />
            ))
          : categories.map((category) => (
              <Button
                key={category.id}
                type="default"
                size="large"
                block
                className="category-button"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </Button>
            ))}
      </div>
    </div>
  );
};

export default CategoryPage;
