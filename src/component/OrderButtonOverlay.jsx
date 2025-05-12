// // component/OrderButtonOverlay.jsx
// import { observer } from "mobx-react-lite";
// import { Button } from "antd";
// import UIStore from "../store/UIStore";
// import CartStore from "../store/CartStore";

// const OrderButtonOverlay = observer(() => {
//   if (!UIStore.showGlobalOrderButton || !UIStore.onClickOrder) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         bottom: 70,
//         left: 0,
//         right: 0,
//         padding: "0 16px",
//         zIndex: 999,
//       }}
//     >
//       <Button
//         type="primary"
//         size="large"
//         block
//         style={{
//           height: 50,
//           fontSize: 16,
//           display: "flex",
//           justifyContent: "space-between",
//         }}
//         onClick={UIStore.onClickOrder}
//       >
//         <div>{CartStore.totalQuantity} товаров</div>
//         <div>Оформить</div>
//         <div>{new Intl.NumberFormat("ru-RU").format(CartStore.totalPrice)} ₽</div>
//       </Button>
//     </div>
//   );
// });

// export default OrderButtonOverlay;
