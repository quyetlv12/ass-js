import { $, reRender } from "../../utils";
import SearchBox from "./SearchBox";
import CartProduct from "./CartProduct";
import Header from "./header";
import ProductApi from "../../api/ProductApi";
import axios from "axios";

const ListItemCart = {
  render() {
    let products = [];
    products = JSON.parse(localStorage.getItem("products"));
    let sumTotal = (accumulator, currentValue) => {
      return accumulator + +currentValue.price;
    };
    return /*html */ `${products
      .map(({ id, name, image, price, quantity }, index) => {
        return /*html*/ `
           <tr class="text-center" >
           <td width="50">${index + 1}</td>
           <td><img src="${image}" width="100" alt=""></td>
           <td>${name}</td>
           <td>${price} VNĐ</td>
           <td class="text-center">
           <div class="d-flex justify-content-center">
           <button class="btn btn-primary btn-minus-cart" id="btn-minus-cart" data-id="${id}"> - </button>
           <input type="text" value=" ${quantity}" id="quantity-product" class="quantity-product text-center" disabled class="form-control" style="width:50px" data-id="${id}">
           <button class="btn btn-primary btn-plus-cart" id="btn-plus-cart" data-id="${id}"> + </button>
           </div>
          </td>
           <td>
           <button id="btn-remove" class="btn btn-danger btn-remove-to-cart" data-id = "${id}"><i class="fas fa-trash-alt"></i></button>
           </td>
           
           </tr>
           `;
      })
      .join("")}
        <thead>
        <th class="fs-3" colspan="4">Total : ${parseFloat(
          products.reduce(sumTotal, 0)
        ).toFixed(3)} VNĐ</th>
        <th class="text-center"><button class="btn btn-danger" id="btn-clear-cart">Clear Cart</button>
        
        
        </th>
        <th class="text-center">
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal" id="btn-checkout">
   CHECK OUT
  </button>

  <div id="showModal" ></div>

        </th>
        </thead>
        `;
  },
  async afterRender() {
    await SearchBox.afterRender();
    let btnMinus = document.querySelectorAll(".btn-minus-cart");
    let quantity_product = document.querySelectorAll(".quantity-product");
    let btnPlus = document.querySelectorAll(".btn-plus-cart");
    let products = [];
    products = JSON.parse(localStorage.getItem("products"));
    let sumTotal = (accumulator, currentValue) => {
      return accumulator + +currentValue.price;
    };
    btnMinus.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const { id: btnId } = btn.dataset;
        const id = btnId;
        const { data: product } = await ProductApi.get(id);
        quantity_product.forEach((input) => {
          const { id } = input.dataset;
          if (id == btnId) {
            --input.value;
            if (input.value < 1) {
              alert("vui lòng nhập số lượng lớn hơn 1");
              input.value = 1;
              return false;
            }
            for (let i = 0; i < products.length; i++) {
              let idProduct = products[i];
              if (idProduct.id == id) {
                console.log(typeof products[i].quantity);
                products[i].quantity--;
                products[i].price = parseFloat(
                  product.price * products[i].quantity
                ).toFixed(3);
                localStorage.setItem("products", JSON.stringify(products));
                reRender(CartProduct, "#table");
              }
            }
          }
        });
      });
    });

    btnPlus.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const { id: btnId } = btn.dataset;
        const id = btnId;
        const { data: product } = await ProductApi.get(id);
        quantity_product.forEach((input) => {
          const { id } = input.dataset;
          if (id == btnId) {
            ++input.value;
            for (let i = 0; i < products.length; i++) {
              let idProduct = products[i];
              if (idProduct.id == id) {
                console.log(typeof products[i].quantity);
                products[i].quantity++;
                products[i].price = parseFloat(
                  product.price * products[i].quantity
                ).toFixed(3);
                localStorage.setItem("products", JSON.stringify(products));
                reRender(CartProduct, "#table");
              }
            }
          }
        });
      });
    });

    let btn = document.querySelectorAll(".btn-remove-to-cart");
    btn.forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const question = confirm(
          "Bạn chắc chắn muốn xoá sản phẩm ra giỏ hàng ? "
        );
        if (question) {
          const { id } = this.dataset;
          const product = JSON.parse(localStorage.getItem("products"));
          for (let i = 0; i < product.length; i++) {
            console.log(product[i]);
            if (product[i].id == id) {
              product.splice(i, 1);
            }
          }
          let productss = JSON.stringify(product);
          localStorage.setItem("products", productss);
          await reRender(CartProduct, "#table");
          await reRender(Header, "#nav-header");
          $("#nav-header").style.marginLeft = "-70px";
          $("#navbar-header").style.height = "76px";
        }
      });
    });
    //start clear cart
    $("#btn-clear-cart").addEventListener("click", async (e) => {
      const question = confirm(
        "bạn chắc chắn muốn xoá tất cả sản phẩm trong giỏ hàng ? "
      );
      if (question) {
        let products = [];
        products = JSON.parse(localStorage.getItem("products"));
        products.length = 0;
        console.log(products.length);
        localStorage.setItem("products", JSON.stringify(products));
        await reRender(CartProduct, "#table");
        await reRender(Header, "#nav-header");
      }
    });

    //start checkout cart
    $("#btn-checkout").addEventListener("click", async (e) => {
      let products = [];
      products = JSON.parse(localStorage.getItem("products"));
      let sumTotal = (accumulator, currentValue) => {
        return accumulator + +currentValue.price;
      };
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (token == null) {
        window.location.hash = "/login";
      } else {
        const question = confirm(
          `Bạn có chắc muốn thanh toán ${parseFloat(
            products.reduce(sumTotal, 0)
          ).toFixed(3)} VNĐ`
        );
        if (question) {
          const id = localStorage.getItem("id");
          let { data: user } = await ProductApi.getInfo(id);
          // console.log(user);
          let products = [];
          products = JSON.parse(localStorage.getItem("products"));
          user[0].products = [...user[0].products, ...products];
          console.log(user[0]);
          const data_URL = "https://headphoneapi.herokuapp.com/api/users/";
          axios.put(data_URL + id, user[0], {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });

          alert("Thanh toán thàng công");
  
          products.length = 0;
          console.log(products.length);
          localStorage.setItem("products", JSON.stringify(products));
          await reRender(CartProduct, "#table");
          await reRender(Header, "#nav-header");
          location.reload();
        }
      }
    });
    return `${await SearchBox.afterRender()}${await Header.afterRender()}`;
  },
};
export default ListItemCart;
