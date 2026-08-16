const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const dataFilePath = path.join(__dirname, 'products.json');

// 기본 데이터 초기화
if (!fs.existsSync(dataFilePath)) {
    const initialData = {
        discord: [
            { icon: '✨', name: '디스코드 니트로 프라임 1달', desc: '프리미엄 혜택이 담긴 니트로 1달 이용권', price: 4900, unit: '달', type: 'normal' },
            { icon: '💎', name: '디스코드 니트로 프라임 1년', desc: '1년 동안 즐기는 실속 있는 니트로 패키지', price: 49000, unit: '년', type: 'normal' },
            { icon: '🎨', name: '디스코드 무한장식', desc: '무제한 프로필 아바타 장식 이용권', price: 50000, unit: '개', type: 'normal' },
            { icon: '🚀', name: '서버부스트 1달 (2개 단위)', desc: 'Discord 서버 레벨업 및 고음질 혜택', price: 750, unit: '개', type: 'boost' },
            { icon: '🚀', name: '서버부스트 3달 (2개 단위)', desc: '3개월 장기 서버 부스트 패키지', price: 2000, unit: '개', type: 'boost' },
            { icon: '🔑', name: '복구키 온라인 (1,000명 단위)', desc: '서버 데이터 및 구성 관리를 위한 복구키', price: 10000, unit: '명', type: 'normal' },
            { icon: '👥', name: '디스코드 실인원 (500명 단위)', desc: '서버 활성화를 위한 실인원 충전', price: 10000, unit: '명', type: 'normal' },
            { icon: '🛡️', name: '오프라인 멤버 (1,000명 단위)', desc: '1,000명당 7,500원 구성', price: 7500, unit: '명', type: 'normal' }
        ],
        ott: [
            { icon: '🍿', name: '디즈니 플러스 (영구제)', desc: '디즈니 플러스 무제한 이용권', price: 3000, unit: '개', type: 'normal' },
            { icon: '🎬', name: '캡컷 (영구제)', desc: '영상 편집 프로 기능 이용권', price: 4000, unit: '개', type: 'normal' },
            { icon: '🔒', name: '노드 VPN (영구제)', desc: '안전하고 빠른 보안 VPN', price: 7000, unit: '개', type: 'normal' },
            { icon: '🎬', name: '넷플릭스 (영구제)', desc: '고화질 영화 및 드라마 스트리밍', price: 3000, unit: '개', type: 'normal' },
            { icon: '🤖', name: '챗지피티 (영구제)', desc: 'AI 챗봇 프리미엄 서비스 이용권', price: 25000, unit: '개', type: 'normal' },
            { icon: '🎵', name: '스포티파이 (영구제)', desc: '무제한 음악 스트리밍 서비스', price: 12000, unit: '개', type: 'normal' },
            { icon: '▶️', name: '유튜브 프리미엄 (1달)', desc: '광고 없는 동영상 및 유튜브 뮤직', price: 5000, unit: '달', type: 'normal' },
            { icon: '▶️', name: '유튜브 프리미엄 (3달)', desc: '3개월 실속형 프리미엄 패키지', price: 10000, unit: '달', type: 'normal' },
            { icon: '▶️', name: '유튜브 프리미엄 (1년)', desc: '1년 동안 즐기는 유튜브 프리미엄', price: 15000, unit: '년', type: 'normal' }
        ],
        customCategories: []
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}

app.get('/api/check-admin', (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.json({ isAdmin: userIp && userIp.includes('183.99.93.5') });
});

app.get('/api/products', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    res.json(data);
});

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

app.listen(port, () => console.log(`서버 실행 중: ${port}`));