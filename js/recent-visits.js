// 记录最近访问
function recordVisit(pageInfo) {
    // 获取现有的访问历史
    let recentVisits = JSON.parse(localStorage.getItem('recentVisits') || '[]');
    
    // 检查是否已存在此页面的访问记录
    const existingIndex = recentVisits.findIndex(item => item.id === pageInfo.id);
    
    // 如果已存在，则移除旧记录
    if (existingIndex !== -1) {
        recentVisits.splice(existingIndex, 1);
    }
    
    // 添加新记录到开头
    recentVisits.unshift(pageInfo);
    
    // 限制最近访问记录数量为10
    if (recentVisits.length > 10) {
        recentVisits = recentVisits.slice(0, 10);
    }
    
    // 保存到localStorage
    localStorage.setItem('recentVisits', JSON.stringify(recentVisits));
    
    // 重新加载最近访问列表
    loadRecentVisits();
}

// 记录当前页面的访问
function recordCurrentPageVisit() {
    // 页面信息
    const pageInfo = {
        id: window.location.pathname, // 使用路径作为唯一标识
        title: document.title.split('|')[0].trim(), // 页面标题
        url: window.location.href, // 页面URL
        icon: getFavicon(), // 获取当前页面的图标
        timestamp: new Date().getTime() // 访问时间戳
    };
    
    recordVisit(pageInfo);
}

// 获取当前页面的favicon
function getFavicon() {
    // 尝试从link标签获取favicon
    const faviconEls = document.querySelectorAll('link[rel*="icon"]');
    if (faviconEls.length > 0) {
        return faviconEls[0].href;
    }
    // 如果没有找到，返回默认favicon路径
    return window.location.origin + '/favicon.ico';
}

// 为所有资源访问按钮添加事件监听
function setupResourceVisits() {
    const visitButtons = document.querySelectorAll('.visit-btn');
    
    visitButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 获取资源信息
            const resourceCard = this.closest('.resource-card');
            const title = resourceCard.querySelector('h3').textContent;
            const icon = resourceCard.querySelector('.resource-icon img').src;
            const url = this.href;
            
            // 创建访问记录
            const visitInfo = {
                id: url, // 使用URL作为唯一标识
                title: title,
                url: url,
                icon: icon,
                timestamp: new Date().getTime()
            };
            
            recordVisit(visitInfo);
        });
    });
}

// 格式化时间为"几分钟前"、"几小时前"等
function formatTimeAgo(timestamp) {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    // 转换为秒、分钟、小时、天
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return "刚刚";
    } else if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return new Date(timestamp).toLocaleDateString();
    }
}

// 默认图标，使用base64编码的内联数据
const DEFAULT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7klEQVQ4jZ2TMUoDQRSGvzdZCGhhYRkQbAQbwTKVnQew8AiWaY9gYZsrWFoJVpZioUUaIZ1dOkHELBt3x2JndXfCMuL/weP93zczj/defHECVK3I0+TlUpPmQkRQVR4eH6aNC9XZWVCp3Bljfh3ddd0FCTp0ule5zABN0zuM+RCRz8zzvmZ7K4r7jbcN3w+25qMoFmAjSdLjnMSL88v7baJumy7J87wPPDnny+8OdJyZHQcUReGcc3sRSSYZTyYT5A9RXdft1XVNFEU4506bpjnY1mFZlp7v+5cwDDeA9y3T5pv/Dqyqz6p6/QWe8lLxLSCcSQAAAABJRU5ErkJggg==';

// 加载最近访问记录
function loadRecentVisits() {
    const recentVisitsList = document.getElementById('recentVisitsList');
    if (!recentVisitsList) return;
    
    // 从localStorage获取访问记录
    const recentVisits = JSON.parse(localStorage.getItem('recentVisits') || '[]');
    
    // 清空现有内容
    recentVisitsList.innerHTML = '';
    
    // 如果没有访问记录
    if (recentVisits.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.classList.add('empty-item');
        emptyItem.textContent = '暂无访问记录';
        recentVisitsList.appendChild(emptyItem);
        return;
    }
    
    // 添加访问记录
    recentVisits.forEach(visit => {
        const li = document.createElement('li');
        
        const a = document.createElement('a');
        a.href = visit.url;
        a.target = '_blank';
        
        const img = document.createElement('img');
        // 先设置为默认图标，以防原图标加载失败时闪烁
        img.src = DEFAULT_ICON;
        img.alt = visit.title;
        
        // 如果有图标，尝试加载原图标
        if (visit.icon) {
            const tempImg = new Image();
            tempImg.onload = function() {
                img.src = visit.icon;
            };
            tempImg.onerror = function() {
                // 保持默认图标
                img.src = DEFAULT_ICON;
            };
            tempImg.src = visit.icon;
        }
        
        const span = document.createElement('span');
        span.textContent = formatTimeAgo(visit.timestamp);
        
        a.appendChild(img);
        a.appendChild(document.createTextNode(visit.title));
        a.appendChild(span);
        
        li.appendChild(a);
        recentVisitsList.appendChild(li);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载最近访问
    loadRecentVisits();
    
    // 记录当前页面访问
    recordCurrentPageVisit();
    
    // 设置资源访问记录
    setupResourceVisits();
}); 