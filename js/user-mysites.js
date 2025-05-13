// 获取模态框元素
const modal = document.getElementById('customSiteModal');
const modalClose = modal.querySelector('.close');
const modalSearchInput = document.getElementById('modalSearchInput');
const modalSitesGrid = document.getElementById('modalSitesGrid');
const addSiteBtn = document.getElementById('addSiteBtn');

// 存储所有可用的网站数据
let allSites = [];

// 从teams.json加载网站数据
async function loadAvailableSites() {
    try {
        const response = await fetch('teams.json');
        const data = await response.json();
        allSites = data.teams.flatMap(team => team.sites);
        renderModalSites(allSites);
    } catch (error) {
        console.error('加载网站数据失败:', error);
    }
}

// 渲染模态框中的网站
function renderModalSites(sites) {
    modalSitesGrid.innerHTML = '';
    sites.forEach(site => {
        const siteCard = document.createElement('div');
        siteCard.className = 'site-card';
        siteCard.innerHTML = `
            <img src="${site.icon || 'images/default-icon.png'}" alt="${site.name}" class="site-icon">
            <div class="site-name">${site.name}</div>
            <div class="site-url">${site.url}</div>
        `;
        siteCard.addEventListener('click', () => addSiteToMyList(site));
        modalSitesGrid.appendChild(siteCard);
    });
}

// 搜索网站
modalSearchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSites = allSites.filter(site => 
        site.name.toLowerCase().includes(searchTerm) || 
        site.url.toLowerCase().includes(searchTerm)
    );
    renderModalSites(filteredSites);
});

// 添加网站到我的列表
async function addSiteToMyList(site) {
    try {
        // 获取当前用户的网站列表
        const response = await fetch('user-sites.json');
        const data = await response.json();
        
        // 检查网站是否已经存在
        if (data.sites.some(s => s.url === site.url)) {
            alert('该网站已经在你的列表中！');
            return;
        }

        // 添加新网站
        data.sites.push(site);
        
        // 保存更新后的数据
        await fetch('user-sites.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // 刷新网站列表显示
        loadUserSites();
        
        // 关闭模态框
        modal.style.display = 'none';
        
        // 显示成功提示
        alert('网站添加成功！');
    } catch (error) {
        console.error('添加网站失败:', error);
        alert('添加网站失败，请稍后重试。');
    }
}

// 打开模态框
addSiteBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    loadAvailableSites();
});

// 关闭模态框
modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 点击模态框外部关闭
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
}); 