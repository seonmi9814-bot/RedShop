require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// 0. 메인 페이지 서빙
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. 디스코드 로그인 시작
app.get('/auth/login', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`);
});

// 2. 인증 완료 콜백
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('인증 실패');

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID, 
            client_secret: CLIENT_SECRET, 
            grant_type: 'authorization_code', 
            code: code, 
            redirect_uri: REDIRECT_URI
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        const username = userResponse.data.username;
        res.redirect(`/?username=${encodeURIComponent(username)}`);
    } catch (error) {
        res.send('인증 실패');
    }
});

// 3. 주문 접수 및 디스코드 웹훅 전송
app.post('/api/order', async (req, res) => {
    const { username, title, qty, total, depositor, link } = req.body;
    
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1538322085816832135/qaRfzPaM5_9He5VqfhIDhGNoHVL3QjpsHZafw0rFQDaNTz8YWwHJdTzwROt_TrjStjJE';
    
    try {
        await axios.post(WEBHOOK_URL, {
            embeds: [{
                title: "새로운 주문이 접수되었습니다! 🛒",
                color: 16711680, // 빨간색
                fields: [
                    { name: "구매자", value: username, inline: true },
                    { name: "상품명", value: title, inline: false },
                    { name: "수량", value: qty, inline: true },
                    { name: "총 금액", value: total, inline: true },
                    { name: "입금자명", value: depositor, inline: true },
                    { name: "서버 주소", value: link, inline: false }
                ],
                timestamp: new Date()
            }]
        });
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버가 ${PORT}번 포트에서 시작되었습니다.`));