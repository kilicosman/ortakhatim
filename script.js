import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const SUPABASE_URL = 'https://xgawgxnzmhhhfrlambzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYXdneG56bWhoaGZybGFtYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODgzNjYsImV4cCI6MjA1MDI2NDM2Nn0.clUilHcXBAU3MCttysmdrIgudfgOPZJV-nSIWVWH-Eg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Şifre ve diğer sabitler
const PASSWORD = 'vefa';

// DOM elemanlarını seç
const loginContainer = document.getElementById('loginContainer');
const contentContainer = document.getElementById('contentContainer');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const addHatimButton = document.getElementById('addHatimButton');
const hatimContainer = document.getElementById('hatimContainer');

// Giriş yapma işlemi
loginButton.addEventListener('click', () => {
    if (passwordInput.value === PASSWORD) {
        loginContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        loadHatims();
    } else {
        alert('Yanlış şifre. Lütfen tekrar deneyin.');
    }
});

// Yeni hatim ekleme
addHatimButton.addEventListener('click', () => addHatim());

async function addHatim(save = true, hatimData = null) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';

    const hatimTitle = document.createElement('h2');
    hatimTitle.textContent = `Hatim ${hatimContainer.children.length + 1}`;
    hatimDiv.appendChild(hatimTitle);

    const hatimInfo = document.createElement('div');
    hatimInfo.className = 'hatim-info';

    const dateLabel = document.createElement('span');
    dateLabel.textContent = 'Son Bitirme Tarihi:';
    hatimInfo.appendChild(dateLabel);

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    hatimInfo.appendChild(dateInput);

    const duaLabel = document.createElement('label');
    duaLabel.textContent = 'Hatim Duası';
    const duaCheckbox = document.createElement('input');
    duaCheckbox.type = 'checkbox';
    duaLabel.appendChild(duaCheckbox);
    hatimInfo.appendChild(duaLabel);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-hatim';
    removeButton.textContent = 'Hatimi Sil';
    removeButton.addEventListener('click', () => {
        if (confirm('Bu hatimi silmeye emin misiniz?')) {
            hatimDiv.remove();
            saveHatims();
        }
    });
    hatimInfo.appendChild(removeButton);

    hatimDiv.appendChild(hatimInfo);

    const cuzList = document.createElement('ul');
    cuzList.className = 'cuz-list';

    for (let i = 1; i <= 30; i++) {
        const listItem = document.createElement('li');
        listItem.className = 'cuz-item';

        const label = document.createElement('label');
        label.textContent = `Cüz ${i}: `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'İsim yazınız';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        listItem.appendChild(label);
        listItem.appendChild(input);
        listItem.appendChild(checkbox);

        cuzList.appendChild(listItem);
    }

    hatimDiv.appendChild(cuzList);
    hatimContainer.insertBefore(hatimDiv, hatimContainer.firstChild);

    if (hatimData) {
        dateInput.value = hatimData.date;
        duaCheckbox.checked = hatimData.dua;
        hatimData.cüzler.forEach((cüz, index) => {
            cuzList.children[index].querySelector('input[type="text"]').value = cüz.isim;
            cuzList.children[index].querySelector('input[type="checkbox"]').checked = cüz.okundu;
        });
    }

    cuzList.querySelectorAll('input[type="text"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', saveHatims);
    });

    if (save) {
        await saveHatims();
    }
}

async function saveHatims() {
    const hatims = [];
    document.querySelectorAll('.hatim').forEach(hatimDiv => {
        const hatim = {
            date: hatimDiv.querySelector('input[type="date"]').value,
            dua: hatimDiv.querySelector('.hatim-info input[type="checkbox"]').checked,
            cüzler: []
        };
        hatimDiv.querySelectorAll('.cuz-item').forEach(cuzItem => {
            hatim.cüzler.push({
                isim: cuzItem.querySelector('input[type="text"]').value,
                okundu: cuzItem.querySelector('input[type="checkbox"]').checked
            });
        });
        hatims.push(hatim);
    });

    const { data, error } = await supabase.from('hatimler').insert(hatims, { returning: 'minimal' });
    if (error) {
        console.error('Veri kaydedilemedi:', error);
    } else {
        console.log('Veri başarıyla kaydedildi.');
    }
}

async function loadHatims() {
    const { data, error } = await supabase.from('hatimler').select('*').eager('cüzler(*)');
    if (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        return;
    }

    data.forEach(row => {
        const cüzler = row.cüzler.map(c => ({
            isim: c.isim,
            okundu: c.okundu
        }));
        addHatim(false, { date: row.date, dua: row.dua, cüzler });
    });
}
