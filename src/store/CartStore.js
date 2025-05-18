// store/CartStore.js
import { makeAutoObservable, observable } from "mobx";

class CartStore {
   cart = observable.array([]);

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
  const index = this.cart.findIndex(item => item.product_id === product_id);
  if (index !== -1) {
    this.cart[index].quantity += 1;
    this.saveCartToStorage();
  }
}

decreaseQuantity(product_id) {
  const index = this.cart.findIndex(item => item.product_id === product_id);
  if (index !== -1) {
    if (this.cart[index].quantity === 1) {
      this.cart.splice(index, 1);
    } else {
      this.cart[index].quantity -= 1;
    }
    this.saveCartToStorage();
  }
}

removeItem(product_id) {
  const index = this.cart.findIndex(item => item.product_id === product_id);
  if (index !== -1) {
    this.cart.splice(index, 1);
    this.saveCartToStorage();
  }
}

clearSelected(ids) {
  const filtered = this.cart.filter(item => !ids.includes(item.product_id));
  this.cart.splice(0, this.cart.length, ...filtered);
  this.saveCartToStorage();
}

repeatOrder(items) {
  this.cart = []; // очищаем текущую корзину
  items.forEach((item) => {
    this.cart.push({
      ...item,
      quantity: item.quantity || 1, // если вдруг quantity нет
    });
  });
}



  get totalQuantity() {
    return this.cart.reduce((acc, item) => acc + item.quantity, 0);
  }

  get totalPrice() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

export default new CartStore();
