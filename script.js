import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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
window.db = db;

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

let cart = {};
const WA_NUMBER = "917702622925";

const gridContainer = document.getElementById("product-grid");
const categoryBar = document.getElementById("category-bar");
const searchInput = document.getElementById("search-input");
const locationInput = document.getElementById("location-input");
const locationTrigger = document.getElementById("location-trigger");
const bottomCart = document.getElementById("bottom-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const paymentModal = document.getElementById("payment-modal");
const closePayment = document.getElementById("close-payment");
const confirmOrderBtn = document.getElementById("confirm-order-btn");
const payAmountDisplay = document.getElementById("pay-amount-display");
const cartBadge = document.getElementById("cart-badge");

const categoryList = ["All", "Milkshakes", "Juices", "Cakes", "Puff", "Biryani", "Mojito"];
let activeCategory = "All";

function renderCategoryBar() {
    categoryBar.innerHTML = "";
    categoryList.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `category-btn ${cat === activeCategory ? 'active' : ''}`;
        btn.innerText = cat;
        btn.addEventListener("click", () => {
            activeCategory = cat;
            renderCategoryBar();
            filterProducts();
        });
        categoryBar.appendChild(btn);
    });
}

function filterProducts() {
    const query = searchInput.value.toLowerCase();
    let filtered = products;
    
    if (activeCategory !== "All") {
        filtered = filtered.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }
    renderProducts(filtered);
}

function renderProducts(items) {
    gridContainer.innerHTML = "";
    if (items.length === 0) {
        gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-muted);">No products found.</p>`;
        return;
    }

    items.forEach(product => {
        const qty = cart[product.id] || 0;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}" class="card-img" loading="lazy">
            <div class="card-info">
                <div class="card-text">
                    <h3 class="card-title">${product.name}</h3>
                    <p class="card-price">₹${product.price}</p>
                </div>
                <div class="btn-wrapper" id="btn-wrap-${product.id}">
                    ${getButtonState(product.id, qty)}
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

function getButtonState(id, qty) {
    if (qty === 0) {
        return `<button class="btn-add" onclick="window.updateCart(${id}, 1)">ADD</button>`;
    }
    return `
        <div class="btn-qty">
            <button onclick="window.updateCart(${id}, -1)">−</button>
            <span>${qty}</span>
            <button onclick="window.updateCart(${id}, 1)">+</button>
        </div>
    `;
}

window.updateCart = function(id, delta) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    
    const wrapper = document.getElementById(`btn-wrap-${id}`);
    if (wrapper) wrapper.innerHTML = getButtonState(id, cart[id] || 0);
    
    updateCartUI();
};

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;
    
    Object.entries(cart).forEach(([id, qty]) => {
        totalItems += qty;
        const product = products.find(p => p.id === parseInt(id));
        if (product) totalPrice += product.price * qty;
    });

    cartBadge.innerText = totalItems;
    
    if (totalItems > 0) {
        document.getElementById("bottom-cart-items").innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
        document.getElementById("bottom-cart-total").innerText = `₹${totalPrice}`;
        bottomCart.classList.add("visible");
    } else {
        bottomCart.classList.remove("visible");
    }
}

function getLocationPromise() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
            () => resolve(null),
            { timeout: 7000, enableHighAccuracy: true }
        );
    });
}

async function fetchLocationUI() {
    locationInput.value = "Fetching location...";
    const loc = await getLocationPromise();
    if (loc) {
        locationInput.value = "📍 Delivering to your location";
        locationInput.style.color = "var(--success)";
    } else {
        locationInput.value = "Enter location manually";
        locationInput.style.color = "#e74c3c";
    }
}

checkoutBtn.addEventListener("click", () => {
    let total = 0;
    Object.entries(cart).forEach(([id, qty]) => {
        total += products.find(p => p.id === parseInt(id)).price * qty;
    });
    payAmountDisplay.innerText = `₹${total}`;
    paymentModal.classList.add("active");
});

closePayment.addEventListener("click", () => {
    paymentModal.classList.remove("active");
});

confirmOrderBtn.addEventListener("click", async () => {
    const originalText = confirmOrderBtn.innerText;
    confirmOrderBtn.innerText = "Processing...";
    
    const userLocation = await getLocationPromise();
    const locationText = userLocation ? `https://maps.google.com/?q=${userLocation}` : "Location not provided";
    
    let total = 0;
    let itemsString = "";
    let waItemsString = "";
    
    Object.entries(cart).forEach(([id, qty]) => {
        const product = products.find(p => p.id === parseInt(id));
        total += product.price * qty;
        itemsString += `${product.name} x ${qty}, `;
        waItemsString += `${product.name} x ${qty}\n`;
    });

    const orderId = "SHK" + Date.now();

    try {
        await setDoc(doc(window.db, "orders", orderId), {
            orderId: orderId,
            items: itemsString,
            total: total,
            paymentMethod: "Cash on Delivery",
            location: locationText,
            status: "pending",
            timestamp: serverTimestamp()
        });
    } catch (error) {
        alert("Error saving order. Please try again.");
        confirmOrderBtn.innerText = originalText;
        return;
    }

    const message = `NEW ORDER\n\n${waItemsString}\nTotal: ₹${total}\n\nLocation: ${locationText}`;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

    paymentModal.classList.remove("active");
    document.getElementById("success-overlay").classList.add("active");

    setTimeout(() => {
        window.open(waUrl, "_blank");
        location.reload();
    }, 1500);
});

searchInput.addEventListener("input", filterProducts);
locationTrigger.addEventListener("click", fetchLocationUI);

renderCategoryBar();
renderProducts(products);
fetchLocationUI();
