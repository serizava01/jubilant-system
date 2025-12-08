(function() {
    // ประกาศตัวแปร DOM
    const boxSelect = document.getElementById('boxSelect');
    const resultDiv = document.getElementById('result');
    const logDiv = document.getElementById('gacha-log');
    
    // ตัวแปรสำหรับเก็บจำนวนไอเทม (ใช้ localStorage เพื่อจำค่าข้ามหน้า)
    let counters = JSON.parse(localStorage.getItem('gachaCounters')) || {
        legendary: 0,
        epic: 0,
        artisan: 0,
        rare: 0,
        common: 0,
        total: 0
    };
    
    // อัตราการดรอปตามระดับความหายาก (%)
    const RARITY_RATES = {
        legendary: 0.5,    // 0.5%
        epic: 3.0,         // 3%
        artisan: 10.0,     // 10%
        rare: 26.5,        // 26.5%
        common: 60.0       // 60%
    };
    
    // ข้อมูลสีและชื่อไทยสำหรับแต่ละระดับ
    const RARITY_INFO = {
        legendary: { name: 'Legendary', color: '#ffd700', thai: 'เลเจนดารี' },
        epic: { name: 'Epic', color: '#9c27b0', thai: 'เอพิค' },
        artisan: { name: 'Artisan', color: '#2196f3', thai: 'อาร์ติซาน' },
        rare: { name: 'Rare', color: '#4caf50', thai: 'เรร์' },
        common: { name: 'Common', color: '#9e9e9e', thai: 'คอมมอน' }
    };
    
    // ฟังก์ชันเซฟค่าลง localStorage
    function saveCounters() {
        localStorage.setItem('gachaCounters', JSON.stringify(counters));
    }
    
    // ฟังก์ชันอัปเดตแสดงผล counter บนหน้าเว็บ
    function updateCounterDisplay() {
        for (const rarity in counters) {
            const element = document.getElementById(`count-${rarity}`);
            if (element) {
                element.textContent = counters[rarity].toLocaleString();
                
                // เพิ่มเอฟเฟกต์เมื่อมีการเปลี่ยนแปลงค่า
                element.classList.add('counter-updated');
                setTimeout(() => {
                    element.classList.remove('counter-updated');
                }, 300);
            }
        }
        
        // แสดงอัตราส่วน (%) ของแต่ละ rarity
        updateRarityPercentages();
    }
    
    // ฟังก์ชันคำนวณและแสดงอัตราส่วน
    function updateRarityPercentages() {
        if (counters.total === 0) return;
        
        for (const rarity in RARITY_INFO) {
            const percentElement = document.getElementById(`percent-${rarity}`);
            if (percentElement) {
                const percentage = ((counters[rarity] / counters.total) * 100).toFixed(2);
                percentElement.textContent = `(${percentage}%)`;
            }
        }
    }
    
    // ฟังก์ชันรีเซ็ต counter
    window.resetCounters = function() {
        if (confirm('คุณต้องการรีเซ็ตจำนวนไอเทมทั้งหมดใช่ไหม?\n\nข้อมูลทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้')) {
            // รีเซ็ตค่าทั้งหมดเป็น 0
            for (const rarity in counters) {
                counters[rarity] = 0;
            }
            
            saveCounters();
            updateCounterDisplay();
            
            // เคลียร์ log
            logDiv.innerHTML = '<div class="log-empty">ยังไม่มีประวัติการสุ่ม</div>';
            
            // เคลียร์ผลลัพธ์
            resultDiv.innerHTML = '<div class="no-result">กดปุ่มสุ่มเพื่อเริ่มเล่น!</div>';
            
            // แจ้งเตือนด้วย animation
            const resetMsg = document.createElement('div');
            resetMsg.className = 'reset-message';
            resetMsg.textContent = '✓ รีเซ็ตสำเร็จ';
            document.body.appendChild(resetMsg);
            
            setTimeout(() => {
                resetMsg.remove();
            }, 2000);
        }
    };
    
    // ฟังก์ชันเพิ่ม counter และเซฟค่า
    function incrementCounter(rarity) {
        if (counters.hasOwnProperty(rarity)) {
            counters[rarity]++;
            counters.total++;
            saveCounters();
            updateCounterDisplay();
        }
    }
    
    // ฟังก์ชัน log item
    function logItem(itemName, rarity = 'common') {
        // ถ้า log ยังว่าง ให้ลบข้อความว่างออก
        if (logDiv.children.length === 1 && logDiv.firstChild.classList?.contains('log-empty')) {
            logDiv.innerHTML = '';
        }
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${rarity}`;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = new Date().toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'log-name';
        nameSpan.textContent = itemName;
        
        const raritySpan = document.createElement('span');
        raritySpan.className = `log-rarity ${rarity}`;
        raritySpan.textContent = RARITY_INFO[rarity]?.thai || rarity;
        
        logEntry.appendChild(timeSpan);
        logEntry.appendChild(document.createTextNode(' - '));
        logEntry.appendChild(nameSpan);
        logEntry.appendChild(document.createTextNode(' ('));
        logEntry.appendChild(raritySpan);
        logEntry.appendChild(document.createTextNode(')'));
        
        // เพิ่มเข้าไปใน counter
        incrementCounter(rarity);
        
        // เพิ่ม log entry ที่ด้านบนสุด
        if (logDiv.firstChild) {
            logDiv.insertBefore(logEntry, logDiv.firstChild);
        } else {
            logDiv.appendChild(logEntry);
        }
        
        // จำกัดจำนวน log entries (50 รายการ)
        if (logDiv.children.length > 50) {
            logDiv.removeChild(logDiv.lastChild);
        }
        
        // แสดง animation สำหรับไอเทมหายาก
        if (rarity === 'legendary' || rarity === 'epic') {
            showRarityAnimation(rarity, itemName);
        }
    }
    
    // ฟังก์ชันแสดง animation สำหรับไอเทมหายาก
    function showRarityAnimation(rarity, itemName) {
        const animationDiv = document.createElement('div');
        animationDiv.className = `rarity-animation ${rarity}`;
        
        const rarityName = RARITY_INFO[rarity]?.name || rarity;
        animationDiv.innerHTML = `
            <div class="animation-content">
                <div class="rarity-icon">★</div>
                <div class="rarity-text">${rarityName.toUpperCase()}!</div>
                <div class="item-text">${itemName}</div>
            </div>
        `;
        
        document.body.appendChild(animationDiv);
        
        // ลบ animation หลังจาก 3 วินาที
        setTimeout(() => {
            animationDiv.classList.add('fade-out');
            setTimeout(() => {
                animationDiv.remove();
            }, 1000);
        }, 3000);
    }
    
    // ฟังก์ชันโหลดกล่องจาก boxes.js
    function populateBoxes() {
        boxSelect.innerHTML = '';
        
        if (!BOXES || Object.keys(BOXES).length === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'ไม่พบกล่อง';
            opt.disabled = true;
            boxSelect.appendChild(opt);
            return;
        }
        
        for (const k in BOXES) {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = BOXES[k].name;
            
            // เพิ่มข้อมูลอัตราส่วนถ้ามี
            if (BOXES[k].description) {
                opt.title = BOXES[k].description;
            }
            
            boxSelect.appendChild(opt);
        }
        
        if (boxSelect.options.length > 0) {
            boxSelect.selectedIndex = 0;
            updateBoxInfo();
        }
    }
    
    // ฟังก์ชันอัปเดตข้อมูลกล่องที่เลือก
    function updateBoxInfo() {
        const boxInfoDiv = document.getElementById('box-info');
        if (!boxInfoDiv) return;
        
        const boxKey = boxSelect.value;
        if (BOXES[boxKey]) {
            const box = BOXES[boxKey];
            boxInfoDiv.innerHTML = `
                <h3>${box.name}</h3>
                ${box.description ? `<p>${box.description}</p>` : ''}
                <p class="item-count">จำนวนไอเทมในกล่อง: ${box.items?.length || 0} รายการ</p>
            `;
        }
    }
    
    // ฟังก์ชันสุ่มระดับความหายาก
    function weightedRandomRarity() {
        let total = Object.values(RARITY_RATES).reduce((s, rate) => s + rate, 0);
        let r = Math.random() * total;
        
        for (const rarity in RARITY_RATES) {
            r -= RARITY_RATES[rarity];
            if (r <= 0) return rarity;
        }
        
        return 'common'; // fallback
    }
    
    // ฟังก์ชันสุ่มไอเทมจาก pool
    function weightedRandom(pool) {
        if (!pool || pool.length === 0) return null;
        
        const valid = pool.map(key => ({ 
            key, 
            item: ITEMS[key],
            rate: Number(ITEMS[key]?.rate || 1) // ถ้าไม่มี rate ให้ใช้ 1
        })).filter(x => x.item);
        
        if (valid.length === 0) return null;
        
        const total = valid.reduce((s, e) => s + e.rate, 0);
        if (total <= 0) return null;
        
        let r = Math.random() * total;
        for (const e of valid) {
            r -= e.rate;
            if (r <= 0) return e.key;
        }
        
        return valid[valid.length - 1].key;
    }
    
    // ฟังก์ชันสร้างการ์ดไอเทม
    function renderItemCard(item) {
        const wrap = document.createElement('div');
        wrap.className = 'card';
        wrap.dataset.rarity = item.rarity || 'common';
        
        const img = document.createElement('img');
        img.src = item.img || 'https://via.placeholder.com/100x100/CCCCCC/808080?text=NO+IMAGE';
        img.alt = item.name;
        img.loading = 'lazy';
        
        img.onerror = function() { 
            this.src = 'https://via.placeholder.com/100x100/CCCCCC/808080?text=NO+IMAGE';
            this.style.opacity = 0.7; 
        };
        
        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = item.name;
        
        const rarity = document.createElement('div');
        rarity.className = `item-rarity ${item.rarity || 'common'}`;
        rarity.textContent = RARITY_INFO[item.rarity]?.thai || 'ทั่วไป';
        
        wrap.appendChild(img);
        wrap.appendChild(name);
        wrap.appendChild(rarity);
        
        return wrap;
    }
    
    // ฟังก์ชันหลักสำหรับสุ่มไอเทม
    window.rollItem = function(times) {
        // ตรวจสอบว่ามีข้อมูล items และ boxes ไหม
        if (!ITEMS || Object.keys(ITEMS).length === 0) {
            resultDiv.innerHTML = '<div class="error-message">❌ ไม่พบข้อมูลไอเทม กรุณาตรวจสอบ items.js</div>';
            return;
        }
        
        if (!BOXES || Object.keys(BOXES).length === 0) {
            resultDiv.innerHTML = '<div class="error-message">❌ ไม่พบข้อมูลกล่อง กรุณาตรวจสอบ boxes.js</div>';
            return;
        }
        
        const boxKey = boxSelect.value;
        if (!boxKey || !BOXES[boxKey]) {
            resultDiv.innerHTML = '<div class="error-message">❌ ไม่มีการเลือกกล่อง หรือ กล่องไม่ถูกต้อง</div>';
            return;
        }
        
        const box = BOXES[boxKey];
        const allowedItemsInBox = box.items || [];
        
        // เคลียร์ผลลัพธ์ก่อนหน้า
        if (times === 1 || times === 10) {
            resultDiv.innerHTML = '';
        } else if (times === 100) {
            resultDiv.innerHTML = '<div class="loading">กำลังสุ่ม 100 ไอเทม...</div>';
            setTimeout(() => {
                resultDiv.innerHTML = '';
                performRolls(times, boxKey, allowedItemsInBox);
            }, 50);
            return;
        }
        
        performRolls(times, boxKey, allowedItemsInBox);
    };
    
    // ฟังก์ชันสำหรับสุ่มจริง
    function performRolls(times, boxKey, allowedItemsInBox) {
        const box = BOXES[boxKey];
        let stats = {
            legendary: 0,
            epic: 0,
            artisan: 0,
            rare: 0,
            common: 0
        };
        
        for (let i = 0; i < times; i++) {
            // สุ่มระดับความหายาก
            const rolledRarity = weightedRandomRarity();
            stats[rolledRarity]++;
            
            // หาไอเทมทั้งหมดในระดับความหายากนี้ที่อยู่ในกล่อง
            const poolForRarity = Object.keys(ITEMS).filter(key => {
                const item = ITEMS[key];
                return (item.rarity || 'common').toLowerCase() === rolledRarity && 
                       allowedItemsInBox.includes(key);
            });
            
            if (poolForRarity.length === 0) {
                console.warn(`ไม่พบไอเทมระดับ ${rolledRarity} ในกล่อง ${box.name}`);
                
                // ถ้าไม่มีไอเทมในระดับนี้ ให้ใช้ไอเทมคอมมอนแทน
                const commonPool = Object.keys(ITEMS).filter(key => {
                    const item = ITEMS[key];
                    return (item.rarity || 'common').toLowerCase() === 'common' && 
                           allowedItemsInBox.includes(key);
                });
                
                if (commonPool.length > 0) {
                    const k = weightedRandom(commonPool);
                    if (k && ITEMS[k]) {
                        const item = ITEMS[k];
                        resultDiv.appendChild(renderItemCard(item));
                        logItem(item.name, 'common');
                    }
                }
                continue;
            }
            
            // สุ่มไอเทมจาก pool
            const k = weightedRandom(poolForRarity);
            
            if (!k || !ITEMS[k]) {
                console.error(`เกิดข้อผิดพลาดในการสุ่มไอเทมระดับ ${rolledRarity}`);
                continue;
            }
            
            const item = ITEMS[k];
            const itemRarity = (item.rarity || 'common').toLowerCase();
            
            // แสดงการ์ด
            resultDiv.appendChild(renderItemCard(item));
            
            // บันทึก log
            logItem(item.name, itemRarity);
        }
        
        // แสดงสถิติการสุ่ม (เฉพาะเมื่อสุ่ม 10 หรือ 100 ครั้ง)
        if (times >= 10) {
            showRollStats(times, stats);
        }
    }
    
    // ฟังก์ชันแสดงสถิติการสุ่ม
    function showRollStats(totalRolls, stats) {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'roll-stats';
        
        let statsHTML = `<h3>สถิติการสุ่ม ${totalRolls} ครั้ง:</h3><div class="stats-grid">`;
        
        for (const rarity in stats) {
            const count = stats[rarity];
            const percentage = ((count / totalRolls) * 100).toFixed(2);
            const expected = RARITY_RATES[rarity];
            const difference = (percentage - expected).toFixed(2);
            
            statsHTML += `
                <div class="stat ${rarity}">
                    <span class="stat-label">${RARITY_INFO[rarity]?.thai || rarity}:</span>
                    <span class="stat-value">${count}</span>
                    <span class="stat-percent">${percentage}%</span>
                    <span class="stat-diff ${difference >= 0 ? 'positive' : 'negative'}">
                        ${difference >= 0 ? '+' : ''}${difference}%
                    </span>
                </div>
            `;
        }
        
        statsHTML += '</div>';
        statsDiv.innerHTML = statsHTML;
        
        // แทรก stats ไว้ด้านบนของผลลัพธ์
        if (resultDiv.firstChild) {
            resultDiv.insertBefore(statsDiv, resultDiv.firstChild);
        } else {
            resultDiv.appendChild(statsDiv);
        }
    }
    
    // ฟังก์ชันเริ่มต้นระบบ
    function initialize() {
        // โหลดกล่อง
        populateBoxes();
        
        // อัปเดต counter เริ่มต้น
        updateCounterDisplay();
        
        // ตั้งค่า event listener สำหรับการเปลี่ยนกล่อง
        boxSelect.addEventListener('change', updateBoxInfo);
        
        // ตรวจสอบและเพิ่มข้อความเริ่มต้นใน log
        if (logDiv.children.length === 0) {
            logDiv.innerHTML = '<div class="log-empty">ยังไม่มีประวัติการสุ่ม</div>';
        }
        
        // เพิ่มข้อความเริ่มต้นใน result
        if (resultDiv.children.length === 0) {
            resultDiv.innerHTML = '<div class="no-result">กดปุ่มสุ่มเพื่อเริ่มเล่น!</div>';
        }
        
        // แสดงข้อมูลเวอร์ชัน (optional)
        console.log('Gacha Simulator v1.0 - Ready!');
    }
    
    // เริ่มต้นระบบเมื่อหน้าโหลดเสร็จ
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();