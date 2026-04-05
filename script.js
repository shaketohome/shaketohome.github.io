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
  { id: 9, name: "Black Currant", price: 140, img: "fruit box.jpg" }
];

    // === 2. STATE MANAGEMENT ===
    let cart = {}; // Format: { productId: quantity }
    let userLocation = null;
    const WA_NUMBER = "917702622925"; // Explicitly requested number

    // === 3. DOM ELEMENTS ===
    const gridContainer = document.getElementById("product-grid");
    const searchInput = document.getElementById("search-input");
    const locationInput = document.getElementById("location-input");
    const bottomCart = document.getElementById("bottom-cart");
    const headerCartBadge = document.getElementById("cart-badge");
    const orderBtn = document.getElementById("order-btn");
    
    // Modal Elements
    const modal = document.getElementById("status-modal");
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const step3 = document.getElementById("step-3");

    // === 4. INITIALIZATION ===
    requestLocation();
    renderProducts(products);

    // === 5. RENDER LOGIC ===
    function renderProducts(items) {
        gridContainer.innerHTML = "";
        
        if(items.length === 0) {
            gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-muted);">No products found.</p>`;
            return;
        }

        items.forEach(product => {
            const qty = cart[product.id] || 0;
            const card = document.createElement("div");
            card.className = "card";
            
            card.innerHTML = `
                <img src="${product.img}" alt="${product.name}" class="card-img" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlOWVjZWUiLz48L3N2Zz4='">
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
        if (qty === 0) {
            return `<button class="btn-add tap-effect" onclick="updateCart(${id}, 1)">ADD</button>`;
        }
        return `
            <div class="btn-qty">
                <button class="tap-effect" onclick="updateCart(${id}, -1)">−</button>
                <span>${qty}</span>
                <button class="tap-effect" onclick="updateCart(${id}, 1)">+</button>
            </div>
        `;
    }

    // === 6. CART LOGIC (Instant Updates) ===
    window.updateCart = function(id, delta) {
        if (!cart[id]) cart[id] = 0;
        cart[id] += delta;
        
        if (cart[id] <= 0) delete cart[id];

        // Target Specific DOM Element without page reload
        const btnWrapper = document.getElementById(`btn-wrap-${id}`);
        if(btnWrapper) {
            btnWrapper.innerHTML = getButtonState(id, cart[id] || 0);
        }

        updateCartUI();
    };

    function updateCartUI() {
        let totalItems = 0;
        let totalPrice = 0;

        Object.entries(cart).forEach(([id, qty]) => {
            totalItems += qty;
            const product = products.find(p => p.id === parseInt(id));
            if(product) totalPrice += (product.price * qty);
        });

        // Update Header
        headerCartBadge.innerText = totalItems;

        // Update Bottom Sticky Cart
        if (totalItems > 0) {
            document.getElementById("bottom-cart-items").innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
            document.getElementById("bottom-cart-total").innerText = `₹${totalPrice}`;
            bottomCart.classList.add("visible");
        } else {
            bottomCart.classList.remove("visible");
        }
    }

    // === 7. SEARCH & FILTER ===
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        renderProducts(filtered);
    });

     // === 8. UPGRADED GEOLOCATION (Reverse Geocoding) ===
    function requestLocation() {
        const savedLoc = localStorage.getItem('shaketohome_loc');
        if (savedLoc) {
            const locData = JSON.parse(savedLoc);
            userLocation = locData.coords;
            locationInput.value = `Delivering to ${locData.area} 📍`;
            locationInput.style.color = "var(--success)";
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    userLocation = `${lat},${lon}`;
                    
                    try {
                        // Free reverse geocoding API
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await res.json();
                        const area = data.address.suburb || data.address.city || data.address.village || "Current Location";
                        
                        locationInput.value = `Delivering to ${area} 📍`;
                        locationInput.style.color = "var(--success)";
                        
                        // Save to history
                        localStorage.setItem('shaketohome_loc', JSON.stringify({ coords: userLocation, area: area }));
                    } catch (e) {
                        locationInput.value = "Location captured ✅";
                        locationInput.style.color = "var(--success)";
                    }
                },
                (error) => {
                    locationInput.value = "Location access denied";
                }
            );
        }
    }
      // === 9. SMART PAYMENT FLOW & CHECKOUT ===
    const paymentModal = document.getElementById("payment-modal");
    const closePaymentBtn = document.getElementById("close-payment");
    const payOptions = document.querySelectorAll(".pay-option");
    
    // Flow Containers
    const codFlow = document.getElementById("cod-flow");
    const upiFlow = document.getElementById("upi-flow");
    const upiConfirmBtn = document.getElementById("upi-confirm-btn");
    const codConfirmBtn = document.getElementById("cod-confirm-btn");

    const BUSINESS_UPI_ID = "7702622925@ybl"; // Change to your actual UPI ID
    let currentOrderTotal = 0;
    let selectedUpiApp = "";

    // 1. Intercept bottom "Order Now" to open modal
    orderBtn.addEventListener("click", () => {
        const cartKeys = Object.keys(cart);
        if (cartKeys.length === 0) return alert("Your cart is empty!");

        // Calculate Total
        currentOrderTotal = 0;
        cartKeys.forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            currentOrderTotal += product.price * cart[id];
        });

        document.getElementById("pay-amount-display").innerText = `₹${currentOrderTotal}`;
        
        // Reset Modal State
        document.querySelectorAll('input[name="pay-mode"]').forEach(r => r.checked = false);
        payOptions.forEach(opt => opt.classList.remove("selected"));
        codFlow.style.display = "none";
        upiFlow.style.display = "none";
        upiConfirmBtn.style.display = "none";
        codConfirmBtn.innerHTML = "Place Order (COD) →";
        upiConfirmBtn.innerHTML = "I HAVE PAID → Send Order";

        paymentModal.classList.add("active");
    });

    closePaymentBtn.addEventListener("click", () => paymentModal.classList.remove("active"));

    // 2. Handle Payment Method Selection
    payOptions.forEach(option => {
        option.addEventListener("click", function() {
            // Remove highlight from all, add to clicked
            payOptions.forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");
            
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            // Toggle flows
            if (radio.value === "cod") {
                codFlow.style.display = "block";
                upiFlow.style.display = "none";
            } else {
                upiFlow.style.display = "block";
                codFlow.style.display = "none";
            }
        });
    });

    // 3. Trigger UPI App Intent
    window.triggerUPI = function(appName) {
        selectedUpiApp = appName;
        const upiUrl = `upi://pay?pa=${BUSINESS_UPI_ID}&pn=ShakeToHome&am=${currentOrderTotal}&cu=INR`;
        
        // Open UPI deep link
        window.location.href = upiUrl;

        // Show "I HAVE PAID" button once they return
        setTimeout(() => {
            upiConfirmBtn.style.display = "flex";
        }, 1000);
    };

    // 4. Submit Order (COD)
    codConfirmBtn.addEventListener("click", function() {
        this.innerHTML = "Redirecting...";
        this.classList.add("btn-loading");
        finalizeOrder("Cash on Delivery");
    });

    // 5. Submit Order (UPI)
    upiConfirmBtn.addEventListener("click", function() {
        this.innerHTML = "Redirecting...";
        this.classList.add("btn-loading");
        finalizeOrder("UPI (Paid)", selectedUpiApp);
    });

    // 6. Generate WhatsApp Message
    function finalizeOrder(paymentMode, upiApp = null) {
        const cartKeys = Object.keys(cart);
        let text = `*🚨 New Order - ShakeToHome* 🥤\n\n`;
        text += `*🛍️ Order Items:*\n`;
        
        cartKeys.forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            const qty = cart[id];
            text += `▪ ${qty}x ${product.name}\n`;
        });

        text += `\n💰 *Total:* ₹${currentOrderTotal}\n`;
        
        if (paymentMode === "Cash on Delivery") {
            text += `💳 *Payment Mode:* Cash on Delivery\n`;
        } else {
            text += `💳 *Payment Mode:* UPI (Paid)\n`;
            text += `📱 *UPI App:* ${upiApp}\n`;
        }

        // Add GPS Location Link
        if (userLocation) {
            text += `\n📍 *Location:*\nhttps://maps.google.com/?q=${userLocation}`;
        } else {
            text += `\n📍 *Location:* Not captured automatically.`;
        }

        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        
        // Hide Modal
        paymentModal.classList.remove("active");

        // iOS Fix Implementation
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = waUrl;
        } else {
            window.open(waUrl, '_blank');
        }
        
        // Reset button states
        setTimeout(() => {
            codConfirmBtn.classList.remove("btn-loading");
            upiConfirmBtn.classList.remove("btn-loading");
        }, 1000);
    }
});

