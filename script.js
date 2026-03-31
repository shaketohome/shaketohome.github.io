let cart = {};
let userLocation = "";

/* INIT */
function initApp() {
  requestLocation();
}

/* LOCATION AUTO ASK */
function requestLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      let lat = pos.coords.latitude;
      let lon = pos.coords.longitude;

      userLocation = "https://maps.google.com/?q=" + lat + "," + lon;

      document.getElementById("locationInput").value =
        "📍 Location captured";
    },
    () => {
      console.log("Location denied");
    }
  );
}

/* ADD TO CART */
function addToCart(name, price, id) {
  cart[id] = { name, price, qty: 1 };
  updateUI();
}

/* INCREASE */
function increase(id) {
  cart[id].qty++;
  updateUI();
}

/* DECREASE */
function decrease(id) {
  cart[id].qty--;

  if (cart[id].qty <= 0) {
    delete cart[id];
  }

  updateUI();
}

/* UPDATE UI */
function updateUI() {
  let totalItems = 0;

  document.querySelectorAll(".item").forEach((item, index) => {
    let controls = item.querySelector(".controls");

    if (cart[index]) {
      controls.innerHTML = `
        <div class="qtyBox">
          <button onclick="decrease(${index})">-</button>
          <span>${cart[index].qty}</span>
          <button onclick="increase(${index})">+</button>
        </div>
      `;
      totalItems += cart[index].qty;
    } else {
      controls.innerHTML = `
        <button onclick="addToCart('${item.dataset.name}', ${item.dataset.price}, ${index})">
          Add
        </button>
      `;
    }
  });

  document.getElementById("cartCount").innerText = totalItems;
  document.getElementById("orderText").innerText = totalItems + " items";
}

/* CHECKOUT */
function checkout() {
  if (Object.keys(cart).length === 0) {
    alert("Cart empty");
    return;
  }

  let msg = "Order:\n";
  let total = 0;

  Object.values(cart).forEach((i) => {
    msg += i.name + " x" + i.qty + " ₹" + (i.price * i.qty) + "\n";
    total += i.price * i.qty;
  });

  msg += "\nTotal: ₹" + total;

  if (userLocation) {
    msg += "\nLocation: " + userLocation;
  }

  window.open(
    "https://wa.me/917702622925?text=" + encodeURIComponent(msg)
  );
}
