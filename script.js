// Düzenlenen script.js
// API anahtarları ve istemci kimliği güvenli bir şekilde yüklenecek

const PASSWORD = 'vefa'; // Şifre sabit

async function initClient() {
    const API_KEY = process.env.API_KEY;
    const CLIENT_ID = process.env.CLIENT_ID;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    if (!API_KEY || !CLIENT_ID || !SPREADSHEET_ID) {
        console.error('Gerekli API bilgileri eksik. Lütfen .env dosyasını kontrol edin.');
        alert('Sistem hatası. Lütfen teknik destekle iletişime geçin.');
        return;
    }

    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        scope: "https://www.googleapis.com/auth/spreadsheets"
    }).then(() => {
        console.log('Google Sheets API initialized');
        loadHatims(SPREADSHEET_ID);
    }).catch(error => {
        console.error('Google Sheets API başlatılamadı:', error);
        alert('Google Sheets API bağlantısı başarısız. Lütfen daha sonra tekrar deneyin.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('loginContainer');
    const contentContainer = document.getElementById('contentContainer');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === PASSWORD) {
            loginContainer.style.display = 'none';
            contentContainer.style.display = 'block';
            gapi.load('client:auth2', initClient);
        } else {
            alert('Yanlış şifre. Lütfen tekrar deneyin.');
        }
    });
});

async function loadHatims(SPREADSHEET_ID) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1:Z1000',
        });

        const rows = response.result.values;
        if (rows && rows.length > 1) {
            rows.slice(1).forEach(row => {
                const cüzler = row[2]?.split('|').map(c => {
                    const [isim, okundu] = c.split(':');
                    return { isim, okundu: okundu === 'Okundu' };
                }) || [];
                addHatim(false, { date: row[0], dua: row[1] === 'Evet', cüzler });
            });
        }
    } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
        alert('Veriler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    }
}

// Kaydetme, ekleme ve diğer işlevler buraya devam eder...
