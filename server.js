const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. 프로젝트 폴더 바로 아래에 index.html이 있다면 이렇게 설정합니다
app.use(express.static(__dirname));

// 2. 루트 경로 접속 시 index.html 파일을 보내주도록 추가
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/order', async (req, res) => {
    // (기존에 작성하신 주문 처리 코드 그대로 유지)
    const { title, actualAmount, unitName, totalPriceText, depositor, discordId, link } = req.body;
    
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ success: false, message: '서버에 웹훅 URL이 설정되지 않았습니다.' });
    }

    const payload = {
        embeds: [{
            title: "🛒 새로운 상품 주문이 접수되었습니다!",
            color: 15728680,
            fields: [
                { name: "📦 상품명", value: title, inline: false },
                { name: "🔢 수량", value: `${actualAmount}${unitName}`, inline: true },
                { name: "💰 총 결제금액", value: totalPriceText, inline: true },
                { name: "👤 입금자명", value: depositor, inline: true },
                { name: "💬 디스코드 ID", value: discordId, inline: true },
                { name: "🔗 서버 정보 / 이메일", value: link, inline: false }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: '디스코드 웹훅 전송 실패' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: '네트워크 오류 발생' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});