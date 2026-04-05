document.addEventListener("DOMContentLoaded", () => {
    // === PRODUCT DATA ===
    const products = [
        { id: 1, name: "Oreo Shake", price: 120, img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80" },
        { id: 2, name: "KitKat Shake", price: 130, img: "https://images.unsplash.com/photo-1541658016709-82533e94bc75?w=400&q=80" },
        { id: 3, name: "Strawberry", price: 110, img: "https://images.unsplash.com/photo-1550461716-ba4206587cce?w=400&q=80" },
        { id: 4, name: "Choco Shake", price: 120, img: "https://images.unsplash.com/photo-1584314950669-e685f09908bd?w=400&q=80" },
        { id: 5, name: "Sweet Lassi", price: 60, img: "https://images.unsplash.com/photo-1556610543-983196f7e4a1?w=400&q=80" },
        { id: 6, name: "Watermelon", price: 50, img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80" },
        { id: 7, name: "Pineapple", price: 60, img: "https://images.unsplash.com/photo-1550828520-4cb496926bfc?w=400&q=80" },
        { id: 8, name: "Grapes Juice", price: 70, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80" },
        { id: 9, name: "Black Currant", price: 140, img: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400&q=80" }
    ];

    // === STATE ===
    let cart = {}; // Format: { productId: quantity }
    let userLocation = null;
    const WA_NUMBER = "919999999999"; // Replace with actual business WhatsApp number

    // === DOM ELEMENTS ===
    const gridContainer = document.getElementById("product-grid");
    const searchInput = document.getElementById("search-input");
    const locationInput = document.getElementById("location-input");
    const cartBadge = document.getElementById("cart-badge");
    const bottomCart = document.getElementById("bottom-cart");
    const bottomCartItems = document.getElementById("bottom-cart-items");
    const bottomCartTotal = document.getElementById("bottom-cart-total");
    const orderBtn = document.getElementById("order-btn");

    // === INITIALIZATION ===
    renderProducts(products);
    requestLocation();

    // === FUNCTIONS ===

    // Render Product Grid
    function renderProducts(itemsToRender) {
        gridContainer.innerHTML = "";
        
        if(itemsToRender.length === 0) {
            gridContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;'>No items found.</p>";
            return;
        }

        itemsToRender.forEach(product => {
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
                    <div class="btn-add-container" id="btn-container-${product.id}">
                        ${getButtonHTML(product.id, qty)}
                    </div>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    }

    // Generate Button HTML based on Quantity
    function getButtonHTML(id, qty) {
        if (qty === 0) {
            return `<button class="btn-add" onclick="updateCart(${id}, 1)">ADD</button>`;
        } else {
            return `
                <div class="btn-qty">
                    <button onclick="updateCart(${id}, -1)">-</button>
                    <span>${qty}</span>
                    <button onclick="updateCart(${id}, 1)">+</button>
                </div>
            `;
        }
    }

    // Update Cart Logic
    window.updateCart = function(id, delta) {
        if (!cart[id]) cart[id] = 0;
        
        cart[id] += delta;
        
        if (cart[id] <= 0) {
            delete cart[id];
        }

        // Update specific button UI without re-rendering entire grid
        const container = document.getElementById(`btn-container-${id}`);
        if(container) {
            container.innerHTML = getButtonHTML(id, cart[id] || 0);
        }

        updateCartUI();
    };

    // Update Global Cart UI (Header & Bottom Bar)
    function updateCartUI() {
        let totalItems = 0;
        let totalPrice = 0;

        for (const [id, qty] of Object.entries(cart)) {
            totalItems += qty;
            const product = products.find(p => p.id === parseInt(id));
            if(product) {
                totalPrice += (product.price * qty);
            }
        }

        cartBadge.textContent = totalItems;

        if (totalItems > 0) {
            bottomCartItems.textContent = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
            bottomCartTotal.textContent = `₹${totalPrice}`;
            bottomCart.classList.add("visible");
        } else {
            bottomCart.classList.remove("visible");
        }
    }

    // Geolocation API
    function requestLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = `${position.coords.latitude},${position.coords.longitude}`;
                    locationInput.value = "Location captured ✅";
                    locationInput.style.color = "green";
                },
                (error) => {
                    locationInput.value = "Location access denied";
                    console.warn("Geolocation Error: ", error.message);
                }
            );
        } else {
            locationInput.value = "Geolocation not supported";
        }
    }

    // Search Filter Event
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        renderProducts(filtered);
    });

    // Checkout via WhatsApp
    orderBtn.addEventListener("click", () => {
        const cartKeys = Object.keys(cart);
        
        if (cartKeys.length === 0) {
            alert("Your cart is empty! Please add items to order.");
            return;
        }

        // Change button briefly to simulate processing
        const originalText = orderBtn.innerHTML;
        orderBtn.innerHTML = "Preparing...";
        
        setTimeout(() => {
            let text = `*New Order - ShakeToHome Bhupalpally* 🥤\n\n`;
            text += `*Order Details:*\n`;
            
            let total = 0;
            cartKeys.forEach(id => {
                const product = products.find(p => p.id === parseInt(id));
                const qty = cart[id];
                const lineTotal = product.price * qty;
                total += lineTotal;
                text += `▪ ${product.name}  x${qty}  -  ₹${lineTotal}\n`;
            });

            text += `\n*Total Amount:* ₹${total}\n`;

            if (userLocation) {
                text += `\n*Customer Location:*\nhttps://maps.google.com/?q=${userLocation}`;
            } else {
                text += `\n*Customer Location:* Not provided. Please ask customer for delivery address.`;
            }

            // Encode and Open WhatsApp
            const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            
            orderBtn.innerHTML = originalText;
        }, 600); // Slight delay for UI feedback
    });
});
