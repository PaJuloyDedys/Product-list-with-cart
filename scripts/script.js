"use strict";

// const { createElement } = require("react");

// Getting data from DOM

const dessertCont = document.querySelector("._desserts");

async function getData() {
  try {
    const response = await fetch("../data.json");
    return await response.json();
  } catch (err) {
    console.error(`${err} oops...`);
  }
}

function renderData(data) {
  data.forEach((item, index) => {
    const cart = document.createElement("div");
    cart.innerHTML = `
  <div class="_desserts__form"
           data-id="${index}" 
           data-name="${item.name}" 
           data-price="${item.price}" 
           data-category="${item.category}"
           data-image="${item.image.desktop}">
    <div class="_desserts__img_container">
      <img class="_desserts__img" src="${item.image.desktop}" />
      
      <button class="btn btn-add">
        <img class="add__icon" src="assets/images/icon-add-to-cart.svg" />
        Add to cart
      </button>

      <div class="btn-qty hidden">
        <button class="btn-minus">−</button>
        <span class="qty">1</span>
        <button class="btn-plus">+</button>
      </div>
    </div>
    <div class="_desserts__text">
      <p class="_desserts__name">${item.name}</p>
      <p class="_desserts__fullName">${item.category}</p>
      <p class="_desserts__price">$${item.price.toFixed(2)}</p>
    </div>
  </div>`;
    // console.log(cart);
    dessertCont.appendChild(cart);
  });
}

(async function () {
  const data = await getData();
  renderData(data);
})();

// Adding desserts with cart

const cartCount = document.querySelector(".cart-count");
const cartList = document.querySelector(".cart__add");
const totalOrderEl = document.querySelector(".total-order");
const items = document.querySelector(".items");
const empty = document.querySelector(".empty");
let cart = {};

const updateCart = function () {
  let totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;
};

const updateTotalOrder = function () {
  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  totalOrderEl.textContent = total.toFixed(2);
};

const renderCart = function () {
  cartList.innerHTML = "";
  Object.entries(cart).forEach(([id, item]) => {
    const cartItemEl = document.createElement("div");
    cartItemEl.classList.add("cart__item");
    cartItemEl.dataset.id = id;
    cartItemEl.innerHTML = `
    <div class="grid__cart">
    <div class="cart__add_text">
    <p class="form__name">${item.name}</p>
    <a class="form__count">x${item.qty}</a>
    <a class="form__static_price">@ $${item.price.toFixed(2)}</a>
    <a class="form__current_price">$${(item.price * item.qty).toFixed(2)}</a>
    </div>
    <button class="btn__close">✖</button>
    </div>`;
    cartList.appendChild(cartItemEl);
  });
  console.log(cart);
};

dessertCont.addEventListener("click", function (e) {
  const card = e.target.closest("._desserts__form");
  if (!card) return;
  items.classList.remove("hidden");
  empty.classList.add("hidden");
  const id = card.dataset.id;
  const name = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const image = card.dataset.image;

  if (e.target.closest(".btn-add")) {
    card.querySelector(".btn-add").classList.add("hidden");
    card.querySelector(".btn-qty").classList.remove("hidden");

    if (!cart[id]) {
      cart[id] = { name, price, qty: 1, image };
    } else {
      cart[id].qty++;
    }
    updateCart();
    renderCart();
    updateTotalOrder();
  }

  if (e.target.closest(".btn-plus")) {
    const qtyEl = card.querySelector(".qty");
    qtyEl.textContent = +qtyEl.textContent + 1;

    cart[id].qty++;
    updateCart();
    renderCart();
    updateTotalOrder();
  }

  if (e.target.closest(".btn-minus")) {
    const qtyEl = card.querySelector(".qty");
    let qty = +qtyEl.textContent - 1;
    if (qty <= 0) {
      qty = 0;
      delete cart[id];
      card.querySelector(".btn-qty").classList.add("hidden");
      card.querySelector(".btn-add").classList.remove("hidden");
    } else {
      cart[id].qty--;
    }
    qtyEl.textContent = qty;
    updateCart();
    renderCart();
    updateTotalOrder();
  }
});

function handleClose(e) {
  if (e.target.closest(".btn__close")) {
    const cartItemEl = e.target.closest(".cart__item");
    const id = cartItemEl.dataset.id;

    delete cart[id];

    const dessertCard = document.querySelector(
      `._desserts__form[data-id="${id}"]`
    );
    if (dessertCard) {
      dessertCard.querySelector(".btn-qty").classList.add("hidden");
      dessertCard.querySelector(".btn-add").classList.remove("hidden");
      dessertCard.querySelector(".qty").textContent = 1; // reset to default
    }

    updateCart();
    renderCart();
    updateTotalOrder();
  }
}

cartList.addEventListener("click", handleClose);

cartList.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleClose(e);
  }
});

const orderForm = document.querySelector(".order-confirm");
const btnConfirm = document.querySelector(".btn__order");
const order_data = document.querySelector(".order-data");
const order_total2 = document.querySelector(".order-total");
const overlay = document.querySelector(".overlay");

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function handleConfirm() {
  order_data.innerHTML = "";

  if (Object.keys(cart).length <= 0) {
    return alert("Choose some desserts");
  }

  scrollToTop();

  orderForm.classList.remove("hidden");
  overlay.classList.remove("hidden");

  Object.entries(cart).forEach(([id, item]) => {
    const orderEl = document.createElement("div");
    orderEl.classList.add("order-item");
    orderEl.innerHTML = `
      <div class='order-main1'>
        <div class="order-main">
          <p class="order-name">${item.name}</p>
          <img src="${item.image}" class="order-img" />
          <div style="display: flex; flex-direction: column; margin-left: 1rem;">
            <p class="order-qty">${item.qty}x @ $${item.price.toFixed(2)}</p>
          </div>
        </div>
        <p class="order-full-price">
          $${(item.qty * item.price).toFixed(2)}
        </p>
      </div>`;
    order_data.appendChild(orderEl);
  });

  order_total2.textContent = totalOrderEl.textContent;
}

btnConfirm.addEventListener("click", handleConfirm);

btnConfirm.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleConfirm();
  }
});

const btn_end_order = document.querySelector(".btn-order");
btn_end_order.addEventListener("click", function () {
  cart = {};
  updateCart();
  renderCart();
  updateTotalOrder();
  document.querySelectorAll("._desserts__form").forEach((card) => {
    card.querySelector(".btn-qty").classList.add("hidden");
    card.querySelector(".btn-add").classList.remove("hidden");
    card.querySelector(".qty").textContent = 1;
  });
  orderForm.classList.add("hidden");
  overlay.classList.add("hidden");
});
