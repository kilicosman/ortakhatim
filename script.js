import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Şifre ve diğer sabitler
const PASSWORD = 'vefa';

// DOM elemanlarını seç
const loginContainer = document.getElementById('loginContainer');
const contentContainer = document.getElementById('contentContainer');
const passwordInput = document.getElementById('passwordInput');
// ... diğer elemanlar

// Giriş yapma işlemi
loginButton.addEventListener('click', () => {
  // ...
});

// Yeni hatim ekleme
addHatimButton.addEventListener('click', () => addHatim());

async function addHatim(save = true, hatimData = null) {
  // Hatim oluşturma işlemleri (önceki cevapta olduğu gibi)

  // Cüzler için ayrı bir dizi oluştur
  const cüzler = [];
  // ... (cüz bilgilerini cüzler dizisine ekle)

  // Hatimleri ve cüzleri kaydet
  const { data: hatimData, error: hatimError } = await supabase.from('hatimler').insert([hatim], { returning: 'minimal' });
  const { error: cüzError } = await supabase.from('cüzler').insert(cüzler);

  // Hata kontrolü
  if (hatimError || cüzError) {
    console.error('Veri kaydedilemedi:', hatimError || cüzError);
  } else {
    console.log('Veri başarıyla kaydedildi.');
  }
}

async function loadHatims() {
  // Hatimleri ve cüzleri ilişkilendirerek getir
  const { data, error } = await supabase
    .from('hatimler')
    .select('*')
    .eager('cüzler(*)');

  if (error) {
    console.error('Veriler yüklenirken hata oluştu:', error);
    return;
  }

  // Verileri arayüze ekle (önceki kodda olduğu gibi)
}
