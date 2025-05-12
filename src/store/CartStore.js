// store/CartStore.js
import { makeAutoObservable } from "mobx";

class CartStore {
  cart = [];

  constructor() {
    makeAutoObservable(this);
    this.loadCartFromStorage();
  }

  loadCartFromStorage() {
    const savedCart = localStorage.getItem("cart");
    this.cart = savedCart ? JSON.parse(savedCart) : [];
  }


  saveCartToStorage() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  setCart(newCart) {
    if (!this.cart) {
      console.error("Cart is not initialized properly");
      return;
    }
    this.cart = newCart;
    this.saveCartToStorage();
  }

  addQuantity(product_id) {
  this.cart = this.cart.map(item =>
    item.product_id === product_id ? { ...item, quantity: item.quantity + 1 } : item
  );
  this.saveCartToStorage();
}


  decreaseQuantity(id) {
  this.cart = this.cart
    .map(item => {
      if (item.product_id === id) {
        return item.quantity === 1
          ? null // Помечаем для удаления
          : { ...item, quantity: item.quantity - 1 };
      }
      return item;
    })
    .filter(Boolean); // Удаляем все null
  this.saveCartToStorage();
}

  removeItem(id) {
    this.cart = this.cart.filter(item => item.product_id !== id);
    this.saveCartToStorage();
  }

  clearSelected(ids) {
    this.cart = this.cart.filter(item => !ids.includes(item.product_id));
    this.saveCartToStorage();
  }

  get totalQuantity() {
    return this.cart.reduce((acc, item) => acc + item.quantity, 0);
  }

  get totalPrice() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

export default new CartStore();
