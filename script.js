import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı - API anahtarlarınızı çevre değişkenlerinden alın
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PASSWORD = 'vefa'; // Bu sadece bir örnek şifre, güvenlik açısından sakıncalı!

// DOM elemanlarını seç
const loginContainer = document.getElementById('loginContainer');
const contentContainer = document.getElementById('contentContainer');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const addHatimButton = document.getElementById('addHatimButton');
const errorMessage = document.getElementById('errorMessage');
const hatimContainer = document.querySelector('.hatim-container');

// Giriş yapma işlemi
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

function createHatimCard(hatim = null) {
    const hatimDiv = document.createElement('div');
    hatimDiv.className = 'hatim';

    // Burada hatim kartının içeriğini oluşturun
    // ...

    hatimContainer.appendChild(hatimDiv);
    return hatimDiv;
}

async function addHatim(hatimData = null) {
    const hatimCard = createHatimCard(hatimData);
    // Eğer yeni hatim ekleniyorsa, veritabanına kaydet
    if (!hatimData) await saveHatim(hatimCard);
}

async function saveHatim(hatimCard) {
    const hatim = {
        date: hatimCard.querySelector('input[type="date"]').value,
        dua: hatimCard.querySelector('input[type="checkbox"]').checked,
        cüzler: Array.from(hatimCard.querySelectorAll('.cuz-item')).map(item => ({
            isim: item.querySelector('input[type="text"]').value,
            okundu: item.querySelector('input[type="checkbox"]').checked
        }))
    };

    const { error } = await supabase.from('hatimler').upsert([hatim]);
    if (error) {
        errorMessage.textContent = 'Veri kaydedilemedi: ' + error.message;
    } else {
        errorMessage.textContent = 'Veri başarıyla kaydedildi.';
    }
}

async function loadHatims() {
    const { data, error } = await supabase.from('hatimler').select('*');
    if (error) {
        errorMessage.textContent = 'Veriler yüklenirken hata oluştu: ' + error.message;
    } else {
        data.forEach(hatim => addHatim(hatim));
    }
}
