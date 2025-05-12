// import { observer } from 'mobx-react-lite';
// import React from 'react';
// import { productStore } from '../store/productStore';
// import { Button } from 'antd';
// import { FileImageOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
// import { toJS } from 'mobx';



// const ProductCard  = observer(({ dish }) => {
//     const quantity = productStore.cartMap.get(dish.id)?.quantity || 0;


//     console.log("ProductCard", toJS(dish), toJS(quantity));
//     const isUnavailable = !dish.availability;
//     console.log("isUnavailable", isUnavailable);
  
//     return (
//       <div className={`product-card ${isUnavailable ? "inactive" : ""}`}>
//         <div
//           className="product-card-content"
//           onClick={() => !isUnavailable && productStore.handleAddToCart(dish.id)}
//           style={{ pointerEvents: isUnavailable ? "none" : "auto" }}
//         >
//           <div className="product-card-emoji">
//             {dish.url ? (
//               <img
//                 style={{
//                   width: productStore.columnsCount === 2 ? "100px" : "50px",
//                 }}
//                 src={dish.url}
//                 alt=""
//               />
//             ) : (
//               <FileImageOutlined style={{ fontSize: "48px", color: "#ccc" }} />
//             )}
//           </div>
//           <span className="product-card-title">
//             <b>
//               {dish.name.length > 12
//                 ? dish.name.slice(0, 10) + "..."
//                 : dish.name}
//             </b>
//           </span>
//           <div className="product-card-price">
//             <b>Цена:</b> {dish.price} ₽
//           </div>
//         </div>
  
//         <div
//           className={
//             quantity === 0 ? "product-card-actions2" : "product-card-actions"
//           }
//         >
//           {isUnavailable ? (
//             <div className="product-card-unavailable">Нет в наличии</div>
//           ) : quantity === 0 ? (
//             <Button
//               size={productStore.columnsCount === 3 ? "small" : "medium"}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 productStore.handleAddToCart(dish.id);
//               }}
//               className="product-btn-add"
//             >
//               В корзину
//             </Button>
//           ) : (
//             <>
//               <Button
//                 size={productStore.columnsCount === 3 ? "small" : "large"}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   productStore.handleDecreaseQuantity(dish.id);
//                 }}
//                 className="product-btn-minus"
//               >
//                 <MinusOutlined />
//               </Button>
//               {quantity >= 10 && (
//                 <div
//                   style={{
//                     padding: "0 4px",
//                     fontSize: 11,
//                     color: "red",
//                     fontWeight: "bold",
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   Макс. 10 шт
//                 </div>
//               )}
//               <Button
//                 size={productStore.columnsCount === 3 ? "small" : "large"}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   productStore.handleAddToCart(dish.id);
//                 }}
//                 disabled={quantity >= 10}
//                 className="product-btn-plus"
//                 style={{
//                   opacity: quantity >= 10 ? 0.4 : 1,
//                   pointerEvents: quantity >= 10 ? "none" : "auto",
//                 }}
//               >
//                 <PlusOutlined />
//               </Button>
//               <span className="product-card-quantity">
//                 <b>{quantity}</b>
//               </span>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   });


// export default ProductCard;