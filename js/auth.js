// 兼容性重定向脚本
// 此文件用于保持与可能引用了auth.js的代码兼容

// 重定向到实际的认证功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已加载user-auth.js
    if (typeof initUserAuth !== 'function') {
        // 如果未加载user-auth.js，则动态加载
        const script = document.createElement('script');
        script.src = 'js/user-auth.js';
        script.async = true;
        document.head.appendChild(script);
        
        // 加载完成后初始化
        script.onload = function() {
            if (typeof initUserAuth === 'function') {
                initUserAuth();
            }
        };
    }
}); 