document.addEventListener("DOMContentLoaded", () => {
    // === 1. PRODUCT DATABASE ===
    // Applied Psychology: 'bestseller' tags drive conversions.
    const products = [
        { id: 1, name: "Oreo Thick Shake", price: 120, img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", bestseller: true },
        { id: 2, name: "KitKat Crunch", price: 130, img: "https://images.unsplash.com/photo-1541658016709-82533e94bc75?w=400&q=80", bestseller: false },
        { id: 3, name: "Strawberry Splash", price: 110, img: "https://images.unsplash.com/photo-1550461716-ba4206587cce?w=400&q=80", bestseller: true },
        { id: 4, name: "Belgian Choco", price: 140, img: "https://images.unsplash.com/photo-1584314950669-e685f09908bd?w=400&q=80", bestseller: false },
        { id: 5, name: "Punjabi Sweet Lassi", price: 60, img: "https://images.unsplash.com/photo-1556610543-983196f7e4a1?w=400&q=80", bestseller: true },
        { id: 6, name: "Fresh Watermelon", price: 50, img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80", bestseller: false },
        { id: 7, name: "Pineapple Juice", price: 60, img: "https://images.unsplash.com/photo-1550828520-4cb496926bfc?w=400&q=80", bestseller: false },
        { id: 8, name: "Black Grapes", price: 70, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80", bestseller: false },
        { id: 9, name: "Black Currant", price: 140, img: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400&q=80", bestseller: true }
    ];

    // === 2. STATE ===
    let cart = {}; // { id: qty }
    let userLocation = null;
    const WA_NUMBER = "919999999999"; // Your WhatsApp Number

    // === 3. DOM ELEMENTS ===
    const gridContainer = document.getElementById("product-grid");
    const searchInput = document.getElementById("search-input");
    const bottomCart = document.getElementById("bottom-cart");
    const locationSubtitle = document.getElementById("location-subtitle");
    const locationTrigger = document.getElementById("location-trigger");

    // === 4. INITIALIZATION (Fake Loading for Premium Feel) ===
    renderSkeletons();
    requestLocation();
    
    setTimeout(() => {
        renderProducts(products);
    }, 1200); // 1.2s skeleton delay simulates app fetching

    // === 5. CORE FUNCTIONS ===

    function renderSkeletons() {
        gridContainer.innerHTML = Array(9).fill('<div class="skeleton skel-card"></div>').join('');
    }

    function renderProducts(items) {
        gridContainer.innerHTML = "";
        
        if(items.length === 0) {
            gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px 0; color: var(--gray);">No items matched your search 😕</div>`;
            return;
        }

        items.forEach(product => {
            const qty = cart[product.id] || 0;
            const badgeHTML = product.bestseller ? `<div class="bestseller-tag">Bestseller</div>` : '';
            
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                ${badgeHTML}
                <div class="veg-icon"></div>
                <img src="${product.img}" alt="${product.name}" class="product-img" loading="lazy">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">₹${product.price}</div>
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

    // Globally accessible to bind to HTML onclick
    window.updateCart = function(id, delta) {
        if (!cart[id]) cart[id] = 0;
        cart[id] += delta;
        if (cart[id] <= 0) delete cart[id];

        // Targeted DOM update - High Performance (No re-rendering grid)
        const wrapper = document.getElementById(`btn-wrap-${id}`);
        if(wrapper) {
            wrapper.innerHTML = getButtonState(id, cart[id] || 0);
            
            // Micro-animation trigger
            wrapper.classList.remove('tap-effect');
            void wrapper.offsetWidth; // Trigger reflow
            wrapper.classList.add('tap-effect');
        }

        updateBottomCart();
    };

    function updateBottomCart() {
        let totalItems = 0;
        let totalPrice = 0;

        Object.entries(cart).forEach(([id, qty]) => {
            totalItems += qty;
            const product = products.find(p => p.id === parseInt(id));
            if(product) totalPrice += (product.price * qty);
        });

        if (totalItems > 0) {
            document.getElementById("bottom-cart-items").innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
            document.getElementById("bottom-cart-total").innerText = `₹${totalPrice}`;
            bottomCart.classList.add("visible");
        } else {
            bottomCart.classList.remove("visible");
        }
    }

    // === 6. SEARCH DEBOUNCING (No lag typing) ===
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(query));
            renderProducts(filtered);
        }, 300); // 300ms debounce
    });

    // === 7. GEOLOCATION ===
    function requestLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    userLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
                    locationSubtitle.innerText = "Current Location captured ✅";
                    locationSubtitle.style.color = "var(--green)";
                },
                () => { locationSubtitle.innerText = "Location permission denied"; }
            );
        } else {
            locationSubtitle.innerText = "GPS not supported";
        }
    }

    // Allow user to tap location header to retry
    locationTrigger.addEventListener("click", () => {
        locationSubtitle.innerText = "Fetching GPS...";
        locationSubtitle.style.color = "var(--gray)";
        requestLocation();
    });

    // === 8. CHECKOUT (WhatsApp Generation) ===
    document.getElementById("order-btn").addEventListener("click", function() {
        const cartKeys = Object.keys(cart);
        if (cartKeys.length === 0) return;

        // Button fake loading state
        const originalHTML = this.innerHTML;
        this.innerHTML = `Processing...`;
        
        setTimeout(() => {
            let text = `*🚨 New Order - ShakeToHome* \n\n*Items:*\n`;
            let total = 0;
            
            cartKeys.forEach(id => {
                const product = products.find(p => p.id === parseInt(id));
                const qty = cart[id];
                const lineTotal = product.price * qty;
                total += lineTotal;
                text += `🔸 ${product.name} (x${qty}) = ₹${lineTotal}\n`;
            });

            text += `\n💰 *Total Bill: ₹${total}*\n`;
            
            if (userLocation) {
                text += `\n📍 *Customer Location:*\nhttps://maps.google.com/?q=${userLocation}`;
            } else {
                text += `\n📍 *Location:* Not provided. Ask for address.`;
            }

            const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            
            this.innerHTML = originalHTML;
        }, 800);
    });
});
