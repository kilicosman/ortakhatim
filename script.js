import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xgawgxnzmhhhfrlambzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYXdneG56bWhoaGZybGFtYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODgzNjYsImV4cCI6MjA1MDI2NDM2Nn0.clUilHcXBAU3MCttysmdrIgudfgOPZJV-nSIWVWH-Eg'; // API anahtarınızı buraya ekleyin
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PASSWORD = 'vefa';
const loginContainer = document.getElementById('loginContainer');
const contentContainer = document.getElementById('contentContainer');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');
const hatimContainer = document.getElementById('hatimContainer');
const addHatimButton = document.getElementById('addHatimButton');

// Şifre kontrolü
loginButton.addEventListener('click', () => {
    if (passwordInput.value === PASSWORD) {
        loginContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        loadHatims();
    } else {
        errorMessage.textContent = 'Yanlış şifre. Lütfen tekrar deneyin.';
    }
});

// Yeni hatim ekleme
addHatimButton.addEventListener('click', () => addHatim());

// Hatim yükleme
async function loadHatims() {
    const { data, error } = await supabase.from('hatimler').select('*');
    if (error) {
        console.error('Hatim yüklenemedi:', error.message);
    } else {
        data.forEach(hatim => addHatim(hatim));
    }
}

// Yeni hatim kartı oluşturma
function createHatimCard(hatim) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';
    hatimDiv.innerHTML = `
        <h2>Hatim ${hatim?.id || 'Yeni'}</h2>
        <input type="date" value="${hatim?.date || ''}">
        <ul class="cuz-list">
            ${Array.from({ length: 30 }, (_, i) => `
                <li class="cuz-item">
                    <span>Cüz ${i + 1}</span>
                    <input type="text" placeholder="İsim yazınız" value="${hatim?.cüzler?.[i]?.isim || ''}">
                    <input type="checkbox" ${hatim?.cüzler?.[i]?.okundu ? 'checked' : ''}>
                </li>
            `).join('')}
        </ul>
    `;
    hatimContainer.appendChild(hatimDiv);
}

// Yeni hatim ekleme işlemi
function addHatim(hatimData = null) {
    const hatimCard = createHatimCard(hatimData);
    if (!hatimData) saveHatim(hatimCard);
}

// Yeni hatimi kaydetme
async function saveHatim(hatimCard) {
    const date = hatimCard.querySelector('input[type="date"]').value;
    const cüzler = Array.from(hatimCard.querySelectorAll('.cuz-item')).map(item => ({
        isim: item.querySelector('input[type="text"]').value,
        okundu: item.querySelector('input[type="checkbox"]').checked
    }));
    const { error } = await supabase.from('hatimler').insert([{ date, cüzler }]);
    if (error) console.error('Kaydetme hatası:', error.message);
}
