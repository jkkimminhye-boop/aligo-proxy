const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const ALIGO_API_KEY = process.env.ALIGO_API_KEY;
const ALIGO_USER_ID = process.env.ALIGO_USER_ID;
const ALIGO_SENDER = '01094101577';
const SECRET_KEY = process.env.SECRET_KEY; // 보안용

app.post('/send-message', async (req, res) => {
  // 보안 키 확인
  const authHeader = req.headers['x-secret-key'];
  if (authHeader !== SECRET_KEY) {
    return res.status(401).json({ error: '인증 실패' });
  }

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: '전화번호와 메시지가 필요합니다' });
  }

  try {
    const params = new URLSearchParams();
    params.append('user_id', ALIGO_USER_ID);
    params.append('key', ALIGO_API_KEY);
    params.append('sender', ALIGO_SENDER);
    params.append('receiver', phone.replace(/-/g, ''));
    params.append('msg', message);
    params.append('msg_type', 'SMS');

    const response = await axios.post(
      'https://apis.aligo.in/send/',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('알리고 응답:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('알리고 요청 실패:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: ${PORT}`);
});