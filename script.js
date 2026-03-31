let cart = [];
let userLocation = "";

function addToCart(name, price) {
  cart.push({name, price});
  document.getElementById("cartText").innerText = cart.length + " items";
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;

    userLocation = "https://maps.google.com/?q=" + lat + "," + lon;

    document.getElementById("locationText").innerText = "📍 Location set";
  });
}

function checkout() {
  if(cart.length === 0){
    alert("Cart empty");
    return;
  }

  let msg = "Order:%0A";
  let total = 0;

  cart.forEach(i=>{
    msg += i.name + " ₹" + i.price + "%0A";
    total += i.price;
  });

  msg += "%0ATotal: ₹" + total;

  if(userLocation){
    msg += "%0ALocation: " + userLocation;
  }

  window.open("https://wa.me/917702622925?text=" + msg);
}
