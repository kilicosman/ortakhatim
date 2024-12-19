document.addEventListener('DOMContentLoaded', function() {
    const hatimContainer = document.getElementById('hatimContainer');
    const addHatimButton = document.getElementById('addHatimButton');
    let hatimCount = 0;

    const GITHUB_USERNAME = 'kilicosman';
    const GITHUB_REPO = 'ortakhatim';
    const GITHUB_FILE_PATH = 'data.txt';
    const GITHUB_TOKEN = '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';

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

        const fileContent = btoa(JSON.stringify(hatims)); // Base64 encode
        fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update hatim data',
                content: fileContent,
                sha: localStorage.getItem('githubFileSha') // dosyanın sha değerini kullanarak güncelleme yap
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.content && data.content.sha) {
                localStorage.setItem('githubFileSha', data.content.sha);
            }
        })
        .catch(error => console.error('Error updating file:', error));
    }

    function loadHatims() {
        fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.content) {
                const hatims = JSON.parse(atob(data.content));
                hatims.forEach(hatim => addHatim(false, hatim));
                localStorage.setItem('githubFileSha', data.sha); // dosyanın sha değerini kaydet
            }
        })
        .catch(error => console.error('Error loading file:', error));
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

    // Sayfa yüklendiğinde hatimleri yükle
    loadHatims();
});
