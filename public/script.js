// script.js

// Load the configuration
const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseKey = CONFIG.SUPABASE_ANON_KEY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// The rest of your code...
document.getElementById('loginButton').addEventListener('click', async () => {
    const password = document.getElementById('passwordInput').value;
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (response.ok) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('contentContainer').style.display = 'block';
        loadHatims();
    } else {
        document.getElementById('errorMessage').textContent = 'Geçersiz şifre';
    }
});

async function loadHatims() {
    const { data: hatims, error } = await supabase.from('hatimler').select('*').order('id', { ascending: true });
    if (error) {
        console.error('Hatim yüklenemedi:', error.message);
        return;
    }
    hatims.forEach(hatim => addHatim(hatim));
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
    hatimDiv.setAttribute('data-id', hatim.id);
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
    if (event.target.classList.contains('delete-hatim')) {
        const hatimCard = event.target.closest('.hatim');
        const hatimId = hatimCard.getAttribute('data-id');
        await deleteHatim(hatimId);
    }
});

// Function to handle hatim name increment logic when database is reset
async function resetDatabase() {
    const response = await fetch('/hatims');
    const hatims = await response.json();

    await fetch('/reset', { method: 'POST' });

    hatims.forEach((hatim, index) => {
        hatim.id = index + 1;
        hatim.name = `Hatim ${hatim.id}`;
        addHatim(hatim);
    });
}
