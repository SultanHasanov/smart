import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

class ProductStore {
  dishes = [];
  categories = [];
  cartMap = new Map(); // 🔥 Используем Map вместо массива
  selectedCategory = "all";
  searchTerm = "";
  columnsCount = 3;
  loading = true;
  isOffline = !navigator.onLine;

  constructor() {
    makeAutoObservable(this);
    this.initialize();
  }

  initialize() {
    const cachedDishes = localStorage.getItem("dishes");
    const cachedCategories = localStorage.getItem("categories");

    if (cachedDishes) this.dishes = JSON.parse(cachedDishes);
    if (cachedCategories) this.categories = JSON.parse(cachedCategories);

    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", () => this.setIsOffline(true));
  }

  async fetchData() {
    try {
      const [categoriesRes, dishesRes] = await Promise.all([
        axios.get("https://chechnya-product.ru/api/categories"),
        axios.get("https://chechnya-product.ru/api/products"),
      ]);

      const allCategory = { id: "all", name: "Все", sortOrder: -1 };
      const sortedCategories = [
        allCategory,
        ...categoriesRes.data.data.sort((a, b) => a.sort_order - b.sort_order),
      ];

      runInAction(() => {
        this.categories = sortedCategories;
        this.dishes = dishesRes.data.data;
        this.loading = false;
      });
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      await this.handleFetchError();
    }
  }

  async fetchCart() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("https://chechnya-product.ru/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      runInAction(() => {
        this.cartMap.clear();
        (res.data.data || []).forEach((item) => {
          this.cartMap.set(item.product_id, item);
        });
      });
    } catch (error) {
      console.error("Ошибка загрузки корзины:", error);
    }
  }

  async handleAddToCart(productId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    const item = this.cartMap.get(productId);

    try {
      let newItem;
      if (item) {
        const res = await axios.put(
          `https://chechnya-product.ru/api/cart/${productId}`,
          { quantity: item.quantity + 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newItem = res.data.data;
      } else {
        const res = await axios.post(
          "https://chechnya-product.ru/api/cart",
          { product_id: productId, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newItem = res.data.data;
      }

      runInAction(() => {
        this.cartMap.set(productId, newItem); // Обновляем только один товар
      });
    } catch (error) {
      console.error("Ошибка при добавлении товара:", error);
    }
  }

  async handleDecreaseQuantity(productId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    const item = this.cartMap.get(productId);
    if (!item) return;

    const newQty = item.quantity - 1;

    try {
      await axios.put(
        `https://chechnya-product.ru/api/cart/${productId}`,
        { quantity: Math.max(newQty, 0) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await this.fetchCart();
    } catch (error) {
      console.error("Ошибка при уменьшении количества:", error);
    }
  }

  getQuantity(productId) {
    const item = this.cartMap.get(productId);
    return item ? item.quantity : 0;
  }

  get filteredDishes() {
    return this.dishes
      .filter(
        (dish) =>
          this.selectedCategory === "all" ||
          dish.category_id === this.selectedCategory
      )
      .filter((dish) =>
        dish.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
  }

  get shuffledAllDishes() {
    if (this.selectedCategory === "all") {
      return [...this.dishes].sort(() => Math.random() - 0.5);
    }
    return this.dishes;
  }

  get gridTemplateColumns() {
    return this.columnsCount === 2
      ? "repeat(2, minmax(160px, 1fr))"
      : "repeat(3, minmax(105px, 1fr))";
  }

  calculateTotal() {
    let total = 0;
    this.cartMap.forEach((item) => {
      total += item.price * item.quantity;
    });
    return new Intl.NumberFormat("ru-RU").format(total);
  }

  get visibleCategories() {
    let charCount = 0;
    const visible = [];
    const MAX_CHAR_COUNT = 26;

    for (const category of this.categories) {
      if (charCount + category.name.length <= MAX_CHAR_COUNT) {
        visible.push(category);
        charCount += category.name.length;
      } else {
        break;
      }
    }
    return visible;
  }

  get hiddenCategories() {
    const visibleNames = this.visibleCategories.map((c) => c.name);
    return this.categories.filter((c) => !visibleNames.includes(c.name));
  }

  setSelectedCategory(category) {
    this.selectedCategory = category;
    this.searchTerm = "";
  }

  setSearchTerm(term) {
    this.searchTerm = term;
  }

  setColumnsCount(count) {
    this.columnsCount = count;
  }

  setLoading(val) {
    this.loading = val;
  }

  setIsOffline(val) {
    this.isOffline = val;
  }

  cleanup() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", () => this.setIsOffline(true));
  }

  handleOnline = () => {
    if (this.isOffline) {
      this.setIsOffline(false);
      this.setLoading(true);
      this.fetchData();
    }
  };
}

export const productStore = new ProductStore();
