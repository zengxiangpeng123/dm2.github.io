// 用户退出登录处理脚本

/**
 * 处理用户退出登录
 * 1. 将当前用户数据保存到localStorage中的备份键值中
 * 2. 清除当前活跃用户数据
 * 3. 恢复游客浏览状态
 */
function handleLogout() {
    // 获取当前登录的用户名
    const username = localStorage.getItem('username');
    
    if (!username) {
        console.warn('没有检测到登录用户');
        return;
    }
    
    // 创建用户数据备份键名
    const userBackupKey = `user_backup_${username}`;
    
    // 收集所有需要备份的用户数据
    const userData = {
        username: username,
        userAvatar: localStorage.getItem('userAvatar'),
        userEmail: localStorage.getItem('userEmail'),
        userPhone: localStorage.getItem('userPhone'),
        userProfileData: localStorage.getItem('userProfileData'),
        securitySettings: localStorage.getItem('securitySettings'),
        notificationSettings: localStorage.getItem('notificationSettings'),
        privacySettings: localStorage.getItem('privacySettings'),
        userFavorites: localStorage.getItem('userFavorites'),
        customSites: localStorage.getItem('customSites'),
        recentVisits: localStorage.getItem('recentVisits')
    };
    
    // 保存用户数据备份
    localStorage.setItem(userBackupKey, JSON.stringify(userData));
    
    // 清除当前用户的活跃数据
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userProfileData');
    localStorage.removeItem('securitySettings');
    localStorage.removeItem('notificationSettings');
    localStorage.removeItem('privacySettings');
    localStorage.removeItem('userSessions');
    localStorage.removeItem('userFavorites');
    localStorage.removeItem('customSites');
    localStorage.removeItem('recentVisits');
    
    // 显示登出成功提示
    alert('您已成功退出登录');
    
    // 重定向到首页
    window.location.href = 'index.html';
}

/**
 * 恢复用户数据（在用户登录时调用）
 * @param {string} username 用户名
 */
function restoreUserData(username) {
    if (!username) {
        console.warn('没有提供有效的用户名');
        return false;
    }
    
    // 获取用户数据备份
    const userBackupKey = `user_backup_${username}`;
    const userDataJson = localStorage.getItem(userBackupKey);
    
    if (!userDataJson) {
        console.log('没有找到用户数据备份');
        return false;
    }
    
    try {
        // 解析用户数据
        const userData = JSON.parse(userDataJson);
        
        // 恢复用户数据
        if (userData.userAvatar) localStorage.setItem('userAvatar', userData.userAvatar);
        if (userData.userEmail) localStorage.setItem('userEmail', userData.userEmail);
        if (userData.userPhone) localStorage.setItem('userPhone', userData.userPhone);
        if (userData.userProfileData) localStorage.setItem('userProfileData', userData.userProfileData);
        if (userData.securitySettings) localStorage.setItem('securitySettings', userData.securitySettings);
        if (userData.notificationSettings) localStorage.setItem('notificationSettings', userData.notificationSettings);
        if (userData.privacySettings) localStorage.setItem('privacySettings', userData.privacySettings);
        if (userData.userFavorites) localStorage.setItem('userFavorites', userData.userFavorites);
        if (userData.customSites) localStorage.setItem('customSites', userData.customSites);
        if (userData.recentVisits) localStorage.setItem('recentVisits', userData.recentVisits);
        
        return true;
    } catch (error) {
        console.error('恢复用户数据时出错:', error);
        return false;
    }
}

// 为所有页面的退出登录按钮绑定事件
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}); 