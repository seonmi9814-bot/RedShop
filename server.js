const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const dataFilePath = path.join(__dirname, 'products.json');

// 서버 시작 시 파일이 없으면 초기 데이터 생성
if (!fs.existsSync(dataFilePath)) {
    const initialData = {
        discord: [
            { icon: '✨', name: '디스코드 니트로 프라임 1달', desc: '프리미엄 혜택이 담긴 니트로 1달 이용권', price: 4900, unit: '달', type: 'normal' },
            { icon: '💎', name: '디스코드 니트로 프라임 1년', desc: '1년 동안 즐기는 실속 있는 니트로 패키지', price: 49000, unit: '년', type: 'normal' }
        ],
        ott: [
            { icon: '🍿', name: '디즈니 플러스 (영구제)', desc: '디즈니 플러스 무제한 이용권', price: 3000, unit: '개', type: 'normal' }
        ],
        customCategories: []
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}

// 1. 데이터 불러오기 API
app.get('/api/products', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    res.json(data);
});

// 2. 관리자 데이터 추가 API
app.post('/api/products', (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!userIp || !userIp.includes('183.99.93.5')) return res.status(403).json({ error: '권한 없음' });

    const { type, category, item, categoryName } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

    if (type === 'product') {
        if (data[category]) data[category].push(item);
        else {
            const targetCat = data.customCategories.find(c => c.id === category);
            if (targetCat) targetCat.items.push(item);
        }
    } else if (type === 'category') {
        data.customCategories.push({ id: 'cat_' + Date.now(), name: categoryName, items: [] });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// 3. 백업용 다운로드 API (데이터를 파일로 받기)
app.get('/api/download-data', (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (userIp && userIp.includes('183.99.93.5')) {
        res.download(dataFilePath);
    } else {
        res.status(403).send('권한 없음');
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => console.log(`서버가 ${port}번 포트에서 가동 중입니다.`));