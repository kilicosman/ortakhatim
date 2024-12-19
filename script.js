document.addEventListener('DOMContentLoaded', function() {
    const hatimContainer = document.getElementById('hatimContainer');
    const addHatimButton = document.getElementById('addHatimButton');
    let hatimCount = 0;

    // Verileri yerel depolamaya kaydetme işlevi
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
        localStorage.setItem('hatims', JSON.stringify(hatims));
    }

    // Yerel depolamadan verileri yükleme işlevi
    function loadHatims() {
        const hatims = JSON.parse(localStorage.getItem('hatims')) || [];
        hatims.forEach(hatim => addHatim(false, hatim));
    }

    // Yeni hatim ekleme işlevi
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

        if (save) {
            saveHatims();
        }
    }

    addHatimButton.addEventListener('click', () => addHatim());

    // Sayfa yüklendiğinde hatimleri yükle
    loadHatims();
});
