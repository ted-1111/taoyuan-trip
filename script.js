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
    { title: "石門水庫 遊湖賞景", tags: ["#四季美景勝地", "#壯闊湖光山色"], desc: "一年四季 風情萬種\n\n四季美景不間斷，山櫻、流蘇花、阿勃勒、秋楓及寒梅，賞花賞景、走馬看花，每個月都有嶄新體驗。\n\n湖光山色 遊湖經典\n\n來到石門水庫，遊湖延著蜿蜒的水道，行經石秀灣瀑布、龍珠灣等景點，碧色湖景猶如置身仙境，若是巧遇洩洪，也能一睹壯觀的震撼景色。" },
    { title: "月眉人工濕地 歐式落羽松秘境", tags: ["#落羽松祕境", "#全年齡友善"], desc: "春夏的綠意盎然 秋冬的橘黃景致\n\n月眉人工濕地最著名的就是300多株的落羽松，優美的落羽松祕境串連平緩步道與國家級古蹟，從容自在間將美景盡收眼底。\n\n10座生態池 倒映於波光的靜謐世界\n\n清澈湖畔與茂盛落羽松編織出歐風美景，宛如天堂祕境，每一張照片都猶如國外風景明信片，草木倒映的光影形成唯美的顛倒世界。" },
    { title: "大溪老街 人文小吃群英薈萃", tags: ["#百年巴洛克建築", "#在地手作豆干"], desc: "巴洛克風格建築 沉浸百年街區風采\n\n日治大正時代正流行巴洛克的建築風格，各個商號結合了閩南的傳統圖案與巴洛克式的繁飾主義，老屋保存狀況良好，盡顯大正時代建築風采。\n\n經典小吃X傳統木藝  感受道地臺灣味\n\n提到大溪老街不得不提的就是豆干，除了豆干外還有碗粿、大腸包小腸及豆花等多樣美食，一飽口福。老街也有精巧的木雕工藝品，一睹職人精神與美的感動。" },
    { title: "虎頭山公園 桃園市的後花園", tags: ["#全齡友善步道", "#森林慢活養生"], desc: "樂活森呼吸 平緩易行的後花園\n\n虎頭山公園是專為全年齡設計的城市綠肺，特別規劃了全臺最長的「全齡友善步道」。步道採用無障礙坡道設計，讓長輩在翠綠山巒間行走如履平地，無需費力攀爬即可沉浸在森林芬多精中，是一處能舒展筋骨、靜心養生的桃園後花園。\n\n樹蔭下的樂活時光 尋回簡單的純粹快樂\n\n廣闊的公園內設有多處涼亭與長椅，遊客可以隨時停下腳步休息，欣賞松鼠在林間穿梭。優美的木棧道與繁茂遮蔭，更適合感受歲月靜好的悠閒氛圍。" },
    { title: "桃園觀光夜市 小吃的交響樂", tags: ["#道地懷舊美食", "#暖心煙火氣"], desc: "懷舊好滋味 尋訪記憶中的在地手藝\n\n桃園夜市承載了數十年的飲食文化，許多老店依舊堅持傳統工序，特別適合喜愛傳統口味的遊客。無論是燉煮得軟爛入味的藥燉排骨、清淡鮮甜的生炒花枝，或是入口即化的古早味豆花，這些軟糯適口的美食，最能撫慰人們的胃與心。\n\n慢步人情味 體驗溫暖的煙火氣\n\n有別於新興商場的冷酷，桃園夜市多了一份親切的情懷。街道動線清晰，在閒適的傍晚時分，漫步於熱鬧卻不侷促的街區，感受臺灣最真誠的人間煙火氣。" }
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
            // --- 新增核心邏輯：動態鎖定目標座標 ---
            const targetIcon = document.querySelector('.brand-icon'); // 抓取導覽列的真實 Icon
            if (targetIcon) {
                const rect = targetIcon.getBoundingClientRect(); // 取得它在螢幕上的精準位置與大小
                
                // 將抓到的真實數據寫入 CSS 變數中
                loadingIcon.style.setProperty('--target-top', `${rect.top}px`);
                loadingIcon.style.setProperty('--target-left', `${rect.left}px`);
                loadingIcon.style.setProperty('--target-width', `${rect.width}px`);
                loadingIcon.style.setProperty('--target-height', `${rect.height}px`);
            }

            // 拔除閃爍 class，觸發轉場飛行
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
    // 1. 初始化 EmailJS (將 YOUR_PUBLIC_KEY 替換為你的 Public Key)
    window.emailjs.init("iQ8N7raHRVmlsker8");

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
        
        btn.innerText = "資料處理中...";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        try {
            // 2. 寫入 Firebase 資料庫 (維持原本邏輯)
            await addDoc(collection(db, "bookings"), {
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || "未提供",
                travelDate: dateInput,
                guests: parseInt(guestsInput),
                totalPrice: totalAmount,
                status: "pending",
                createdAt: serverTimestamp()
            });

            // 3. 準備 EmailJS 需要的變數資料
            // 若使用者沒有 displayName，則自動擷取 email @ 前面的名稱作為替代
            const userName = currentUser.displayName || currentUser.email.split('@')[0];
            const templateParams = {
                to_email: currentUser.email,
                to_name: userName,
                date: dateInput,
                guests: guestsInput,
                total_price: totalAmount
            };

            // 4. 發送 Email (替換為你的 Service ID 與 Template ID)
            await window.emailjs.send(
                "service_whf4j2b", 
                "template_9mb75wi", 
                templateParams
            );

            // 5. 顯示前端成功畫面
            document.getElementById('receipt-date').innerText = dateInput;
            document.getElementById('receipt-guests').innerText = `${guestsInput} 位`;
            document.getElementById('receipt-total').innerText = totalAmount;

            openOverlay('success-overlay');

        } catch (error) {
            console.error("處理失敗: ", error);
            alert("系統繁忙，無法送出申請或寄發信件，請稍後再試。");
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

// 確保程式碼能精準操控對應的畫面元素
const dateInput = document.getElementById('date');
const guestsInput = document.getElementById('guests');
const calcBase = document.getElementById('calc-base');
const calcTotal = document.getElementById('calc-total');
const discountRow = document.getElementById('discount-row');
const calcDiscount = document.getElementById('calc-discount');
const finalTotal = document.getElementById('final-total');
const mobilePriceDisplay = document.getElementById('mobile-price-display');

function calculateDynamicPrice() {
    // 1. 驗證並限制人數在 1 至 30 人之間
    let guests = parseInt(guestsInput.value) || 1;
    if (guests > 30) { guests = 30; guestsInput.value = 30; }
    if (guests < 1)  { guests = 1; guestsInput.value = 1; }

    // 2. 依據星期幾判斷平假日價格 (0為週日，6為週六)
    let basePrice = 1399; 
    if (dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const day = selectedDate.getDay(); 
        if (day === 0 || day === 6) {
            basePrice = 1499;
        }
    }

    // 3. 計算原始總價與折扣
    let rawTotal = basePrice * guests;
    let discount = 0;
    
    if (guests >= 2) {
        discount = Math.round(rawTotal * 0.1); // 計算 10% 的折扣金額並四捨五入
    }
    let finalPrice = rawTotal - discount;

    // 4. 即時渲染至網頁畫面上
    if (calcBase) calcBase.innerText = `TWD ${basePrice.toLocaleString()} × ${guests} 位`;
    if (calcTotal) calcTotal.innerText = `TWD ${rawTotal.toLocaleString()}`;
    
    if (discount > 0) {
        if (discountRow) discountRow.style.display = 'flex';
        if (calcDiscount) calcDiscount.innerText = `- TWD ${discount.toLocaleString()}`;
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }

    if (finalTotal) finalTotal.innerText = `TWD ${finalPrice.toLocaleString()}`;
    if (mobilePriceDisplay) mobilePriceDisplay.innerText = `TWD ${finalPrice.toLocaleString()}`;
}

// 綁定動態監聽事件
dateInput.addEventListener('change', calculateDynamicPrice);
guestsInput.addEventListener('input', calculateDynamicPrice);

// 初始執行一次以顯示預設價格
calculateDynamicPrice();

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
    const tagsContainer = document.getElementById('spot-detail-tags');
    tagsContainer.innerHTML = ''; 
    data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.innerText = tag; tagsContainer.appendChild(span);
    });
    openOverlay('spot-overlay');
};