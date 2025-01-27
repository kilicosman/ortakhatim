const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Giriş kontrolü middleware'i
const authenticate = (req, res, next) => {
  const password = req.body.password || req.query.password;
  if (password === process.env.LOGIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Geçersiz şifre' });
  }
};

// Admin şifre kontrolü middleware'i
const authenticateAdmin = (req, res, next) => {
  const password = req.body.password || req.query.password;
  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Geçersiz admin şifresi' });
  }
};

// Hatimleri listele
app.get('/api/hatims', async (req, res) => {
  const { data, error } = await supabase.from('hatimler').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Yeni hatim ekle
app.post('/api/hatims', authenticate, async (req, res) => {
  const { date, dua, cuzler } = req.body;
  const { data, error } = await supabase.from('hatimler').insert([{ date, dua, cuzler }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Hatim güncelle
app.put('/api/hatims/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, dua, cuzler } = req.body;
  const { data, error } = await supabase.from('hatimler').update({ date, dua, cuzler }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Hatim sil
app.delete('/api/hatims/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('hatimler').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Veritabanını sıfırla (admin şifresi gerektirir)
app.post('/api/reset', authenticateAdmin, async (req, res) => {
  const { data, error } = await supabase.from('hatimler').delete().neq('id', 0);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Veritabanı sıfırlandı' });
});

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server http://localhost:${port} üzerinde çalışıyor`);
});
