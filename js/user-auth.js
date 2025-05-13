// 用户登录状态管理脚本

// 初始化登录状态
function initUserAuth() {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    const userAvatar = localStorage.getItem('userAvatar');
    
    // 获取访客操作和用户操作元素
    const guestActions = document.getElementById('guest-actions');
    const userActions = document.getElementById('user-actions');
    
    // 获取用户信息显示元素
    const headerUsername = document.getElementById('headerUsername');
    const headerAvatarImg = document.getElementById('headerAvatarImg');
    const welcomeText = document.getElementById('welcomeText');
    const loginStatus = document.getElementById('loginStatus');
    const avatarImg = document.getElementById('avatarImg');
    
    // 根据登录状态显示相应的操作
    if (isLoggedIn) {
        // 显示用户信息，隐藏访客信息
        if (guestActions) guestActions.style.display = 'none';
        if (userActions) userActions.style.display = 'block';
        
        // 更新用户名和头像
        if (headerUsername && username) {
            headerUsername.textContent = username;
        }
        
        if (headerAvatarImg && userAvatar) {
            headerAvatarImg.src = userAvatar;
        }
        
        if (avatarImg && userAvatar) {
            avatarImg.src = userAvatar;
        }
        
        // 更新欢迎信息
        if (welcomeText && username) {
            welcomeText.textContent = `欢迎回来，${username}！`;
        }
        
        if (loginStatus) {
            loginStatus.innerHTML = '<a href="user-profile.html" style="color: inherit; text-decoration: underline;">个人资料修改</a>';
        }
    } else {
        // 显示访客信息，隐藏用户信息
        if (guestActions) guestActions.style.display = 'flex';
        if (userActions) userActions.style.display = 'none';
        
        // 重置欢迎信息
        if (welcomeText) {
            welcomeText.textContent = '欢迎访问！';
        }
        
        if (loginStatus) {
            loginStatus.innerHTML = '<a href="login.html" style="color: inherit; text-decoration: underline;">点击登录</a> 或 <a href="register.html" style="color: inherit; text-decoration: underline;">注册账号</a>';
        }
    }
    
    // 处理登出按钮
    setupLogoutButton();
}

// 设置登出按钮
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 清除登录信息
            localStorage.setItem('isLoggedIn', 'false');
            
            // 显示登出提示
            alert('已成功退出登录');
            
            // 刷新页面
            window.location.reload();
        });
    }
}

// 模拟登录功能（用于测试）
function simulateLogin(username, avatar) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username || '测试用户');
    
    if (avatar) {
        localStorage.setItem('userAvatar', avatar);
    } else if (!localStorage.getItem('userAvatar')) {
        localStorage.setItem('userAvatar', './image/image--01.png');
    }
    
    // 初始化账号设置相关数据（如果不存在）
    if (!localStorage.getItem('securitySettings')) {
        initUserSettings(username);
    }
    
    // 刷新页面以显示登录状态
    window.location.reload();
}

// 初始化用户设置数据
function initUserSettings(username) {
    // 初始化安全设置
    const securitySettings = {
        email: 'user@example.com',
        phone: '13812345678',
        securityQuestion: '1', // 默认选择第一个安全问题
        securityAnswer: ''
    };
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    localStorage.setItem('userEmail', 'user@example.com');
    localStorage.setItem('userPhone', '13812345678');
    
    // 初始化通知设置
    const notificationSettings = {
        emailNotifications: true,
        contentUpdates: true,
        securityAlerts: true,
        announcements: true,
        inAppMessages: false
    };
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    
    // 初始化隐私设置
    const privacySettings = {
        publicProfile: true,
        publicFavorites: true,
        browsingHistory: true,
        dataAnalytics: true,
        personalization: true
    };
    localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
    
    // 初始化个人资料数据
    const profileData = {
        username: username || '测试用户',
        email: 'user@example.com',
        phone: '13812345678',
        gender: '',
        birth: '',
        profession: '',
        interests: '',
        bio: ''
    };
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
    
    // 初始化会话数据
    const currentTime = new Date();
    const sessions = [
        {
            deviceIcon: 'laptop',
            deviceName: 'Windows PC - Chrome浏览器',
            ipAddress: 'IP: 116.23.28.xx - 广东省广州市',
            status: '当前在线',
            loginDate: `登录于 ${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}`
        }
    ];
    localStorage.setItem('userSessions', JSON.stringify(sessions));
    
    // 初始化收藏夹
    if (!localStorage.getItem('userFavorites')) {
        localStorage.setItem('userFavorites', JSON.stringify([]));
    }
}

// 创建测试登录按钮（仅用于开发测试）
function createTestLoginButton() {
    // 检查是否在开发环境
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return; // 非开发环境不创建测试按钮
    }
    
    const testBtn = document.createElement('button');
    testBtn.textContent = '测试登录';
    testBtn.style.position = 'fixed';
    testBtn.style.bottom = '10px';
    testBtn.style.right = '10px';
    testBtn.style.zIndex = '9999';
    testBtn.style.padding = '5px 10px';
    testBtn.style.backgroundColor = '#007bff';
    testBtn.style.color = 'white';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '4px';
    testBtn.style.cursor = 'pointer';
    
    testBtn.addEventListener('click', function() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
            // 已登录，则登出
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('username');
            alert('已退出登录！');
        } else {
            // 未登录，则登录
            simulateLogin('测试用户', './image/image--01.png');
            alert('已登录为测试用户！');
        }
        
        window.location.reload();
    });
    
    document.body.appendChild(testBtn);
}

// 同步用户数据
function syncUserData() {
    // 检查并同步个人资料与安全设置之间的数据
    // 这个函数在不同页面间切换时可以调用，以确保数据一致性
    
    const profileData = JSON.parse(localStorage.getItem('userProfileData')) || {};
    const securitySettings = JSON.parse(localStorage.getItem('securitySettings')) || {};
    
    // 如果个人资料中有邮箱或手机号，但安全设置中没有，就更新安全设置
    if (profileData.email && !securitySettings.email) {
        securitySettings.email = profileData.email;
        localStorage.setItem('userEmail', profileData.email);
    }
    
    if (profileData.phone && !securitySettings.phone) {
        securitySettings.phone = profileData.phone;
        localStorage.setItem('userPhone', profileData.phone);
    }
    
    // 如果安全设置中有邮箱或手机号，但个人资料中没有，就更新个人资料
    if (securitySettings.email && !profileData.email) {
        profileData.email = securitySettings.email;
    }
    
    if (securitySettings.phone && !profileData.phone) {
        profileData.phone = securitySettings.phone;
    }
    
    // 保存更新后的数据
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
}

// 在页面加载时初始化用户认证
document.addEventListener('DOMContentLoaded', function() {
    initUserAuth();
    
    // 同步用户数据，确保不同页面间的数据一致性
    if (localStorage.getItem('isLoggedIn') === 'true') {
        syncUserData();
    }
    
    // 添加测试按钮（仅在开发环境）
    createTestLoginButton();
}); 