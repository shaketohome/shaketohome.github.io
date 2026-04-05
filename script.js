document.addEventListener("DOMContentLoaded", () => {
    // === 1. PRODUCT DATA (9 Items optimized for Unsplash CDN) ===
    const products = [
  { id: 1, name: "Oreo Thick Shake", price: 120, img: "oero.jpg" },
  { id: 2, name: "KitKat Crunch", price: 130, img: "kitkatshake.jpg" },
  { id: 3, name: "Strawberry Shake", price: 110, img: "strawberry shake.jpg" },
  { id: 4, name: "Chocolate Shake", price: 120, img: "chocolate.jpg" },
  { id: 5, name: "Sweet Lassi", price: 60, img: "lassi.jpg" },
  { id: 6, name: "Watermelon Juice", price: 50, img: "watermelon.jpg" },
  { id: 7, name: "Pineapple Juice", price: 60, img: "pineapple.jpg" },
  { id: 8, name: "Grapes Juice", price: 70, img: "grape.jpg" },
  { id: 9, name: "Fruit Box", price: 140, img: "fruit box.jpg" }
];
    
    // === 2. STATE ===
    let cart = {}; 
    let userLocation = null;
    const WA_NUMBER = "917702622925"; 
    const BUSINESS_UPI_ID = "7989846624-2@ybl"; // Updated UPI String

    // === 3. DOM ELEMENTS ===
    const gridContainer = document.getElementById("product-grid");
    const searchInput = document.getElementById("search-input");
    const locationInput = document.getElementById("location-input");
    const bottomCart = document.getElementById("bottom-cart");
    const headerCartBadge = document.getElementById("cart-badge");
    const orderBtn = document.getElementById("order-btn");

    // === 4. INIT ===
    requestLocation();
    renderProducts(products);
    checkPostPaymentReturn(); // Check if user just returned from UPI app

    // === 5. RENDER PRODUCTS ===
    function renderProducts(items) {
        gridContainer.innerHTML = "";
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

    // === 6. CART UPDATES ===
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

        headerCartBadge.innerText = totalItems;
        if (totalItems > 0) {
            document.getElementById("bottom-cart-items").innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
            document.getElementById("bottom-cart-total").innerText = `₹${totalPrice}`;
            bottomCart.classList.add("visible");
        } else {
            bottomCart.classList.remove("visible");
        }
    }

    // === 7. GPS LOCATION ===
    function requestLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    userLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
                    locationInput.value = "Location captured ✅";
                    locationInput.style.color = "var(--success)";
                },
                () => { locationInput.value = "Location access denied"; }
            );
        }
    }

    // === 8. PREMIUM PAYMENT MODAL LOGIC ===
    const paymentModal = document.getElementById("payment-modal");
    const closePaymentBtn = document.getElementById("close-payment");
    const payOptions = document.querySelectorAll(".pay-option");
    
    const codFlow = document.getElementById("cod-flow");
    const upiFlow = document.getElementById("upi-flow");
    const codConfirmBtn = document.getElementById("cod-confirm-btn");

    let currentOrderTotal = 0;

    orderBtn.addEventListener("click", () => {
        const cartKeys = Object.keys(cart);
        if (cartKeys.length === 0) return;

        currentOrderTotal = 0;
        cartKeys.forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            currentOrderTotal += product.price * cart[id];
        });

        document.getElementById("pay-amount-display").innerText = `₹${currentOrderTotal}`;
        
        // Reset selections
        payOptions.forEach(opt => opt.classList.remove("selected"));
        codFlow.style.display = "none";
        upiFlow.style.display = "none";
        
        paymentModal.classList.add("active");
    });

    closePaymentBtn.addEventListener("click", () => paymentModal.classList.remove("active"));

    payOptions.forEach(option => {
        option.addEventListener("click", function() {
            payOptions.forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            if (radio.value === "cod") {
                codFlow.style.display = "block";
                upiFlow.style.display = "none";
            } else {
                upiFlow.style.display = "block";
                codFlow.style.display = "none";
            }
        });
    });

    // Handle COD Finalization directly
    codConfirmBtn.addEventListener("click", function() {
        finalizeWhatsAppOrder(cart, currentOrderTotal, "Cash on Delivery", null);
    });

    // === 9. UPI REDIRECT & POST-PAYMENT RETURN ===
    window.triggerUPI = function(appName) {
        // 1. Save state securely to local storage
        localStorage.setItem("shaketohome_pending_order", JSON.stringify({
            savedCart: cart,
            savedTotal: currentOrderTotal,
            savedApp: appName
        }));

        // 2. Hide Modal
        paymentModal.classList.remove("active");

        // 3. Trigger UPI App
        const upiUrl = `upi://pay?pa=${BUSINESS_UPI_ID}&pn=ShakeToHome&am=${currentOrderTotal}&cu=INR`;
        window.location.href = upiUrl;
    };

    // Check if returning from a UPI app
    function checkPostPaymentReturn() {
        const pendingOrderData = localStorage.getItem("shaketohome_pending_order");
        if (pendingOrderData) {
            // Show Success Return Modal
            document.getElementById("post-payment-modal").classList.add("active");
        }
    }

    // Also check on visibility change (mobile browsers switching tabs back)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'visible') checkPostPaymentReturn();
    });

    // === 10. WHATSAPP CONFIRMATION ===
    document.getElementById("finalize-whatsapp-btn").addEventListener("click", () => {
        const pendingOrderData = localStorage.getItem("shaketohome_pending_order");
        if (!pendingOrderData) return;

        const { savedCart, savedTotal, savedApp } = JSON.parse(pendingOrderData);
        
        finalizeWhatsAppOrder(savedCart, savedTotal, "UPI (Paid)", savedApp);
        
        // Clear storage and hide modal
        localStorage.removeItem("shaketohome_pending_order");
        document.getElementById("post-payment-modal").classList.remove("active");
        
        // Clear cart globally
        cart = {};
        updateCartUI();
        renderProducts(products);
    });

    function finalizeWhatsAppOrder(activeCart, total, paymentMode, upiApp) {
        let text = `Hi, I have completed payment.\n\n*Order:*\n`;
        
        Object.keys(activeCart).forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            text += `▪ ${activeCart[id]}x ${product.name}\n`;
        });

        text += `\n*Total:* ₹${total}\n`;
        
        if (paymentMode === "Cash on Delivery") {
            text += `*Payment:* Cash on Delivery\n`;
        } else {
            text += `*Payment:* ${paymentMode}\n`;
            text += `*UPI ID:* ${BUSINESS_UPI_ID}\n`;
        }

        if (userLocation) {
            text += `*Location:*\nhttps://maps.google.com/?q=${userLocation}`;
        } else {
            text += `*Location:* (Ask customer)`;
        }

        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = waUrl;
        } else {
            window.open(waUrl, '_blank');
        }
    }
});
    // === 14. PROGRESSIVE WEB APP (PWA) INITIALIZATION ===
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js")
                .then((reg) => console.log("PWA Service Worker Registered! Scope:", reg.scope))
                .catch((err) => console.warn("PWA Service Worker Failed:", err));
        });
    }

    // Offline & Online Event Listeners
    const offlineBanner = document.getElementById("offline-banner");
    
    window.addEventListener("offline", () => {
        offlineBanner.style.display = "block";
    });

    window.addEventListener("online", () => {
        offlineBanner.style.display = "none";
        // Auto-refresh tracker if connection is restored
        if(typeof checkActiveOrder === "function") checkActiveOrder(); 
    });



