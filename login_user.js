import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Global variables provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db;
let auth;
let isAuthReady = false;

async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Authenticate user
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
        isAuthReady = true;
        console.log("Firebase initialized for login page.");
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        displayMessage("Gagal menginisialisasi Firebase. Coba lagi nanti.", 'error');
    }
}

function displayMessage(message, type) {
    const loginMessage = document.getElementById('loginMessage');
    loginMessage.textContent = message;
    loginMessage.className = `message ${type}`;
    loginMessage.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', initFirebase);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah form dari reload halaman

    if (!isAuthReady) {
        displayMessage("Sistem belum siap. Coba lagi.", 'error');
        return;
    }

    const kodeMain = document.getElementById('kode_main').value;
    const pwMain = document.getElementById('pw_main').value;

    try {
        // Query Firestore untuk mencari kode simulasi
        const simulationsRef = collection(db, `/artifacts/${appId}/public/data/simulations`);
        const q = query(simulationsRef, where("code", "==", kodeMain));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            displayMessage("ID atau Kata Sandi salah.", 'error');
        } else {
            let loggedIn = false;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.password === pwMain) {
                    loggedIn = true;
                    // Simpan status login di sessionStorage
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('simulationCode', kodeMain);
                    sessionStorage.setItem('simulationTeamName', data.teamName || 'Tim [Isi Nama]');
                }
            });

            if (loggedIn) {
                displayMessage("Login berhasil! Mengarahkan...", 'success');
                window.location.href = 'dashboard_erp.html'; // Redirect ke dashboard ERP
            } else {
                displayMessage("ID atau Kata Sandi salah.", 'error');
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        displayMessage("Terjadi kesalahan saat login. Coba lagi.", 'error');
    }
});