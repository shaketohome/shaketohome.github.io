let cart = [];

function orderItem(item) {
  cart.push(item);
  alert(item + " added to cart");
}

function whatsappOrder() {
  let message = "Hello, I want to order:\n" + cart.join(", ");
  let url = "https://wa.me/919999999999?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}
