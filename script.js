document.addEventListener('DOMContentLoaded', function() {
    const hatimContainer = document.getElementById('hatimContainer');
    const addHatimButton = document.getElementById('addHatimButton');
    let hatimCount = 0;

    function addHatim() {
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
    }

    addHatimButton.addEventListener('click', addHatim);

    // Sayfa yüklendiğinde ilk hatimi ekle
    addHatim();
});
