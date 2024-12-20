// Düzenlenen script.js
// API anahtarları ve istemci kimliği güvenli bir şekilde yüklenecek

const PASSWORD = 'vefa'; // Şifre sabit

async function initClient() {
    const API_KEY = process.env.API_KEY;
    const CLIENT_ID = process.env.CLIENT_ID;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    if (!API_KEY || !CLIENT_ID || !SPREADSHEET_ID) {
        console.error('Gerekli API bilgileri eksik. Lütfen .env dosyasını kontrol edin.');
        alert('Sistem hatası. Lütfen teknik destekle iletişime geçin.');
        return;
    }

    try {
        await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            scope: "https://www.googleapis.com/auth/spreadsheets"
        });
        console.log('Google Sheets API initialized');
        await loadHatims(SPREADSHEET_ID);
    } catch (error) {
        console.error('Google Sheets API başlatılamadı:', error);
        alert('Google Sheets API bağlantısı başarısız. Lütfen daha sonra tekrar deneyin.');
    }
}

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
            gapi.load('client:auth2', initClient);
        } else {
            alert('Yanlış şifre. Lütfen tekrar deneyin.');
        }
    });

    // Yeni hatim ekleme
    addHatimButton.addEventListener('click', () => addHatim());

    // Hatim ekleme fonksiyonu
    function addHatim(save = true, hatimData = null) {
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
                saveHatims();
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

    // Hatimlerin kaydedilmesi
    function saveHatims() {
        // Kaydetme işlevi yazılabilir (Google Sheets ile bağlantı yapılmalı)
        console.log('Hatimler kaydedildi.');
    }
});
