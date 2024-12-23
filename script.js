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
const resetDatabaseButton = document.getElementById('resetDatabaseButton');
const resetPasswordInput = document.getElementById('resetPasswordInput');

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
    const newHatim = { date: new Date().toISOString().split('T')[0], cuzler: Array(30).fill({isim: '', okundu: false}) };
    addHatim(newHatim);
});

// Database resetle butonu
resetDatabaseButton.addEventListener('click', async () => {
    if (resetPasswordInput.value === 'admin') {
        const { error } = await supabase.from('hatimler').delete().neq('id', 0);
        if (error) {
            console.error('Database reset hatası:', error.message);
        } else {
            alert('Database başarıyla resetlendi.');
            location.reload();
        }
    } else {
        alert('Yanlış admin şifresi.');
    }
});

// Hatim yükleme
async function loadHatims() {
    try {
        const { data, error } = await supabase
            .from('hatimler')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        data.forEach(hatim => addHatim(hatim));
        return data;
    } catch (error) {
        console.error('Hatim yüklenemedi:', error.message);
    }
}

// Yeni hatim kartı oluşturma
function createHatimCard(hatim) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';
    hatimDiv.innerHTML = `
        <h2>Hatim ${hatim?.id || 'Yeni'}</h2>
        <button class="delete-hatim">Sil</button>
        <input type="date" value="${hatim?.date || ''}">
        <button class="save-date">Kaydet</button>
        <ul class="cuz-list">
            ${Array.from({ length: 30 }, (_, i) => `
                <li class="cuz-item">
                    <span>Cüz ${i + 1}</span>
                    <input type="text" placeholder="İsim yazınız" value="${hatim?.cuzler?.[i]?.isim || ''}">
                    <button class="save-cuz">Kaydet</button>
                    <input type="checkbox" ${hatim?.cuzler?.[i]?.okundu ? 'checked' : ''}>
                    <span class="okundu-label">okundu</span>
                </li>
            `).join('')}
        </ul>
    `;
    hatimContainer.prepend(hatimDiv);
    return hatimDiv; // DOM öğesini döndür
}

// Yeni hatim ekleme işlemi
function addHatim(hatimData = null) {
    const hatimCard = createHatimCard(hatimData);
    if (!hatimData) saveHatim(hatimCard);
}

// Yeni hatimi kaydetme
async function saveHatim(hatimCard) {
    const date = hatimCard.querySelector('input[type="date"]').value;

    // Tarih formatını kontrol et
    if (!date || isNaN(Date.parse(date))) {
        console.error('Geçersiz tarih değeri.');
        return;
    }

    const cuzler = Array.from(hatimCard.querySelectorAll('.cuz-item')).map(item => ({
        isim: item.querySelector('input[type="text"]').value,
        okundu: item.querySelector('input[type="checkbox"]').checked
    }));

    // Cüzler ve date verilerini kontrol etmek
    console.log({ date, cuzler });

    const { error } = await supabase.from('hatimler').insert([{ date, cuzler }]);
    if (error) console.error('Kaydetme hatası:', error.message);
}

// Hatim silme işlemi
async function deleteHatim(hatimId) {
    const { error } = await supabase.from('hatimler').delete().eq('id', hatimId);
    if (error) {
        console.error('Silme hatası:', error.message);
    } else {
        document.querySelector(`.hatim[data-id="${hatimId}"]`).remove();
    }
}

// Event listener to save date
document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('save-date')) {
        const hatimCard = event.target.closest('.hatim');
        await saveHatim(hatimCard);
    }
});

// Event listener to save each cüz
document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('save-cuz')) {
        const cuzItem = event.target.closest('.cuz-item');
        const hatimCard = event.target.closest('.hatim');
        const date = hatimCard.querySelector('input[type="date"]').value;

        // Tarih formatını kontrol et
        if (!date || isNaN(Date.parse(date))) {
            console.error('Geçersiz tarih değeri.');
            return;
        }

        const cuzler = Array.from(hatimCard.querySelectorAll('.cuz-item')).map(item => ({
            isim: item.querySelector('input[type="text"]').value,
            okundu: item.querySelector('input[type="checkbox"]').checked
        }));

        // Cüzler ve date verilerini kontrol etmek
        console.log({ date, cuzler });

        const { error } = await supabase.from('hatimler').insert([{ date, cuzler }]);
        if (error) console.error('Kaydetme hatası:', error.message);
    }
});

// Event listener to delete Hatim with confirmation
document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-hatim')) {
        const hatimCard = event.target.closest('.hatim');
        const hatimId = hatimCard.getAttribute('data-id');
        if (confirm('Bu hatimi silmek istediğinizden emin misiniz?')) {
            await deleteHatim(hatimId);
        }
    }
});

// Bilgi mesajı gösterme
function showMessage(message, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 4000);
}
