let isLoggedIn = false;

const spotData = [
    {
        title: "石門水庫 私房靜謐遊湖",
        img: "url('https://images.unsplash.com/photo-1596400262145-36423e2fb3bc?auto=format&fit=crop&w=800&q=80')",
        tags: ["#湖光山色", "#平緩步道", "#無障礙環境"],
        desc: "石門水庫擁有壯麗的大壩景觀與幽靜的環湖步道。四季皆有不同的自然風情，春季賞櫻、秋季賞楓。由專屬管家帶領，避開人擠人的大眾路線，深入私房秘境步道。全程路面寬廣且平緩，長輩漫步或推動嬰兒車皆毫無障礙。",
        highlight: "尊榮體驗的核心在於『不費力』。我們將專車直接停泊於最靠近絕佳景觀的特約區域，讓家族成員下車即可享受芬多精，徹底屏除長途步行的體力消耗。"
    },
    {
        title: "Xpark 都會型水生公園 (VIP禮遇)",
        img: "url('https://images.unsplash.com/photo-1621318164984-b06589834c91?auto=format&fit=crop&w=800&q=80')",
        tags: ["#快速通關", "#親子互動", "#現代科技"],
        desc: "Xpark 是由日本橫濱八景島首度跨海來台開設的都會型水生公園。館內結合了現代科技與生態展示，從深海生物到可愛的企鵝一應俱全。多樣的沉浸式空間設計，讓遊客宛如置身海底世界。",
        highlight: "本專案包含 VIP 快速通關禮遇，免除旺季排隊購票的煩躁。室內恆溫的優質環境，是最高規格的親子海洋互動體驗，讓您的旅程不受任何氣候干擾。"
    },
    {
        title: "中原夜市 專人美食導覽",
        img: "url('https://images.unsplash.com/photo-1551043047-1d2adf00f3fd?auto=format&fit=crop&w=800&q=80')",
        tags: ["#在地美食", "#管家代購", "#高自由度"],
        desc: "中原夜市以多樣化的在地小吃與平價消費聞名。這裡集結了各式創意美食、傳統湯包、滷味與手搖飲。商圈範圍集中，動線清晰，是非常適合體驗台灣夜市活力的絕佳場所。",
        highlight: "為了確保高端客群的舒適度，專屬管家將提供『必吃美食代購服務』。您無須在人群中擁擠排隊，只需點單，即可在專車上或我們安排的舒適席位輕鬆享用道地美味。"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);
    revealElements.forEach(el => revealObserver.observe(el));

    const liveViewersEl = document.getElementById('live-viewers');
    setInterval(() => {
        const current = parseInt(liveViewersEl.innerText);
        const change = Math.floor(Math.random() * 3) - 1;
        let newCount = current + change;
        if (newCount < 8) newCount = 8;
        if (newCount > 18) newCount = 18;
        liveViewersEl.innerText = newCount;
    }, 5000);

    const track = document.getElementById('carousel-track');
    const images = track.querySelectorAll('img');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    let currentIndex = 0;

    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(dot);
    });
    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }
    setInterval(() => goToSlide((currentIndex + 1) % images.length), 4000);

    const dateInput = document.getElementById('date');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];

    const pricePerPerson = 5800;
    const guestsSelect = document.getElementById('guests');
    const finalTotal = document.getElementById('final-total');
    const mobilePriceDisplay = document.getElementById('mobile-price-display');

    function updatePricing() {
        const count = parseInt(guestsSelect.value);
        let total = pricePerPerson * count;
        
        document.getElementById('calc-base').innerText = `TWD 5,800 x ${count} 位`;
        document.getElementById('calc-total').innerText = `TWD ${total.toLocaleString()}`;

        if (count >= 4) {
            let discount = total * 0.1;
            total -= discount;
            document.getElementById('discount-row').style.display = 'flex';
            document.getElementById('calc-discount').innerText = `- TWD ${discount.toLocaleString()}`;
        } else {
            document.getElementById('discount-row').style.display = 'none';
        }

        const formattedTotal = `TWD ${total.toLocaleString()}`;
        finalTotal.innerText = formattedTotal;
        mobilePriceDisplay.innerText = formattedTotal;
    }
    guestsSelect.addEventListener('change', updatePricing);

    const navAuthBtn = document.getElementById('nav-auth-btn');
    navAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn) {
            isLoggedIn = false;
            navAuthBtn.innerHTML = '<i class="far fa-user-circle"></i> 登入/註冊';
        } else {
            openOverlay('auth-overlay');
        }
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerText = "驗證中...";
        
        setTimeout(() => {
            isLoggedIn = true;
            navAuthBtn.innerHTML = '<i class="fas fa-user-circle"></i> Yun (登出)';
            btn.innerText = "繼續";
            closeOverlay('auth-overlay');
        }, 800);
    });

    document.getElementById('booking-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            openOverlay('auth-overlay');
            return;
        }

        const btn = document.getElementById('submit-btn');
        const date = dateInput.value;
        const guests = guestsSelect.value;
        const total = finalTotal.innerText;
        
        btn.innerText = "資料處理中...";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        setTimeout(() => {
            document.getElementById('receipt-date').innerText = date;
            document.getElementById('receipt-guests').innerText = `${guests} 位`;
            document.getElementById('receipt-total').innerText = total;

            btn.innerText = "送出專屬預訂申請";
            btn.style.opacity = "1";
            btn.disabled = false;
            
            openOverlay('success-overlay');
        }, 1200);
    });
});

function openOverlay(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOverlay(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

function triggerMobileBooking() {
    if (!isLoggedIn) {
        openOverlay('auth-overlay');
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            document.getElementById('date').focus();
        }, 500);
    }
}

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
        span.innerText = tag;
        tagsContainer.appendChild(span);
    });

    openOverlay('spot-overlay');
};