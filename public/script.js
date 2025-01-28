const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseKey = CONFIG.SUPABASE_ANON_KEY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Giriş butonu işlevi
document.getElementById('loginButton').addEventListener('click', async () => {
  const password = document.getElementById('passwordInput').value;
  if (password === 'vefa') {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('contentContainer').style.display = 'block';
    loadHatims();
  } else {
    document.getElementById('errorMessage').textContent = 'Geçersiz şifre';
  }
});

// Hatimleri yükle
async function loadHatims() {
  const { data: hatims, error } = await supabase.from('hatimler').select('*').order('id', { ascending: true });
  if (error) {
    console.error('Hatim yüklenemedi:', error.message);
    return;
  }
  document.getElementById('hatimContainer').innerHTML = ''; // Önceki içeriği temizle
  hatims.forEach(hatim => addHatim(hatim));
}

// Hatim kartı oluştur
function createHatimCard(hatim) {
  const hatimDiv = document.createElement('div');
  hatimDiv.className = 'hatim';
  hatimDiv.innerHTML = `
    <h2>Hatim ${hatim.id}</h2>
    <button class="delete-hatim">Sil</button>
    <input type="date" value="${hatim.date}">
    <button class="save-date">Kaydet</button>
    <label for="hatim-duasi-checkbox-${hatim.id}">Hatim Duası</label>
    <input type="checkbox" id="hatim-duasi-checkbox-${hatim.id}" ${hatim.dua ? 'checked' : ''} class="dua-checkbox">
    <ul class="cuz-list">
      ${Array.from({ length: 30 }, (_, i) => `
        <li class="cuz-item">
          <span>Cüz ${i + 1}</span>
          <input type="text" placeholder="İsim yazınız" value="${hatim.cuzler[i]?.isim || ''}">
          <button class="save-cuz">Kaydet</button>
          <input type="checkbox" ${hatim.cuzler[i]?.okundu ? 'checked' : ''}>
          <span class="okundu-label">okundu</span>
        </li>
      `).join('')}
    </ul>
  `;
  hatimDiv.setAttribute('data-id', hatim.id);
  return hatimDiv;
}

// Hatim ekle
function addHatim(hatimData = null) {
  const hatimCard = createHatimCard(hatimData);
  document.getElementById('hatimContainer').appendChild(hatimCard);
  if (!hatimData) saveHatim(hatimCard);
}

// Hatim kaydet
async function saveHatim(hatimCard) {
  const hatimId = hatimCard.getAttribute('data-id');
  const date = hatimCard.querySelector('input[type="date"]').value;
  const dua = hatimCard.querySelector('.dua-checkbox').checked;
  const cuzler = Array.from(hatimCard.querySelectorAll('.cuz-item')).map((item, index) => ({
    cuz_no: index + 1,
    isim: item.querySelector('input[type="text"]').value,
    okundu: item.querySelector('input[type="checkbox"]').checked
  }));

  const { data, error } = await supabase.from('hatimler').upsert([
    { id: hatimId, date, dua, cuzler }
  ]);

  if (error) {
    console.error('Hatim kaydedilemedi:', error.message);
    showMessage('Hatim kaydedilirken bir hata oluştu.', 'error');
  } else {
    showMessage('Hatim başarıyla kaydedildi.', 'success');
  }
}

// Hatim sil
async function deleteHatim(hatimId) {
  const { error } = await supabase.from('hatimler').delete().eq('id', hatimId);
  if (error) {
    console.error('Hatim silinemedi:', error.message);
    showMessage('Hatim silinirken bir hata oluştu.', 'error');
  } else {
    document.querySelector(`.hatim[data-id="${hatimId}"]`).remove();
    showMessage('Hatim başarıyla silindi.', 'success');
  }
}

// Bildirim göster
function showMessage(message, type = 'success') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  setTimeout(() => messageDiv.remove(), 3000);
}

// Yeni hatim ekle butonu
document.getElementById('addHatimButton').addEventListener('click', () => {
  addHatim();
});

// Tıklama olaylarını dinle
document.addEventListener('click', async (event) => {
  if (event.target.classList.contains('save-date')) {
    const hatimCard = event.target.closest('.hatim');
    await saveHatim(hatimCard);
  }
  if (event.target.classList.contains('delete-hatim')) {
    const hatimCard = event.target.closest('.hatim');
    const hatimId = hatimCard.getAttribute('data-id');
    if (confirm('Bu hatimi silmek istediğinizden emin misiniz?')) {
      await deleteHatim(hatimId);
    }
  }
  if (event.target.classList.contains('save-cuz')) {
    const hatimCard = event.target.closest('.hatim');
    await saveHatim(hatimCard);
  }
});

// Veritabanını sıfırla butonu
document.getElementById('resetDatabaseButton').addEventListener('click', async () => {
  const password = prompt('Admin şifresini girin:');
  if (password === 'admin') {
    const { error } = await supabase.from('hatimler').delete().neq('id', 0);
    if (error) {
      console.error('Veritabanı sıfırlanamadı:', error.message);
      showMessage('Veritabanı sıfırlanırken bir hata oluştu.', 'error');
    } else {
      showMessage('Veritabanı başarıyla sıfırlandı.', 'success');
      loadHatims();
    }
  } else {
    showMessage('Geçersiz admin şifresi.', 'error');
  }
});
