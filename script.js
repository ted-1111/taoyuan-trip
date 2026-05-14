// 1. 從 Firebase CDN 引入核心功能 (採用 v10 模組化語法)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// ⚠️ 請將以下 Config 替換為你的 Firebase 專案金鑰
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDo_xuhKcmzB3rFpnfLe6HjFPCBtg6kaXE",
    authDomain: "taoyuan-trip.firebaseapp.com",
    projectId: "taoyuan-trip",
    storageBucket: "taoyuan-trip.firebasestorage.app",
    messagingSenderId: "584304238781",
    appId: "1:584304238781:web:43fffe7694175d5e9317d4"
  };

// 2. 初始化 Firebase 與相關服務
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. 全局狀態變數
let isLoggedIn = false;
let currentUser = null;

// ==========================================
// 景點資料與純前端視覺互動 (保留原本的功能)
// ==========================================
const spotData = [
    { title: "石門水庫 私房靜謐遊湖", img: "url('https://images.unsplash.com/photo-1596400262145-36423e2fb3bc?auto=format&fit=crop&w=800&q=80')", tags: ["#湖光山色", "#平緩步道"], desc: "避開人擠人的大眾路線，深入私房秘境步道。", highlight: "專車直接停泊於最靠近絕佳景觀的特約區域。" },
    { title: "Xpark 都會型水生公園", img: "url('https://images.unsplash.com/photo-1621318164984-b06589834c91?auto=format&fit=crop&w=800&q=80')", tags: ["#快速通關", "#親子互動"], desc: "館內結合了現代科技與生態展示，沉浸式空間設計。", highlight: "包含 VIP 快速通關禮遇，免除旺季排隊購票煩躁。" },
    { title: "中原夜市 專人美食導覽", img: "url('https://images.unsplash.com/photo-1551043047-1d2adf00f3fd?auto=format&fit=crop&w=800&q=80')", tags: ["#在地美食", "#管家代購"], desc: "集結各式創意美食，非常適合體驗台灣夜市活力。", highlight: "專屬管家提供必吃美食代購服務，無須擁擠排隊。" }
];

document.addEventListener('DOMContentLoaded', () => {
    // --- 新增：載入動畫時程控制 ---
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBg = document.getElementById('loading-bg');
    const loadingIcon = document.getElementById('loading-icon');

    if (loadingScreen && loadingIcon && loadingBg) {
        // 1. 停頓 1.5 秒後，藍色背景開始擴散填滿全畫面
        setTimeout(() => {
            loadingBg.classList.add('expand');
        }, 1500);

        // 2. 擴散後停留 0.8 秒，啟動飛往左上角的動畫
        setTimeout(() => {
            // 完美交接：拔除閃爍 class，讓 transition 自動接管飛往左上角的任務
            loadingIcon.classList.remove('is-pulsing');
            loadingScreen.classList.add('shrink-to-nav');
        }, 2300);

        // 3. 飛行動畫結束後，將動畫區塊徹底移除
        setTimeout(() => {
            loadingScreen.remove();
        }, 3200);
    }
    // --- 載入動畫邏輯結束 ---

    updateNavUI();
    // 視覺特效與計價邏輯初始化
    initVisuals();
    initPricing();
    initAuthForms();
    initBookingForm();
});

// ==========================================
// Firebase 核心邏輯區
// ==========================================

// 監聽使用者登入狀態變化 (取代 LocalStorage 檢查)
onAuthStateChanged(auth, (user) => {
    if (user) {
        isLoggedIn = true;
        currentUser = user;
    } else {
        isLoggedIn = false;
        currentUser = null;
    }
    updateNavUI();
});

function initAuthForms() {
    const navAuthBtn = document.getElementById('nav-auth-btn');
    
    // 導覽列按鈕點擊事件
    navAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn) {
            // 執行 Firebase 登出
            signOut(auth).then(() => {
                alert("已成功登出。");
            }).catch((error) => console.error("登出失敗:", error));
        } else {
            openOverlay('auth-overlay');
        }
    });

    // 註冊表單提交
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pwd = document.getElementById('reg-pwd').value;
        const pwdConfirm = document.getElementById('reg-pwd-confirm').value;
        
        if (pwd !== pwdConfirm) {
            alert("密碼與確認密碼不相符！"); return;
        }

        btn.innerText = "建立帳號中..."; btn.disabled = true;

        // Firebase 註冊 API
        createUserWithEmailAndPassword(auth, email, pwd)
            .then((userCredential) => {
                // 註冊成功後，將真實姓名寫入 Firebase Profile
                return updateProfile(userCredential.user, { displayName: name });
            })
            .then(() => {
                btn.innerText = "註冊並登入"; btn.disabled = false;
                closeOverlay('auth-overlay');
                alert("帳號註冊成功！");
            })
            .catch((error) => {
                btn.innerText = "註冊並登入"; btn.disabled = false;
                alert("註冊失敗：" + getErrorMessage(error.code));
            });
    });

    // 登入表單提交
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const email = document.getElementById('login-email').value;
        const pwd = document.getElementById('login-pwd').value;

        btn.innerText = "驗證中..."; btn.disabled = true;

        // Firebase 登入 API
        signInWithEmailAndPassword(auth, email, pwd)
            .then(() => {
                btn.innerText = "繼續"; btn.disabled = false;
                closeOverlay('auth-overlay');
            })
            .catch((error) => {
                btn.innerText = "繼續"; btn.disabled = false;
                alert("登入失敗：" + getErrorMessage(error.code));
            });
    });
}

// 預訂表單提交 (將資料寫入 Firestore 資料庫)
function initBookingForm() {
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            openOverlay('auth-overlay');
            return;
        }

        const btn = document.getElementById('submit-btn');
        const dateInput = document.getElementById('date').value;
        const guestsInput = document.getElementById('guests').value;
        const totalAmount = document.getElementById('final-total').innerText;
        
        btn.innerText = "資料寫入雲端中...";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        try {
            // Firebase 寫入資料庫 API
            const docRef = await addDoc(collection(db, "bookings"), {
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || "未提供",
                travelDate: dateInput,
                guests: parseInt(guestsInput),
                totalPrice: totalAmount,
                status: "pending", // 訂單狀態：處理中
                createdAt: serverTimestamp() // 伺服器時間戳記
            });

            // 成功寫入後，顯示成功畫面
            document.getElementById('receipt-date').innerText = dateInput;
            document.getElementById('receipt-guests').innerText = `${guestsInput} 位`;
            document.getElementById('receipt-total').innerText = totalAmount;

            openOverlay('success-overlay');
        } catch (error) {
            console.error("寫入資料庫失敗: ", error);
            alert("系統繁忙，無法送出申請，請稍後再試。");
        } finally {
            btn.innerText = "送出專屬預訂申請";
            btn.style.opacity = "1";
            btn.disabled = false;
        }
    });
}

// ==========================================
// 輔助函式與原本的 UI 邏輯
// ==========================================

function updateNavUI() {
    const navAuthBtn = document.getElementById('nav-auth-btn');
    if (isLoggedIn && currentUser) {
        // 優先顯示 displayName，若無則顯示 email 前綴
        const displayName = currentUser.displayName || currentUser.email.split('@')[0];
        navAuthBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${displayName} (登出)`;
    } else {
        navAuthBtn.innerHTML = '<i class="far fa-user-circle"></i> 登入 / 註冊';
    }
}

// 翻譯 Firebase 英文錯誤代碼
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use': return '這個 Email 已經被註冊過了。';
        case 'auth/invalid-email': return 'Email 格式不正確。';
        case 'auth/weak-password': return '密碼太弱，請至少輸入 6 個字元。';
        case 'auth/user-not-found': return '找不到此帳號。';
        case 'auth/wrong-password': return '密碼錯誤。';
        case 'auth/invalid-credential': return '帳號或密碼錯誤。';
        default: return '發生未知錯誤，請聯絡客服。';
    }
}

// 以下為原本的視覺與計價邏輯，為避免全域污染已封裝至函式
function initVisuals() {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // 輪播圖邏輯...
    const track = document.getElementById('carousel-track');
    const images = track.querySelectorAll('img');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    let currentIndex = 0;
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentIndex = index;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
            document.querySelectorAll('.dot')[currentIndex].classList.add('active');
        });
        indicatorsContainer.appendChild(dot);
    });
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
        document.querySelectorAll('.dot')[currentIndex].classList.add('active');
    }, 4000);
}

function initPricing() {
    const dateInput = document.getElementById('date');
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];

    const pricePerPerson = 5800;
    const guestsSelect = document.getElementById('guests');
    guestsSelect.addEventListener('change', () => {
        const count = parseInt(guestsSelect.value);
        let total = pricePerPerson * count;
        document.getElementById('calc-base').innerText = `TWD 5,800 x ${count} 位`;
        document.getElementById('calc-total').innerText = `TWD ${total.toLocaleString()}`;
        if (count >= 4) {
            let discount = total * 0.1; total -= discount;
            document.getElementById('discount-row').style.display = 'flex';
            document.getElementById('calc-discount').innerText = `- TWD ${discount.toLocaleString()}`;
        } else {
            document.getElementById('discount-row').style.display = 'none';
        }
        const formattedTotal = `TWD ${total.toLocaleString()}`;
        document.getElementById('final-total').innerText = formattedTotal;
        document.getElementById('mobile-price-display').innerText = formattedTotal;
    });
}

// 暴露給 HTML onClick 使用的全域函式 (因為改用 Module，必須掛載到 window)
window.switchAuthTab = function(tab) {
    if (tab === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-register').classList.remove('active');
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    } else {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
    }
};

window.openOverlay = function(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeOverlay = function(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
};

window.triggerMobileBooking = function() {
    if (!isLoggedIn) { openOverlay('auth-overlay'); } 
    else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => document.getElementById('date').focus(), 500);
    }
};

window.openSpotDetail = function(index) {
    const data = spotData[index];
    if (!data) return;
    document.getElementById('spot-detail-img').style.backgroundImage = data.img;
    document.getElementById('spot-detail-title').innerText = data.title;
    document.getElementById('spot-detail-desc').innerText = data.desc;
    document.getElementById('spot-detail-highlight').innerText = data.highlight;
    const tagsContainer = document.getElementById('spot-detail-tags');
    tagsContainer.innerHTML = ''; 
    data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.innerText = tag; tagsContainer.appendChild(span);
    });
    openOverlay('spot-overlay');
};