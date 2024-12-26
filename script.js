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
let hatimCounter = 1;

const handleLogin = async () => {
    if (passwordInput.value === PASSWORD) {
        loginContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        const hatimler = await loadHatims();
        if (!hatimler || hatimler.length === 0) {
            addHatimButton.style.display = 'block';
            hatimContainer.innerHTML = '<p>Henüz bir hatim eklenmedi. Yeni bir hatim ekleyin!</p>';
        } else {
            addHatimButton.style.display = 'block';
            hatimCounter = hatimler.length + 1;
        }
    } else {
        errorMessage.textContent = 'Yanlış şifre. Lütfen tekrar deneyin.';
    }
};

loginButton.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

addHatimButton.addEventListener('click', () => {
    const newHatim = { id: hatimCounter++, date: new Date().toISOString().split('T')[0], cuzler: Array(30).fill({ isim: '', okundu: false }), dua: false };
    addHatim(newHatim);
});

resetDatabaseButton.addEventListener('click', () => {
    resetPasswordInput.style.display = 'block';
    resetPasswordInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            if (resetPasswordInput.value === 'admin') {
                const { error } = await supabase.from('hatimler').delete().neq('id', 0);
                if (error) {
                    console.error('Database reset hatası:', error.message);
                } else {
                    alert('Database başarıyla resetlendi.');
                    hatimCounter = 1;
                    location.reload();
                }
            } else {
                alert('Yanlış admin şifresi.');
            }
        }
    });
});

async function loadHatims() {
    try {
        const { data, error } = await supabase
            .from('hatimler')
            .select('*')
            .order('id', { ascending: true });
        if (error) throw error;
        data.forEach(hatim => addHatim(hatim));
        return data;
    } catch (error) {
        console.error('Hatim yüklenemedi:', error.message);
    }
}

function createHatimCard(hatim) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';
    hatimDiv.innerHTML = `
        <h2>Hatim ${hatim.id}</h2>
        <input type="checkbox" ${hatim.dua ? 'checked' : ''} class="dua-checkbox">
        <button class="delete-hatim">Sil</button>
        <input type="date" value="${hatim.date}">
        <button class="save-date">Kaydet</button>
        <ul class="cuz-list">
            ${Array.from({ length: 30 }, (_, i) => `
                <li class="cuz-item">
                    <span>Cüz ${i + 1}</span>
                    <input type="text" placeholder="İsim yazınız" value="${hatim.cuzler[i]?.isim || ''}">
                    <button class="save-cuz">Kaydet</button>
                    <input type="checkbox" ${hatim.cuzler[i]?.okundu ? 'checked' : ''}>
                    <span class="okundu-label">okundu</span>
                </li>
            `).join('')}
        </ul>
    `;
    hatimDiv.setAttribute('data-id', hatim.id);  // Add data-id attribute for deletion
    hatimContainer.prepend(hatimDiv);
    return hatimDiv;
}

function addHatim(hatimData = null) {
    const hatimCard = createHatimCard(hatimData);
    if (!hatimData) saveHatim(hatimCard);
}

async function saveHatim(hatimCard) {
    const date = hatimCard.querySelector('input[type="date"]').value;
    if (!date || isNaN(Date.parse(date))) {
        console.error('Geçersiz tarih değeri.');
        return;
    }
    const hatimId = hatimCard.getAttribute('data-id');
    const dua = hatimCard.querySelector('.dua-checkbox').checked;
    const cuzler = Array.from(hatimCard.querySelectorAll('.cuz-item')).map(item => ({
        isim: item.querySelector('input[type="text"]').value,
        okundu: item.querySelector('input[type="checkbox"]').checked
    }));
    const { error } = await supabase.from('hatimler').upsert([{ id: hatimId, date, cuzler, dua }]);
    if (error) {
        console.error('Kaydetme hatası:', error.message);
    } else {
        showMessage('Başarıyla kaydedildi.', 'success');
    }
}

async function deleteHatim(hatimId) {
    const { error } = await supabase.from('hatimler').delete().eq('id', hatimId);
    if (error) {
        console.error('Silme hatası:', error.message);
    } else {
        document.querySelector(`.hatim[data-id="${hatimId}"]`).remove();
    }
}

document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('save-date')) {
        const hatimCard = event.target.closest('.hatim');
        await saveHatim(hatimCard);
    }
});

document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('save-cuz')) {
        const cuzItem = event.target.closest('.cuz-item');
        const hatimCard = event.target.closest('.hatim');
        const date = hatimCard.querySelector('input[type="date"]').value;
        if (!date || isNaN(Date.parse(date))) {
            console.error('Geçersiz tarih değeri.');
            return;
        }
        const cuzler = Array.from(hatimCard.querySelectorAll('.cuz-item')).map(item => ({
            isim: item.querySelector('input[type="text"]').value,
            okundu: item.querySelector('input[type="checkbox"]').checked
        }));
        const { error } = await supabase.from('hatimler').upsert([{ id: hatimCard.getAttribute('data-id'), date, cuzler }]);
        if (error) {
            console.error('Kaydetme hatası:', error.message);
        } else {
            showMessage('Başarıyla kaydedildi.', 'success');
        }
    }
});

document.addEventListener('change', async function (event) {
    if (event.target.type === 'checkbox') {
        const hatimCard = event.target.closest('.hatim');
        await saveHatim(hatimCard);
    }
});

document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-hatim')) {
        const hatimCard = event.target.closest('.hatim');
        const hatimId = hatimCard.getAttribute('data-id');
        if (confirm('Emin misiniz? Bu hatimi silmek istediğinizden emin misiniz?')) {
            await deleteHatim(hatimId);
        }
    }
});

function showMessage(message, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 4000);
}
