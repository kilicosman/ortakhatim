import { createClient } from '@supabase/supabase-js';

// Supabase connection
const SUPABASE_URL = 'https://xgawgxnzmhhhfrlambzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYXdneG56bWhoaGZybGFtYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODgzNjYsImV4cCI6MjA1MDI2NDM2Nn0.clUilHcXBAU3MCttysmdrIgudfgOPZJV-nSIWVWH-Eg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Password and other constants
const PASSWORD = 'vefa';

// Select DOM elements
const loginContainer = document.getElementById('loginContainer');
const contentContainer = document.getElementById('contentContainer');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const addHatimButton = document.getElementById('addHatimButton');
const hatimContainer = document.getElementById('hatimContainer');

// Log element selections
console.log('loginButton:', loginButton);
console.log('passwordInput:', passwordInput);

// Login process
loginButton.addEventListener('click', () => {
    console.log('Login button clicked');
    if (passwordInput.value === PASSWORD) {
        console.log('Password correct');
        loginContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        loadHatims();
    } else {
        console.log('Incorrect password');
        alert('Yanlış şifre. Lütfen tekrar deneyin.');
    }
});

// New hatim addition
addHatimButton.addEventListener('click', () => addHatim());

async function addHatim(save = true, hatimData = null) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';
    // ... (rest of the code remains the same)
}

async function saveHatims() {
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

    const { data, error } = await supabase.from('hatimler').insert(hatims, { returning: 'minimal' });
    if (error) {
        console.error('Veri kaydedilemedi:', error);
    } else {
        console.log('Veri başarıyla kaydedildi.');
    }
}

async function loadHatims() {
    const { data, error } = await supabase.from('hatimler').select('*').eager('cüzler(*)');
    if (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        return;
    }

    data.forEach(row => {
        const cüzler = row.cüzler.map(c => ({
            isim: c.isim,
            okundu: c.okundu
        }));
        addHatim(false, { date: row.date, dua: row.dua, cüzler });
    });
}
