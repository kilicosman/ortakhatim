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
    const password = passwordInput.value;
    const response = await fetch('https://ortakhatim.vercel.app/api/login', {  // Updated URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });

    const result = await response.json();
    if (response.status === 200) {
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
        errorMessage.textContent = result.message;
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
                const response = await fetch('/reset', { method: 'POST' });
                if (response.ok) {
                    alert('Database başarıyla resetlendi.');
                    hatimCounter = 1;
                    location.reload();
                } else {
                    alert('Database reset hatası.');
                }
            } else {
                alert('Yanlış admin şifresi.');
            }
        }
    });
});

async function loadHatims() {
    try {
        const response = await fetch('/hatims');
        const data = await response.json();
        if (response.ok) {
            data.forEach(hatim => addHatim(hatim));
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Hatim yüklenemedi:', error.message);
    }
}

function createHatimCard(hatim) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';
    hatimDiv.innerHTML = `
        <h2>Hatim ${hatim.id}</h2>
        <button class="delete-hatim">Sil</button>
        <input type="date" value="${hatim.date}">
        <button class="save-date">Kaydet</button>
        <label for="hatim-duasi-checkbox-${hatim.id}">Hatim Duası</label>
        <input type="checkbox" id="hatim-duasi-checkbox-${hatim.id}" ${hatim.dua ? 'checked' : ''} class="dua-checkbox">
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
    const response = await fetch(`/hatims/${hatimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, cuzler, dua })
    });

    if (response.ok) {
        showMessage('Başarıyla kaydedildi.', 'success');
    } else {
        const result = await response.json();
        console.error('Kaydetme hatası:', result.error);
    }
}

async function deleteHatim(hatimId) {
    const response = await fetch(`/hatims/${hatimId}`, { method: 'DELETE' });
    if (response.ok) {
        document.querySelector(`.hatim[data-id="${hatimId}"]`).remove();
    } else {
        const result = await response.json();
        console.error('Silme hatası:', result.error);
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
        const response = await fetch(`/hatims/${hatimCard.getAttribute('data-id')}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, cuzler })
        });

        if (response.ok) {
            showMessage('Başarıyla kaydedildi.', 'success');
        } else {
            const result = await response.json();
            console.error('Kaydetme hatası:', result.error);
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
