/**
 * 搜索栏配置脚本
 * 用于区分站内资源搜索和论坛搜索
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取搜索框和按钮元素
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput || !searchBtn) return;
    
    // 判断当前页面是否为论坛相关页面
    const isForumPage = window.location.pathname.includes('forum.html') || 
                         window.location.pathname.includes('post-detail.html');
    
    // 根据页面类型设置不同的搜索提示文本
    if (isForumPage) {
        // 论坛页面搜索
        searchInput.setAttribute('placeholder', '搜索论坛主题、帖子或用户...');
        
        // 添加搜索框右侧的标识
        const searchIdentifier = document.createElement('span');
        searchIdentifier.className = 'search-type-indicator forum';
        searchIdentifier.textContent = '论坛搜索';
        
        // 将标识添加到搜索栏
        searchInput.parentNode.style.position = 'relative';
        searchInput.parentNode.appendChild(searchIdentifier);
    } else {
        // 首页资源搜索
        searchInput.setAttribute('placeholder', '搜索站内资源、工具或网站...');
        
        // 添加搜索框右侧的标识
        const searchIdentifier = document.createElement('span');
        searchIdentifier.className = 'search-type-indicator site';
        searchIdentifier.textContent = '站内搜索';
        
        // 将标识添加到搜索栏
        searchInput.parentNode.style.position = 'relative';
        searchInput.parentNode.appendChild(searchIdentifier);
    }
});
