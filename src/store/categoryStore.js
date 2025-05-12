import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

const API_URL = "https://chechnya-product.ru/api/admin/categories";
const PUBLIC_API = "https://chechnya-product.ru/api/categories";

class CategoryStore {
  categories = [];
  loading = false;
  editingId = null;
  editingName = "";

  constructor() {
    makeAutoObservable(this);
  }

  fetchCategories = async () => {
    this.loading = true;
    try {
      const res = await axios.get(PUBLIC_API);
      const sorted = res.data.data.sort((a, b) => a.sort_order - b.sort_order);
      runInAction(() => {
        this.categories = sorted;
      });
    } catch (err) {
      console.error("Ошибка загрузки категорий", err);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  addCategory = async (name) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        API_URL,
        {
          name,
          sort_order: this.categories.length + 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      runInAction(() => {
        this.categories.push(res.data.data);
      });
    } catch (err) {
      console.error("Ошибка добавления категории", err);
    }
  };

  deleteCategory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      runInAction(() => {
        this.categories = this.categories.filter((c) => c.id !== id);
      });
    } catch (err) {
      console.error("Ошибка удаления категории", err);
    }
  };

  startEdit = (id, name) => {
    this.editingId = id;
    this.editingName = name;
  };

  setEditingName = (value) => {
    this.editingName = value;
  };

  saveEdit = async () => {
    if (!this.editingId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/${this.editingId}`,
        { name: this.editingName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      runInAction(() => {
        this.categories = this.categories.map((c) =>
          c.id === this.editingId ? { ...c, name: res.data.data.name } : c
        );
        this.editingId = null;
        this.editingName = "";
      });
    } catch (err) {
      console.error("Ошибка редактирования категории", err);
    }
  };

  reorderCategories = async (newOrder) => {
    this.categories = newOrder.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    const token = localStorage.getItem("token");

    try {
      await Promise.all(
        this.categories.map((cat) =>
          axios.put(
            `${API_URL}/${cat.id}`,
            {
              name: cat.name,
              sort_order: cat.sort_order,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      );
    } catch (err) {
      console.error("Ошибка сохранения порядка категорий", err);
    }
  };
}

export const categoryStore = new CategoryStore();
