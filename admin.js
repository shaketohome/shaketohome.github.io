import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDeUeVIT2rLalOnakBpG-foWuwxyTvbohY",
    authDomain: "shaketohome-8a8fd.firebaseapp.com",
    projectId: "shaketohome-8a8fd",
    storageBucket: "shaketohome-8a8fd.firebasestorage.app",
    messagingSenderId: "770234040999",
    appId: "1:770234040999:web:921e74cb1c222a0858d182"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("orders-container");
const emptyState = document.getElementById("empty-state");
const notificationSound = document.getElementById("notification-sound");

let previousOrderCount = 0;

// Listen to Firestore in Real-Time
const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    // Check if a NEW order arrived to play sound
    if (snapshot.size > previousOrderCount && previousOrderCount !== 0) {
        notificationSound.play().catch(e => console.log("Audio play blocked by browser interaction rules"));
    }
    previousOrderCount = snapshot.size;

    if (snapshot.empty) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    let ordersHTML = "";

    // Sort Logic (Pending -> Accepted -> Out -> Delivered)
    const statusWeight = { "pending": 1, "accepted": 2, "out": 3, "delivered": 4 };
    
    let ordersArray = [];
    snapshot.forEach(doc => ordersArray.push(doc.data()));
    ordersArray.sort((a, b) => statusWeight[a.status] - statusWeight[b.status]);

    ordersArray.forEach((data) => {
        let buttonsHTML = "";
        
        // Show correct buttons based on status
        if (data.status === "pending") {
            buttonsHTML = `<button class="btn btn-accept" onclick="changeStatus('${data.orderId}', 'accepted')">Accept Order</button>`;
        } else if (data.status === "accepted") {
            buttonsHTML = `<button class="btn btn-out" onclick="changeStatus('${data.orderId}', 'out')">Out for Delivery</button>`;
        } else if (data.status === "out") {
            buttonsHTML = `<button class="btn btn-deliver" onclick="changeStatus('${data.orderId}', 'delivered')">Mark Delivered</button>`;
        }

        const mapBtn = data.location !== "Not provided" 
            ? `<a href="${data.location}" target="_blank" class="map-btn">📍 Open in Maps</a>` 
            : `<span style="color:var(--gray);font-size:0.8rem;">📍 Location missing</span>`;

        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${data.orderId}</span>
                    <span class="status-badge status-${data.status}">${data.status}</span>
                </div>
                <div class="order-body">
                    <strong>Items:</strong>
                    <div class="items-list">${data.items}</div>
                    <div class="total-price">Total: ₹${data.total}</div>
                    <div style="margin-top: 4px; font-size:0.85rem; color:var(--gray);">Paid via: ${data.paymentMethod}</div>
                    ${mapBtn}
                </div>
                <div class="action-buttons">
                    ${buttonsHTML}
                </div>
            </div>
        `;
    });

    container.innerHTML = ordersHTML;
});

// Global function to update status
window.changeStatus = async function(orderId, newStatus) {
    try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
        console.error("Error updating status: ", error);
        alert("Failed to update status.");
    }
};
