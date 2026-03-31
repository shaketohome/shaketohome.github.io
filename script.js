let cart = [];
let userLocation = "";

function getLocation() {
  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      let lat = pos.coords.latitude;
      let lon = pos.coords.longitude;

      userLocation = "https://maps.google.com/?q=" + lat + "," + lon;

      document.getElementById("locationInput").value =
        "📍 Location set ✔";
    },
    () => {
      alert("Please allow location");
    }
  );
}

function addToCart(name, price) {
  cart.push({ name, price });

  document.getElementById("cartCount").innerText = cart.length;
  document.getElementById("orderText").innerText =
    cart.length + " items";
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart empty");
    return;
  }

  let msg = "Order:%0A";
  let total = 0;

  cart.forEach((i) => {
    msg += i.name + " ₹" + i.price + "%0A";
    total += i.price;
  });

  msg += "%0ATotal ₹" + total;

  if (userLocation) {
    msg += "%0ALocation: " + userLocation;
  }

  window.open(
    "https://wa.me/917702622925?text=" +
      encodeURIComponent(msg)
  );
}

function openWhatsApp() {
  window.open("https://wa.me/917702622925");
}

function toggleCart() {
  alert("Cart items: " + cart.length);
}
