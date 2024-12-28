const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());

app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    if (password === 'vefa') {
        res.status(200).send({ message: 'Login successful' });
    } else {
        res.status(401).send({ message: 'Invalid password' });
    }
});

app.get('/api/hatims', async (req, res) => {
    const { data, error } = await supabase.from('hatimler').select('*').order('id', { ascending: true });
    if (error) {
        return res.status(500).send({ error: error.message });
    }
    res.send(data);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
