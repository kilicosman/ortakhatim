// Google Sheets API'yi yükleme ve başlatma
function initClient() {
    gapi.client.init({
        apiKey: '2ad0df329af97dfa346a29dcb710b26c75b25417',
        clientId: '105663851095899620554',
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        scope: "https://www.googleapis.com/auth/spreadsheets"
    }).then(function () {
        loadHatims();
    }, function(error) {
        console.log(JSON.stringify(error, null, 2));
    });
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

document.addEventListener('DOMContentLoaded', function() {
    const hatimContainer = document.getElementById('hatimContainer');
    const addHatimButton = document.getElementById('addHatimButton');
    let hatimCount = 0;

    function saveHatims() {
        const hatims = [];
        document.querySelectorAll('.hatim').forEach(hatimDiv => {
            const hatim = {
                date: hatimDiv.querySelector('input[type="date"]').value,
                dua: hatimDiv.querySelector('.hatim-info label input[type="checkbox"]').checked,
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

        const values = hatims.map(hatim => [
            hatim.date,
            hatim.dua ? 'Evet' : 'Hayır',
            ...hatim.cüzler.map(cüz => `${cüz.isim}:${cüz.okundu ? 'Okundu' : 'Okunmadı'}`)
        ]);

        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: '18aUlGUz208BjXCG7FcId1fPkKu67RyT5bUot9nKwNzY',
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            resource: {
                values: values
            }
        }).then((response) => {
            console.log(response);
        }, (error) => {
            console.error(error);
        });
    }

    function loadHatims() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: 'SPREADSHEET_ID',
            range: 'Sheet1!A1:Z1000',
        }).then(function(response) {
            const range = response.result;
            if (range.values.length > 0) {
                range.values.forEach((row, index) => {
                    const hatim = {
                        date: row[0],
                        dua: row[1] === 'Evet',
                        cüzler: row.slice(2).map(cüz => {
                            const [isim, okundu] = cüz.split(':');
                            return { isim, okundu: okundu === 'Okundu' };
                        })
                    };
                    addHatim(false, hatim);
                });
            }
        }, function(response) {
            console.log('Error: ' + response.result.error.message);
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

        // 30 cüz için liste elemanları oluştur
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

        // Her cüz itemine değişiklikleri kaydetmek için olay dinleyicisi ekleyin
        cuzList.querySelectorAll('input[type="text"], input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', saveHatims);
        });

        if (save) {
            saveHatims();
        }
    }

    addHatimButton.addEventListener('click', () => addHatim());

    // Google API'yi başlat
    handleClientLoad();
});
