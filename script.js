import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 🔥 FIREBASE
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

document.addEventListener("DOMContentLoaded", () => {

    // 🔥 PRODUCTS (UNCHANGED FILE NAMES)
    const products = [
        { id: 1, name: "Oreo Shake", price: 120, img: "Oero.jpeg" },
        { id: 2, name: "KitKat Shake", price: 120, img: "kitkatshake.jpg" },
        { id: 3, name: "Strawberry Shake", price: 120, img: "strawberry shake.jpg" },
        { id: 4, name: "Chocolate Shake", price: 120, img: "chocolate shake.jpeg" },
        { id: 5, name: "Black Current", price: 120, img: "chocolate.jpg" },

        { id: 6, name: "Pineapple Juice", price: 60, img: "pineapple.jpeg" },
        { id: 7, name: "Karbuja Juice", price: 60, img: "muskmelon.jpeg" },
        { id: 8, name: "Watermelon Juice", price: 60, img: "watermelon juice.jpeg" },
        { id: 9, name: "Grapes Juice", price: 60, img: "grape juice.jpeg" },

        { id: 10, name: "Butterscotch Cake", price: 300, img: "butterscotch cake.jpeg" },
        { id: 11, name: "Pineapple Cake", price: 300, img: "pineapple cake.jpeg" },
        { id: 12, name: "Black Forest", price: 300, img: "black forest.jpeg" },

        { id: 13, name: "Egg Puff", price: 30, img: "egg puff.jpeg" },
        { id: 14, name: "Curry Puff", price: 30, img: "veg puff.jpeg" },
        { id: 15, name: "Chicken Puff", price: 30, img: "chicken puff.jpeg" },

        { id: 16, name: "Chicken Dum Biryani", price: 200, img: "biryani.jpeg" },

        { id: 17, name: "Blue Mojito", price: 80, img: "blue mojito.jpeg" },
        { id: 18, name: "Lime Mojito", price: 80, img: "lime mojito.jpeg" },
        { id: 19, name: "Watermelon Mojito", price: 80, img: "watermelon mojito.jpeg" },
        { id: 20, name: "Strawberry Mojito", price: 80, img: "strawberry mojito.jpeg" }
    ];

    let cart = {};
    const WA_NUMBER = "917702622925";

    const grid = document.getElementById("product-grid");
    const orderBtn = document.getElementById("order-btn");

    // 🔥 LOCATION SYSTEM (FINAL FIX)
    let cachedLocation = null;
    let isFetchingLocation = false;

    function getLocationSafe() {
        return new Promise((resolve) => {

            if (cachedLocation) {
                resolve(cachedLocation);
                return;
            }

            if (isFetchingLocation) {
                setTimeout(() => resolve(cachedLocation), 2000);
                return;
            }

            isFetchingLocation = true;

            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    cachedLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
                    resolve(cachedLocation);
                    isFetchingLocation = false;
                },
                () => {
                    resolve(null);
                    isFetchingLocation = false;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        });
    }

    // 🔥 PRELOAD LOCATION (SMOOTH UX)
    getLocationSafe();

    // 🔥 RENDER PRODUCTS
    function renderProducts() {
        grid.innerHTML = "";
        products.forEach(p => {
            grid.innerHTML += `
            <div class="card">
                <img src="${p.img}" onerror="this.src='fruit box.jpg'">
                <h3>${p.name}</h3>
                <p>₹${p.price}</p>
                <button onclick="add(${p.id})">ADD</button>
            </div>`;
        });
    }

    window.add = function(id) {
        if (!cart[id]) cart[id] = 0;
        cart[id]++;
    };

    // 🔥 ORDER SYSTEM (NO ERRORS)
    orderBtn.addEventListener("click", async () => {

        if (Object.keys(cart).length === 0) {
            alert("Cart empty");
            return;
        }

        const orderId = "SHK" + Date.now();

        let items = "";
        let total = 0;

        Object.keys(cart).forEach(id => {
            const p = products.find(x => x.id == id);
            items += `${p.name} x${cart[id]}\n`;
            total += p.price * cart[id];
        });

        // 🔥 GET LOCATION SAFELY
        const userLocation = await getLocationSafe();

        let locationText = userLocation
            ? `https://maps.google.com/?q=${userLocation}`
            : "Location not provided. Please ask customer on WhatsApp.";

        // 🔥 SAVE TO FIREBASE
        try {
            await setDoc(doc(db, "orders", orderId), {
                orderId,
                items,
                total,
                location: locationText,
                status: "pending",
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error(error);
            alert("Error saving order");
            return;
        }

        // 🔥 WHATSAPP MESSAGE
        const msg = `Order ID: ${orderId}\nItems:\n${items}\nTotal: ₹${total}\nLocation: ${locationText}`;

        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");

        if (!userLocation) {
            alert("⚠️ Location not detected. Please share on WhatsApp.");
        }
    });

    renderProducts();
});
