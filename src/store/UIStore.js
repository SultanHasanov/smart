// // store/UIStore.js
// import { makeAutoObservable } from "mobx";

// class UIStore {
//   showGlobalOrderButton = false;
//   onClickOrder = null;

//   constructor() {
//     makeAutoObservable(this);
//   }

//   showOrderButton(onClick) {
//     this.showGlobalOrderButton = true;
//     this.onClickOrder = onClick;
//   }

//   hideOrderButton() {
//     this.showGlobalOrderButton = false;
//     this.onClickOrder = null;
//   }
// }

// export default new UIStore();
