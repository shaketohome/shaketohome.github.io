// === 1. FIREBASE CONFIGURATION (V10 Modular SDK) ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ PASTE YOUR FIREBASE CONFIG HERE ⚠️
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === 2. DOM ELEMENTS & ROUTING ===
const isRestaurantPage = document.getElementById("restaurant-grid") !== null;
const isMenuPage = document.getElementById("menu-grid") !== null;

document.addEventListener("DOMContentLoaded", () => {
    if (isRestaurantPage) {
        initRestaurantListings();
        initAddRestaurantForm();
    }
    if (isMenuPage) {
        initMenuPage();
    }
});

// === 3. RESTAURANT LISTINGS (Consumers) ===
async function initRestaurantListings() {
    const grid = document.getElementById("restaurant-grid");
    const emptyState = document.getElementById("empty-state");

    try {
        // Fetch ONLY approved restaurants
        const q = query(collection(db, "restaurants"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        
        grid.innerHTML = ""; // Clear skeletons
        
        if (querySnapshot.empty) {
            emptyState.style.display = "block";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement("a");
            card.className = "rest-card";
            card.href = `restaurant.html?id=${doc.id}`; // Routing
            
            card.innerHTML = `
                <img src="${data.image}" alt="${data.name}" class="rest-img" loading="lazy">
                <div class="rest-info">
                    <h3 class="rest-name">${data.name}</h3>
                    <p class="rest-loc">${data.location}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        grid.innerHTML = `<p style="color:red; grid-column:1/-1; text-align:center;">Failed to load restaurants.</p>`;
    }
}

// === 4. ADD RESTAURANT FORM (Owners) ===
function initAddRestaurantForm() {
    const modal = document.getElementById("add-rest-modal");
    const openBtn = document.getElementById("open-form-btn");
    const closeBtn = document.getElementById("close-form-btn");
    const form = document.getElementById("add-rest-form");
    
    // UI Elements
    const submitBtn = document.getElementById("submit-rest-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");
    const formMsg = document.getElementById("form-msg");

    // Modal Triggers
    openBtn.addEventListener("click", () => modal.classList.add("active"));
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));

    // Form Submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("rest-name").value.trim();
        const location = document.getElementById("rest-location").value.trim();
        const image = document.getElementById("rest-image").value.trim();

        // Loading State
        submitBtn.disabled = true;
        btnText.style.display = "none";
        btnSpinner.style.display = "block";
        formMsg.className = "form-msg";
        formMsg.innerText = "";

        try {
            await addDoc(collection(db, "restaurants"), {
                name: name,
                location: location,
                image: image,
                status: "pending", // REQUIRES ADMIN APPROVAL
                createdAt: serverTimestamp()
            });

            formMsg.innerText = "Success! Submitted for approval ✅";
            formMsg.classList.add("msg-success");
            form.reset();
            
            setTimeout(() => { modal.classList.remove("active"); }, 2000);

        } catch (error) {
            console.error("Error adding document: ", error);
            formMsg.innerText = "Error submitting restaurant.";
            formMsg.classList.add("msg-error");
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = "block";
            btnSpinner.style.display = "none";
        }
    });
}

// === 5. SPECIFIC RESTAURANT MENU PAGE ===
async function initMenuPage() {
    // Get ID from URL (e.g. restaurant.html?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const restId = urlParams.get('id');

    if (!restId) {
        window.location.href = "restaurants.html";
        return;
    }

    const grid = document.getElementById("menu-grid");
    const emptyState = document.getElementById("menu-empty");
    const title = document.getElementById("menu-rest-name");
    const subtitle = document.getElementById("menu-rest-location");

    try {
        // 1. Fetch Restaurant Info
        const docRef = doc(db, "restaurants", restId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            title.innerText = docSnap.data().name;
            subtitle.innerText = docSnap.data().location;
        } else {
            title.innerText = "Restaurant Not Found";
            return;
        }

        // 2. Fetch Products for this Restaurant
        const q = query(collection(db, "products"), where("restaurantId", "==", restId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            emptyState.style.display = "block";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement("div");
            card.className = "prod-card";
            
            card.innerHTML = `
                <img src="${data.image}" class="prod-img" loading="lazy">
                <h4 class="prod-name">${data.name}</h4>
                <p class="prod-price">₹${data.price}</p>
                <button class="prod-add-btn" onclick="alert('Added to cart! (Cart logic future-ready)')">ADD</button>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading menu:", error);
        title.innerText = "Error loading menu";
    }
}
