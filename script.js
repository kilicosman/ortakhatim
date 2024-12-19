document.addEventListener('DOMContentLoaded', function() {
    const hatimContainer = document.getElementById('hatimContainer');

    // 3 hatim için bölümleri oluştur
    for (let h = 1; h <= 3; h++) {
        const hatimDiv = document.createElement('div');
        hatimDiv.className = 'hatim';

        const hatimTitle = document.createElement('h2');
        hatimTitle.textContent = `Hatim ${h}`;
        hatimDiv.appendChild(hatimTitle);

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        hatimDiv.appendChild(dateInput);

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
        hatimContainer.appendChild(hatimDiv);
    }
});
