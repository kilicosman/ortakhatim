const API_KEY = '2ad0df329af97dfa346a29dcb710b26c75b25417'; // Google Cloud Console'dan aldığınız API anahtarı
const CLIENT_ID = '105663851095899620554'; // Google Cloud Console'dan aldığınız istemci kimliği
const SPREADSHEET_ID = '18aUlGUz208BjXCG7FcId1fPkKu67RyT5bUot9nKwNzY'; // Google Sheet ID'niz
const PASSWORD = 'vefa'; // Giriş şifresi

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        scope: "https://www.googleapis.com/auth/spreadsheets"
    }).then(function () {
        console.log('Google Sheets API initialized');
        loadHatims();
    }, function(error) {
        console.log('Error initializing Google Sheets API: ', JSON.stringify(error, null, 2));
    });
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const contentContainer = document.getElementById('contentContainer');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const hatimContainer = document.getElementById('hatimContainer');
    const addHatimButton = document.getElementById('addHatimButton');
    let hatimCount = 0;

    loginButton.addEventListener('click', function() {
        if (passwordInput.value === PASSWORD) {
            loginContainer.style.display = 'none';
            contentContainer.style.display = 'block';
            handleClientLoad();
        } else {
            alert('Yanlış şifre. Lütfen tekrar deneyin.');
        }
    });

    function saveHatims() {
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

        const values = [["Tarih", "Hatim Duası", "Cüzler"]];
        hatims.forEach(hatim => {
            const cüzler = hatim.cüzler.map(c => `${c.isim}:${c.okundu ? 'Okundu' : 'Okunmadı'}`).join('|');
            values.push([hatim.date, hatim.dua ? 'Evet' : 'Hayır', cüzler]);
        });

        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            resource: { values: values }
        }).then(response => {
            console.log('Data saved successfully.', response);
        }).catch (error) {
    console.error('Veri alırken bir hata oluştu:', error);
    alert('Üzgünüz, şu anda veriler yüklenemiyor. Lütfen daha sonra tekrar deneyin.');
    // Hata raporlama servisine gönder
    sendErrorReport(error);
        });
    }

    function loadHatims() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1:Z1000',
        }).then(response => {
            const rows = response.result.values;
            if (rows && rows.length > 1) {
                rows.slice(1).forEach(row => {
                    const cüzler = row[2]?.split('|').map(c => {
                        const [isim, okundu] = c.split(':');
                        return { isim, okundu: okundu === 'Okundu' };
                    }) || [];
                    addHatim(false, { date: row[0], dua: row[1] === 'Evet', cüzler });
                });
            }
        }).catch(error => {
            console.error('Error loading data:', error);
        });
    }

    function addHatim(save = true, hatimData = null) {
        hatimCount++;
        const hatimDiv = document.createElement('div');
        hatimDiv.className = 'hatim';

        const hatimTitle = document.createElement('h2');
        hatimTitle.textContent = `Hatim ${hatimCount}`;
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
        removeButton.addEventListener('click', function() {
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
            saveHatims();
        }
    }

    addHatimButton.addEventListener('click', () => addHatim());

});
