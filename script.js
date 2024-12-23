// CDN'den yüklenen global 'supabase' değişkenini kullanın
const SUPABASE_URL = 'https://xgawgxnzmhhhfrlambzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // API anahtarınızı buraya ekleyin
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PASSWORD = 'vefa';
const loginContainer = document.getElementById('loginContainer');
const contentContainer = document.getElementById('contentContainer');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');
const hatimContainer = document.getElementById('hatimContainer');
const addHatimButton = document.getElementById('addHatimButton');

// Şifre kontrolü
loginButton.addEventListener('click', async () => {
    if (passwordInput.value === PASSWORD) {
        loginContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        const hatimler = await loadHatims();
        if (!hatimler || hatimler.length === 0) {
            addHatimButton.style.display = 'block';
            hatimContainer.innerHTML = '<p>Henüz bir hatim eklenmedi. Yeni bir hatim ekleyin!</p>';
        }
    } else {
        errorMessage.textContent = 'Yanlış şifre. Lütfen tekrar deneyin.';
    }
});

// Yeni hatim ekleme butonu
addHatimButton.addEventListener('click', () => {
    hatimContainer.innerHTML = ''; // Eski mesajı temizle
    addHatim();
});

// Hatim yükleme
async function loadHatims() {
    const { data, error } = await supabase.from('hatimler').select('*');
    if (error) {
        console.error('Hatim yüklenemedi:', error.message);
        return [];
    }
    data.forEach(hatim => addHatim(hatim));
    return data;
}

// Yeni hatim kartı oluşturma
function createHatimCard(hatim) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';
    hatimDiv.innerHTML = `
        <h2>Hatim ${hatim?.id || 'Yeni'}</h2>
        <input type="date" value="${hatim?.date || ''}">
        <ul class="cuz-list">
            ${Array.from({ length: 30 }, (_, i) => `
                <li class="cuz-item">
                    <span>Cüz ${i + 1}</span>
                    <input type="text" placeholder="İsim yazınız" value="${hatim?.cüzler?.[i]?.isim || ''}">
                    <input type="checkbox" ${hatim?.cüzler?.[i]?.okundu ? 'checked' : ''}>
                </li>
            `).join('')}
        </ul>
    `;
    hatimContainer.appendChild(hatimDiv);
}

// Yeni hatim ekleme işlemi
function addHatim(hatimData = null) {
    const hatimCard = createHatimCard(hatimData);
    if (!hatimData) saveHatim(hatimCard);
}

// Yeni hatimi kaydetme
async function saveHatim(hatimCard) {
    const date = hatimCard.querySelector('input[type="date"]').value;
    const cüzler = Array.from(hatimCard.querySelectorAll('.cuz-item')).map(item => ({
        isim: item.querySelector('input[type="text"]').value,
        okundu: item.querySelector('input[type="checkbox"]').checked
    }));
    const { error } = await supabase.from('hatimler').insert([{ date, cüzler }]);
    if (error) console.error('Kaydetme hatası:', error.message);
}
