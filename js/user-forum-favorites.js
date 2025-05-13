// 用户收藏帖子页面功能交互脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户登录状态
    initUserAuth();
    
    // 检查用户是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn !== 'true') {
        // 显示登录提示
        showLoginPrompt();
        return;
    }
    
    // 初始化页面
    initFavoritesPage();
    
    // 初始化用户下拉菜单
    initUserDropdown();
    
    // 初始化分类标签切换
    initTabsFilter();
    
    // 初始化搜索功能
    initSearchFilter();
});

// 显示登录提示
function showLoginPrompt() {
    const favoritesContainer = document.querySelector('.favorites-container');
    if (favoritesContainer) {
        favoritesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;" class="empty-favorites">
                <i class="bi bi-lock"></i>
                <h3>请先登录</h3>
                <p>您需要登录才能查看您的收藏帖子</p>
                <div>
                    <a href="login.html" class="visit-btn">登录</a>
                    <a href="register.html" style="display: inline-block; background-color: #f5f5f5; color: #333; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-left: 10px;">注册</a>
                </div>
            </div>
        `;
    }
    
    // 修改用户头像区域为游客状态
    document.getElementById('headerUsername').textContent = '游客';
    document.getElementById('user-actions').innerHTML = `
        <a href="login.html" class="login-btn" style="margin-right: 10px; padding: 8px 16px; background-color: #6366F1; color: white; border-radius: 4px; text-decoration: none;">登录</a>
        <a href="register.html" class="register-btn" style="padding: 8px 16px; background-color: white; color: #333; border: 1px solid #ddd; border-radius: 4px; text-decoration: none;">注册</a>
    `;
}

// 初始化用户下拉菜单
function initUserDropdown() {
    const userBtn = document.querySelector('.user-btn');
    
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelector('.dropdown-menu').classList.toggle('show');
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-dropdown')) {
                const dropdownMenu = document.querySelector('.dropdown-menu');
                if (dropdownMenu && dropdownMenu.classList.contains('show')) {
                    dropdownMenu.classList.remove('show');
                }
            }
        });
    }
    
    // 添加退出登录功能
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        // 清除登录信息
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        
        // 提示用户已退出登录
        alert('您已成功退出登录');
        
        // 重定向到首页
        window.location.href = 'index.html';
    });
}

// 初始化收藏页面
function initFavoritesPage() {
    // 加载用户信息
    const username = localStorage.getItem('username') || '游客';
    const userAvatar = localStorage.getItem('userAvatar') || './image/image--01.png';
    
    // 更新用户信息显示
    document.getElementById('headerUsername').textContent = username;
    document.getElementById('headerAvatarImg').src = userAvatar;
    
    // 加载收藏的帖子
    loadFavoritePosts();
}

// 加载收藏的帖子
function loadFavoritePosts(category = 'all', searchText = '') {
    // 获取保存的收藏帖子ID列表
    const favoritePosts = JSON.parse(localStorage.getItem('favoritePosts') || '[]');
    
    // 获取所有论坛帖子
    const allPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    
    // 筛选出收藏的帖子
    let favoritePostsData = allPosts.filter(post => favoritePosts.includes(post.id));
    
    // 根据分类筛选
    if (category !== 'all') {
        favoritePostsData = favoritePostsData.filter(post => post.category === category);
    }
    
    // 根据搜索文本筛选
    if (searchText) {
        const searchLower = searchText.toLowerCase();
        favoritePostsData = favoritePostsData.filter(post => 
            post.title.toLowerCase().includes(searchLower) || 
            (post.content && post.content.toLowerCase().includes(searchLower))
        );
    }
    
    // 按时间降序排序
    favoritePostsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 更新收藏计数
    const totalCount = document.getElementById('totalCount');
    if (totalCount) {
        totalCount.textContent = favoritePostsData.length;
    }
    
    // 显示帖子列表
    displayPosts(favoritePostsData);
}

// 显示帖子列表
function displayPosts(posts) {
    const postList = document.getElementById('postList');
    
    // 清空当前列表
    postList.innerHTML = '';
    
    // 如果没有收藏的帖子，显示空状态
    if (posts.length === 0) {
        postList.innerHTML = `
            <div class="empty-favorites">
                <i class="bi bi-bookmark"></i>
                <h3>暂无收藏帖子</h3>
                <p>您还没有收藏任何帖子，浏览论坛并点击星标图标添加收藏</p>
                <a href="forum.html">浏览论坛</a>
            </div>
        `;
        return;
    }
    
    // 渲染帖子列表
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        
        // 计算评论数量
        const commentCount = post.replies || 0;
        
        // 计算时间段
        const postDate = formatDate(post.date);
        
        postElement.innerHTML = `
            <div class="post-avatar">
                <img src="${post.authorAvatar || './image/image--01.png'}" alt="用户头像">
            </div>
            <div class="post-content">
                <h3 class="post-title">
                    <a href="post-detail.html?id=${post.id}">${post.title}</a>
                </h3>
                <div class="post-meta">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${postDate}</span>
                    <span class="post-category">${getCategoryText(post.category)}</span>
                </div>
                <p class="post-excerpt">${getExcerpt(post.content, 100)}</p>
                <div class="post-stats">
                    <span><i class="bi bi-eye"></i> ${post.views || 0}</span>
                    <span><i class="bi bi-chat-dots"></i> ${commentCount}</span>
                    <span><i class="bi bi-hand-thumbs-up"></i> ${post.likes || 0}</span>
                </div>
            </div>
            <div class="post-actions-menu">
                <button class="remove-favorite" data-id="${post.id}" title="取消收藏">
                    <i class="bi bi-star-fill"></i>
                </button>
            </div>
        `;
        
        postList.appendChild(postElement);
        
        // 添加取消收藏事件
        const removeBtn = postElement.querySelector('.remove-favorite');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                removeFromFavorites(this.getAttribute('data-id'));
            });
        }
    });
}

// 初始化分类标签切换
function initTabsFilter() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的激活状态
            tabs.forEach(t => t.classList.remove('active'));
            
            // 激活当前标签
            this.classList.add('active');
            
            // 获取当前筛选分类
            const category = this.getAttribute('data-tab');
            
            // 获取当前搜索文本
            const searchText = document.getElementById('searchFavorites').value.trim();
            
            // 加载对应分类的帖子
            loadFavoritePosts(category, searchText);
        });
    });
}

// 初始化搜索功能
function initSearchFilter() {
    const searchInput = document.getElementById('searchFavorites');
    const searchButton = document.querySelector('.search-filter button');
    
    // 输入框内容变化时搜索
    searchInput.addEventListener('input', function() {
        const searchText = this.value.trim();
        
        // 获取当前激活的分类
        const activeTab = document.querySelector('.tab.active');
        const category = activeTab ? activeTab.getAttribute('data-tab') : 'all';
        
        // 延迟执行搜索，避免频繁刷新
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            loadFavoritePosts(category, searchText);
        }, 300);
    });
    
    // 点击搜索按钮时搜索
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchText = searchInput.value.trim();
            
            // 获取当前激活的分类
            const activeTab = document.querySelector('.tab.active');
            const category = activeTab ? activeTab.getAttribute('data-tab') : 'all';
            
            loadFavoritePosts(category, searchText);
        });
    }
}

// 从收藏中移除帖子
function removeFromFavorites(postId) {
    // 获取当前收藏列表
    let favorites = JSON.parse(localStorage.getItem('favoritePosts') || '[]');
    
    // 查找并移除帖子ID
    const index = favorites.indexOf(postId);
    if (index !== -1) {
        favorites.splice(index, 1);
        
        // 保存更新后的收藏列表
        localStorage.setItem('favoritePosts', JSON.stringify(favorites));
        
        // 显示提示
        showToast('已从收藏中移除');
        
        // 重新加载收藏列表
        const activeTab = document.querySelector('.tab.active');
        const category = activeTab ? activeTab.getAttribute('data-tab') : 'all';
        const searchText = document.getElementById('searchFavorites').value.trim();
        
        loadFavoritePosts(category, searchText);
    }
}

// 获取内容摘要
function getExcerpt(content, maxLength = 100) {
    if (!content) return '暂无内容';
    
    // 移除HTML标签
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // 限制长度并添加省略号
    if (plainText.length > maxLength) {
        return plainText.substring(0, maxLength) + '...';
    }
    
    return plainText;
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知时间';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 计算时间差
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`;
    } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`;
    } else if (diff < 7 * day) {
        return `${Math.floor(diff / day)}天前`;
    } else {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
}

// 获取分类文本
function getCategoryText(category) {
    const categories = {
        'academic': '学术交流',
        'design': '设计讨论',
        'ai': 'AI技术',
        'media': '影视资源',
        'questions': '问答专区',
        'feedback': '反馈建议'
    };
    
    return categories[category] || '未分类';
}

// 显示提示信息
function showToast(message) {
    // 创建或获取toast元素
    let toast = document.getElementById('toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        document.body.appendChild(toast);
        
        // 添加样式
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '9999';
        toast.style.fontSize = '14px';
        toast.style.transition = 'opacity 0.3s';
    }
    
    // 设置消息内容
    toast.textContent = message;
    toast.style.opacity = '1';
    
    // 2秒后隐藏提示
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
        toast.style.opacity = '0';
    }, 2000);
}

// 初始化用户认证状态（如果js/user-auth.js中没有这个函数）
function initUserAuth() {
    // 检查是否已经登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || '游客';
    
    // 更新用户信息显示
    const headerUsername = document.getElementById('headerUsername');
    const headerAvatarImg = document.getElementById('headerAvatarImg');
    const guestActions = document.getElementById('guest-actions');
    const userActions = document.getElementById('user-actions');
    
    if (headerUsername) {
        headerUsername.textContent = username;
    }
    
    if (headerAvatarImg) {
        headerAvatarImg.src = localStorage.getItem('userAvatar') || './image/image--01.png';
    }
    
    if (userActions && guestActions) {
        if (isLoggedIn) {
            userActions.style.display = 'block';
            if (guestActions) guestActions.style.display = 'none';
        } else {
            if (userActions) userActions.style.display = 'none';
            if (guestActions) guestActions.style.display = 'block';
        }
    }
} 