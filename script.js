import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp, collection, onSnapshot, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// === 1. FIREBASE CONFIGURATION ===
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
console.log("Firebase connected");

document.addEventListener("DOMContentLoaded", () => {

    // === ADVANCED: IN-APP BROWSER DETECTION ===
    function isInAppBrowser() {
        const ua = navigator.userAgent || navigator.vendor;
        return /Instagram|FBAN|FBAV|WhatsApp/i.test(ua);
    }

    if (isInAppBrowser()) {
        console.log("Opened inside in-app browser");
        alert("📱 Notice: You are using an in-app browser (like Instagram). For automatic GPS tracking, please open this site in Chrome or Safari. You can still order without GPS!");
    }
    
    // === 2. CATEGORIZED PRODUCT DATA ===
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

    // === 3. STATE (REMOVED GLOBAL LOCATION BUG) ===
    let cart = {}; 
    const WA_NUMBER = "917702622925"; 

    // === 4. DOM ELEMENTS ===
    const gridContainer = document.getElementById("product-grid");
    const categoryBar = document.getElementById("category-bar"); 
    const searchInput = document.getElementById("search-input");
    const locationTrigger = document.getElementById("location-trigger");
    const locationInput = document.getElementById("location-input");
    const bottomCart = document.getElementById("bottom-cart");
    const headerCartBadge = document.getElementById("cart-badge");
    const orderBtn = document.getElementById("order-btn");

    // === 5. CATEGORY FILTER LOGIC ===
    const categoryList = ["All", "Milkshakes", "Juices", "Cakes", "Puff", "Biryani", "Mojito"];
    let activeCategory = "All";

    function renderCategoryBar() {
        if (!categoryBar) return;
        categoryBar.innerHTML = ""; 
        
        categoryList.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = `category-btn tap-effect ${cat === activeCategory ? 'active' : ''}`;
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
        if (activeCategory === "All") {
            renderProducts(products); 
        } else {
            const filtered = products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
            renderProducts(filtered); 
        }
    }

    if(gridContainer) {
        renderCategoryBar(); 
        filterProducts();    
    }

    // === 6. PROMISE-BASED LOCATION CAPTURE (THE FIX) ===
    function getLocationPromise() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.log("Geolocation not supported");
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
                    resolve(coords);
                },
                (err) => {
                    console.log("Location blocked or failed:", err.message);
                    resolve(null);
                },
                {
                    timeout: 7000,
                    enableHighAccuracy: true
                }
            );
        });
    }

    // UI Updater for the top search bar location visual
    async function initLocationUI() {
        if(locationInput) locationInput.value = "Fetching GPS...";
        const loc = await getLocationPromise();
        if (loc && locationInput) {
            locationInput.value = "📍 Delivering to your location";
            locationInput.style.color = "var(--success)";
        } else if (locationInput) {
            locationInput.value = "Location blocked. Tap to retry.";
            locationInput.style.color = "#e74c3c";
        }
    }

    // Auto-fetch location UI on load & allow manual retry
    initLocationUI();
    if(locationTrigger) {
        locationTrigger.addEventListener("click", initLocationUI);
    }

    // === 7. RENDER & CART SYSTEM ===
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
                <div class="card-content">
                    <div>
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
        if (qty === 0) return `<button class="btn-add tap-effect" onclick="updateCart(${id}, 1)">ADD</button>`;
        return `
            <div class="btn-qty">
                <button class="tap-effect" onclick="updateCart(${id}, -1)">−</button>
                <span>${qty}</span>
                <button class="tap-effect" onclick="updateCart(${id}, 1)">+</button>
            </div>
        `;
    }

    window.updateCart = function(id, delta) {
        if (!cart[id]) cart[id] = 0;
        cart[id] += delta;
        if (cart[id] <= 0) delete cart[id];
        const btnWrapper = document.getElementById(`btn-wrap-${id}`);
        if(btnWrapper) btnWrapper.innerHTML = getButtonState(id, cart[id] || 0);
        updateCartUI();
    };

    function updateCartUI() {
        let totalItems = 0, totalPrice = 0;
        Object.entries(cart).forEach(([id, qty]) => {
            totalItems += qty;
            const product = products.find(p => p.id === parseInt(id));
            if(product) totalPrice += (product.price * qty);
        });
        if(headerCartBadge) headerCartBadge.innerText = totalItems;
        if (totalItems > 0 && bottomCart) {
            document.getElementById("bottom-cart-items").innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
            document.getElementById("bottom-cart-total").innerText = `₹${totalPrice}`;
            bottomCart.classList.add("visible");
        } else if(bottomCart) {
            bottomCart.classList.remove("visible");
        }
    }

    if(searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(query));
            renderProducts(filtered);
        });
    }

    // === 8. PAYMENT MODAL ===
    const paymentModal = document.getElementById("payment-modal");
    const closePaymentBtn = document.getElementById("close-payment");
    const payOptions = document.querySelectorAll(".pay-option");
    const codFlow = document.getElementById("cod-flow");
    const codConfirmBtn = document.getElementById("cod-confirm-btn");

    let currentOrderTotal = 0;

    if(orderBtn) {
        orderBtn.addEventListener("click", () => {
            const cartKeys = Object.keys(cart);
            if (cartKeys.length === 0) return;
            
            currentOrderTotal = 0;
            cartKeys.forEach(id => {
                const product = products.find(p => p.id === parseInt(id));
                currentOrderTotal += product.price * cart[id];
            });

            document.getElementById("pay-amount-display").innerText = `₹${currentOrderTotal}`;
            payOptions.forEach(opt => opt.classList.remove("selected"));
            codFlow.style.display = "none";
            paymentModal.classList.add("active");
        });
    }

    if(closePaymentBtn) closePaymentBtn.addEventListener("click", () => paymentModal.classList.remove("active"));

    payOptions.forEach(option => {
        option.addEventListener("click", function() {
            payOptions.forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            if (radio.value === "cod") {
                codFlow.style.display = "block";
            }
        });
    });

    if(codConfirmBtn) {
        codConfirmBtn.addEventListener("click", function() {
            finalizeWhatsAppOrder(cart, currentOrderTotal, "Cash on Delivery");
        });
    }

    // === 9. WHATSAPP, FIREBASE & TRACKING SYSTEM (AWAIT PROMISE FIX) ===
    async function finalizeWhatsAppOrder(activeCart, total, paymentMode) {
        const confirmBtn = document.getElementById("cod-confirm-btn");
        const originalBtnText = confirmBtn.innerText;
        confirmBtn.innerText = "Processing GPS..."; // UX improvement while waiting
        
        // 🚀 WAIT FOR LOCATION BEFORE PROCEEDING
        const userLocation = await getLocationPromise();
        console.log("Location acquired at checkout:", userLocation);

        let locationText;
        if (userLocation) {
            locationText = `https://maps.google.com/?q=${userLocation}`;
        } else {
            locationText = "Location not provided. Please ask customer on WhatsApp.";
        }

        const orderId = "SHK" + Math.floor(1000 + Math.random() * 9000);
        
        let itemsString = "";
        Object.keys(activeCart).forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            itemsString += `▪ ${activeCart[id]}x ${product.name}\n`;
        });

        console.log("Saving order to Firestore...");
        try {
            await setDoc(doc(window.db, "orders", orderId), {
                orderId: orderId,
                items: itemsString,
                total: total,
                paymentMethod: paymentMode,
                location: locationText, // Safely handled!
                status: "pending",
                timestamp: serverTimestamp()
            });
            console.log("✅ Order saved successfully! ID: ", orderId);
        } catch (error) {
            console.error("❌ FIREBASE ERROR:", error);
            alert("Database Error: " + error.message);
            confirmBtn.innerText = originalBtnText; // Reset button
            return;
        }

        // WhatsApp Message formatting
        let text = `*NEW ORDER* 🚨\n\n*Order ID:* ${orderId}\n\n*Items:*\n${itemsString}\n`;
        text += `*Total:* ₹${total}\n*Payment:* ${paymentMode}\n`;
        text += `*Location:*\n${locationText}\n\n`;
        text += `📍 *TRACK YOUR ORDER LIVE HERE:*\n`;
        text += `https://shaketohome.github.io/track.html?orderId=${orderId}`;

        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        
        if(paymentModal) paymentModal.classList.remove("active");

        // 🚀 UX IMPROVEMENT: Alert the user to share location if GPS failed
        if (!userLocation) {
            alert("⚠️ Location not detected. Please make sure to send your delivery address or share your live location in the WhatsApp chat!");
        }
        
        // Show Swiggy Style Success Animation
        const successOverlay = document.getElementById("success-overlay");
        if(successOverlay) {
            successOverlay.classList.add("active");
            setTimeout(() => {
                window.open(waUrl, '_blank');
                window.location.href = `track.html?orderId=${orderId}`;
            }, 1500);
        } else {
            window.open(waUrl, '_blank');
            window.location.href = `track.html?orderId=${orderId}`;
        }
    }
});
