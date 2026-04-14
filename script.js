// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCThtrwNBs31H3KsM9DdVtY2ZJctnybp_0",
  authDomain: "shaketohome-a1156.firebaseapp.com",
  projectId: "shaketohome-a1156",
  storageBucket: "shaketohome-a1156.appspot.com",
  messagingSenderId: "592984047315",
  appId: "1:592984047315:web:b8bc9c9f7dc1eeebfe5e26"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== PRODUCTS (UNCHANGED) =====
const products = [
    { id: 1, name: "Oreo Shake", price: 120, category: "milkshakes", img: "Oero.jpeg" },
    { id: 2, name: "KitKat Shake", price: 120, category: "milkshakes", img: "kitkatshake.jpg" },
    { id: 3, name: "Strawberry Shake", price: 120, category: "milkshakes", img: "strawberry shake.jpg" },
    { id: 4, name: "Chocolate Shake", price: 120, category: "milkshakes", img: "chocolate shake.jpeg" },
    { id: 5, name: "Black Current", price: 120, category: "milkshakes", img: "chocolate.jpg" },
    { id: 6, name: "Pineapple Juice", price: 60, category: "juices", img: "pineapple.jpeg" },
    { id: 7, name: "Karbuja Juice", price: 60, category: "juices", img: "muskmelon.jpeg" },
    { id: 8, name: "Watermelon Juice", price: 60, category: "juices", img: "watermelon juice.jpeg" },
    { id: 9, name: "Grapes Juice", price: 60, category: "juices", img: "grape juice.jpeg" },
    { id: 10, name: "Butterscotch Cake", price: 300, category: "cakes", img: "butterscotch cake.jpeg" },
    { id: 11, name: "Pineapple Cake", price: 300, category: "cakes", img: "pineapple cake.jpeg" },
    { id: 12, name: "Black Forest", price: 300, category: "cakes", img: "black forest.jpeg" },
    { id: 13, name: "Egg Puff", price: 30, category: "puff", img: "egg puff.jpeg" },
    { id: 14, name: "Curry Puff", price: 30, category: "puff", img: "veg puff.jpeg" },
    { id: 15, name: "Chicken Puff", price: 30, category: "puff", img: "chicken puff.jpeg" },
    { id: 16, name: "Chicken Dum Biryani", price: 200, category: "biryani", img: "biryani.jpeg" },
    { id: 17, name: "Blue Mojito", price: 80, category: "mojito", img: "blue mojito.jpeg" },
    { id: 18, name: "Lime Mojito", price: 80, category: "mojito", img: "lime mojito.jpeg" },
    { id: 19, name: "Watermelon Mojito", price: 80, category: "mojito", img: "watermelon mojito.jpeg" },
    { id: 20, name: "Strawberry Mojito", price: 80, category: "mojito", img: "strawberry mojito.jpeg" }
];

// ===== STATE =====
let cart = {};
const WA_NUMBER = "917702622925";

// ===== DOM =====
const gridContainer = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const locationInput = document.getElementById("location-input");
const locationTrigger = document.getElementById("location-trigger");
const bottomCart = document.getElementById("bottom-cart");
const checkoutBtn = document.getElementById("checkout-btn");

// ===== RENDER (UNCHANGED STRUCTURE) =====
function renderProducts(items) {
    gridContainer.innerHTML = "";

    items.forEach(product => {
        const qty = cart[product.id] || 0;

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${product.img}" class="card-img">

            <div class="card-info">

                <div class="card-text">
                    <div class="card-title">${product.name}</div>
                    <div class="card-price">₹${product.price}</div>
                </div>

                <div class="btn-wrapper">
                    ${
                        qty === 0
                        ? `<button class="btn-add" onclick="updateCart(${product.id},1)">ADD</button>`
                        : `
                        <div class="btn-qty">
                            <button onclick="updateCart(${product.id},-1)">-</button>
                            <span>${qty}</span>
                            <button onclick="updateCart(${product.id},1)">+</button>
                        </div>
                        `
                    }
                </div>

            </div>
        `;

        gridContainer.appendChild(card);
    });
}

// ===== CART =====
window.updateCart = function(id, delta) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];

    renderProducts(products);
    updateCartUI();
};

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;

    Object.entries(cart).forEach(([id, qty]) => {
        totalItems += qty;
        const p = products.find(x => x.id == id);
        totalPrice += p.price * qty;
    });

    if (totalItems > 0) {
        bottomCart.classList.add("visible");
        document.getElementById("bottom-cart-items").innerText = `${totalItems} ITEMS`;
        document.getElementById("bottom-cart-total").innerText = `₹${totalPrice}`;
    } else {
        bottomCart.classList.remove("visible");
    }
}

// ===== LOCATION FIX =====
function getLocationPromise() {
    return new Promise((resolve) => {

        // Instagram fix
        if (/Instagram/i.test(navigator.userAgent)) {
            resolve(null);
            return;
        }

        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
            () => resolve(null),
            { timeout: 7000 }
        );
    });
}

async function fetchLocationUI() {
    locationInput.value = "Detecting location...";
    const loc = await getLocationPromise();

    if (loc) {
        locationInput.value = "📍 Location detected";
    } else {
        locationInput.value = "Enter location manually";
    }
}

// ===== ORDER FIX =====
async function placeOrder() {

    const loc = await getLocationPromise();

    const locationText = loc
        ? `https://maps.google.com/?q=${loc}`
        : "Location not provided";

    let message = "NEW ORDER\n\n";
    let total = 0;

    Object.entries(cart).forEach(([id, qty]) => {
        const p = products.find(x => x.id == id);
        total += p.price * qty;
        message += `${p.name} x ${qty}\n`;
    });

    message += `\nTotal: ₹${total}\n\nLocation: ${locationText}`;

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

    // 🔥 FIX: works everywhere
    window.location.href = waUrl;
}

// ===== EVENTS =====
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", placeOrder);
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(q));
        renderProducts(filtered);
    });
}

if (locationTrigger) {
    locationTrigger.addEventListener("click", fetchLocationUI);
}

// ===== INIT =====
renderProducts(products);
fetchLocationUI();
