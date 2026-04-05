document.addEventListener("DOMContentLoaded", () => {
    // === 1. PRODUCT DATA (9 Items optimized for Unsplash CDN) ===
    const products = [
        { id: 1, name: "Oreo Thick Shake", price: 120, img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=75&fm=webp" },
        { id: 2, name: "KitKat Crunch", price: 130, img: "https://images.unsplash.com/photo-1541658016709-82533e94bc75?w=300&q=75&fm=webp" },
        { id: 3, name: "Strawberry Shake", price: 110, img: "https://images.unsplash.com/photo-1550461716-ba4206587cce?w=300&q=75&fm=webp" },
        { id: 4, name: "Chocolate Shake", price: 120, img: "https://images.unsplash.com/photo-1584314950669-e685f09908bd?w=300&q=75&fm=webp" },
        { id: 5, name: "Sweet Lassi", price: 60, img: "https://images.unsplash.com/photo-1556610543-983196f7e4a1?w=300&q=75&fm=webp" },
        { id: 6, name: "Watermelon Juice", price: 50, img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=75&fm=webp" },
        { id: 7, name: "Pineapple Juice", price: 60, img: "https://images.unsplash.com/photo-1550828520-4cb496926bfc?w=300&q=75&fm=webp" },
        { id: 8, name: "Grapes Juice", price: 70, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&q=75&fm=webp" },
        { id: 9, name: "Black Currant", price: 140, img: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=300&q=75&fm=webp" }
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
    // === 9. CHECKOUT & iOS FIX IMPLEMENTATION ===
    orderBtn.addEventListener("click", () => {
        const cartKeys = Object.keys(cart);
        
        if (cartKeys.length === 0) {
            alert("Your cart is empty! Add some drinks to continue.");
            return;
        }

        // 1. Show Fake Status Modal
        modal.classList.add("active");
        step1.className = "step done";
        step1.innerText = "✓ Order Received";
        step2.className = "step done";
        step2.innerText = "✓ Details Prepared";
        step3.className = "step active";
        step3.innerText = "✓ Opening WhatsApp...";

        // 2. Trigger WhatsApp IMMEDIATELY (Fixes iOS Safari popup blocking)
        generateWhatsAppMessage(cartKeys);
        
        // Hide Modal shortly after redirecting (if user navigates back)
        setTimeout(() => { modal.classList.remove("active"); }, 1500);
    });

    function generateWhatsAppMessage(cartKeys) {
        let text = `*New Order - ShakeToHome Bhupalpally* 🥤\n\n`;
        text += `*Order Details:*\n`;
        
        let total = 0;
        cartKeys.forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            const qty = cart[id];
            const lineTotal = product.price * qty;
            total += lineTotal;
            text += `▪ ${qty}x ${product.name} - ₹${lineTotal}\n`;
        });

        text += `\n*Total Amount:* ₹${total}\n`;

        if (userLocation) {
            text += `\n*Delivery Location:*\nhttps://maps.google.com/?q=${userLocation}`;
        } else {
            text += `\n*Delivery Location:* Not provided. Please ask the customer for their address.`;
        }

        // Encode the message
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        
        // --- iOS Specific Fix ---
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isIOS) {
            // iOS safe routing (Modifies current window, never gets blocked)
            window.location.href = waUrl;
        } else {
            // Standard routing for Android / PC
            window.open(waUrl, '_blank');
        }
    }
});

