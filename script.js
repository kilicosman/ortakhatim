// script.js

import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PASSWORD = 'vefa'; // Şifre sabit

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('loginContainer');
    const contentContainer = document.getElementById('contentContainer');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const addHatimButton = document.getElementById('addHatimButton');
    const hatimContainer = document.getElementById('hatimContainer');

    // Şifre doğrulama
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

    // Hatim ekleme fonksiyonu
    async function addHatim(save = true, hatimData = null) {
        const hatimDiv = document.createElement('div');
        hatimDiv.className = 'hatim';

        const hatimTitle = document.createElement('h2');
        hatimTitle.textContent = `Hatim ${hatimContainer.children.length + 1}`;
        hatimDiv.appendChild(hatimTitle);

        const hatimInfo = document.createElement('div');
        hatimInfo.className = 'hatim-info';

        // Tarih
        const dateLabel = document.createElement('span');
        dateLabel.textContent = 'Son Bitirme Tarihi:';
        hatimInfo.appendChild(dateLabel);

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        hatimInfo.appendChild(dateInput);

        // Dua Checkbox
        const duaLabel = document.createElement('label');
        duaLabel.textContent = 'Hatim Duası: ';
        const duaCheckbox = document.createElement('input');
        duaCheckbox.type = 'checkbox';
        duaLabel.appendChild(duaCheckbox);
        hatimInfo.appendChild(duaLabel);

        // Silme Butonu
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-hatim';
        removeButton.textContent = 'Hatimi Sil';
        removeButton.addEventListener('click', () => {
            if (confirm('Bu hatimi silmek istediğinizden emin misiniz?')) {
                hatimDiv.remove();
                if (save) saveHatims();
            }
        });
        hatimInfo.appendChild(removeButton);

        hatimDiv.appendChild(hatimInfo);

        // Cüz Listesi
        const cuzList = document.createElement('ul');
        cuzList.className = 'cuz-list';

        for (let i = 1; i <= 30; i++) {
            const listItem = document.createElement('li');
            listItem.className = 'cuz-item';

            const label = document.createElement('label');
            label.textContent = `Cüz ${i}:`;

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

        // Hatim verileri yükleniyorsa önceden doldur
        if (hatimData) {
            dateInput.value = hatimData.date;
            duaCheckbox.checked = hatimData.dua;
            hatimData.cüzler.forEach((cüz, index) => {
                cuzList.children[index].querySelector('input[type="text"]').value = cüz.isim;
                cuzList.children[index].querySelector('input[type="checkbox"]').checked = cüz.okundu;
            });
        }

        // Kaydetme işlevi
        if (save) saveHatims();
    }

    // Hatimlerin Supabase'e kaydedilmesi
    async function saveHatims() {
    const hatims = [];
    document.querySelectorAll('.hatim').forEach(hatimDiv => {
        const hatim = {
            date: hatimDiv.querySelector('input[type="date"]').value,
            dua: hatimDiv.querySelector('.hatim-info input[type="checkbox"]').checked,
            cüzler: []
        };

        hatimDiv.querySelectorAll('.cuz-item').forEach((cuzItem, index) => {
            const cüz = {
                cuz_no: index + 1,
                isim: cuzItem.querySelector('input[type="text"]').value,
                okundu: cuzItem.querySelector('input[type="checkbox"]').checked
            };
            hatim.cüzler.push(cüz);
        });

        hatims.push(hatim);
    });

        const { error } = await supabase.from('hatimler').upsert(hatims);
        if (error) {
            console.error('Veri kaydedilemedi:', error);
        } else {
            console.log('Veri başarıyla kaydedildi.');
        }
    }

    // Hatimlerin yüklenmesi
   async function loadHatims() {
    const { data, error } = await supabase.from('hatimler').select('*');
    if (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        return;
    }

    if (data) {
        data.forEach(hatim => addHatim(false, hatim));
    }
}
});
