
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');
    const loginContainer = document.getElementById('login-container');
    const hatimContainer = document.getElementById('hatim-container');
    const addHatimButton = document.getElementById('add-hatim-button');
    const hatimsDiv = document.getElementById('hatims');
    
    const PASSWORD = "vefa";
    
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === PASSWORD) {
            loginContainer.classList.add('hidden');
            hatimContainer.classList.remove('hidden');
        } else {
            errorMessage.classList.remove('hidden');
            setTimeout(() => errorMessage.classList.add('hidden'), 3000);
        }
    });
    
    addHatimButton.addEventListener('click', () => {
        const newHatim = document.createElement('div');
        newHatim.className = 'hatim';
        newHatim.innerHTML = `
            <h2>Hatim</h2>
            <ul>
                ${Array.from({ length: 30 }, (_, i) => `
                    <li>
                        <span>Cüz ${i + 1}</span>
                        <input type="text" placeholder="İsim girin">
                        <button>Kaydet</button>
                        <input type="checkbox">
                    </li>
                `).join('')}
            </ul>
        `;
        hatimsDiv.appendChild(newHatim);
    });
});
