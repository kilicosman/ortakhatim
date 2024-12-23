// CDN'den yüklenen global 'supabase' değişkenini kullanın
const SUPABASE_URL = 'https://xgawgxnzmhhhfrlambzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYXdneG56bWhoaGZybGFtYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODgzNjYsImV4cCI6MjA1MDI2NDM2Nn0.clUilHcXBAU3MCttysmdrIgudfgOPZJV-nSIWVWH-Eg'; // API anahtarınızı buraya ekleyin
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PASSWORD = 'vefa';
const loginContainer = document.getElementById('loginContainer');
const contentContainer = document.getElementById('contentContainer');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');
const hatimContainer = document.getElementById('hatimContainer');
const addHatimButton = document.getElementById('addHatimButton');

let hatimCount = 0; // Hatim sayısını izlemek için global bir sayaç

// Şifre kontrolü
loginButton.addEventListener('click', async () => {
    if (passwordInput.value === PASSWORD) {
        loginContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        const hatimler = await loadHatims();
        hatimCount = hatimler.length; // Mevcut hatim sayısını güncelle
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
        <h2>Hatim ${hatim?.id ? `Hatim ${hatimCount + 1}` : 'Yeni'}</h2>
        <input type="date" value="${hatim?.date || ''}" onchange="updateDate(this, ${hatim?.id || 'null'})">
        <ul class="cuz-list">
            ${Array.from({ length: 30 }, (_, i) => `
                <li class="cuz-item">
                    <span>Okundu</span>
                    <input type="checkbox" ${hatim?.cüzler?.[i]?.okundu ? 'checked' : ''} onchange="updateCuzStatus(this, ${hatim?.id || 'null'}, ${i + 1})">
                    <span>Cüz ${i + 1}</span>
                    <input type="text" placeholder="İsim yazınız" style="width: 150px;" value="${hatim?.cüzler?.[i]?.isim || ''}" onchange="updateCuzName(this, ${hatim?.id || 'null'}, ${i + 1})">
                </li>
            `).join('')}
        </ul>
        <button onclick="deleteHatim(${hatim?.id || 'null'})">Hatimi Sil</button>
    `;
    hatimContainer.appendChild(hatimDiv);
}

// Yeni hatim ekleme işlemi
function addHatim(hatimData = null) {
    hatimCount++; // Yeni hatim eklendiğinde sayaç artırılır
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
    if (error) {
        showMessage('Kaydetme hatası: ' + error.message, 'error');
    } else {
        showMessage('Bilgileriniz kaydedildi.', 'success');
    }
}

// Cüz durumu güncelleme
async function updateCuzStatus(checkbox, hatimId, cuzNo) {
    const { error } = await supabase.from('hatimler').update({
        [`cüzler.${cuzNo - 1}.okundu`]: checkbox.checked
    }).eq('id', hatimId);
    if (error) {
        showMessage('Güncelleme hatası: ' + error.message, 'error');
    } else {
        showMessage('Cüz durumu güncellendi.', 'success');
    }
}

// Cüz adı güncelleme
async function updateCuzName(input, hatimId, cuzNo) {
    const { error } = await supabase.from('hatimler').update({
        [`cüzler.${cuzNo - 1}.isim`]: input.value
    }).eq('id', hatimId);
    if (error) {
        showMessage('Güncelleme hatası: ' + error.message, 'error');
    } else {
        showMessage('Cüz adı güncellendi.', 'success');
    }
}

// Tarih güncelleme
async function updateDate(input, hatimId) {
    const { error } = await supabase.from('hatimler').update({
        date: input.value
    }).eq('id', hatimId);
    if (error) {
        showMessage('Güncelleme hatası: ' + error.message, 'error');
    } else {
        showMessage('Tarih güncellendi.', 'success');
    }
}

// Hatim silme
async function deleteHatim(hatimId) {
    if (confirm('Bu hatimi silmek istediğinizden emin misiniz?')) {
        const { error } = await supabase.from('hatimler').delete().eq('id', hatimId);
        if (error) {
            showMessage('Silme hatası: ' + error.message, 'error');
        } else {
            showMessage('Hatim başarıyla silindi.', 'success');
            loadHatims();
        }
    }
}

// Bilgi mesajı gösterme
function showMessage(message, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 4000);
}
