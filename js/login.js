import { auth } from './firebase-config.js';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const emailInput = document.getElementById('email');
    const codeInput = document.getElementById('code');
    
    let actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true
    };
    
    // 发送验证码
    sendCodeBtn.addEventListener('click', async function() {
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('请输入邮箱地址');
            return;
        }
        
        // 验证邮箱格式
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('请输入正确的邮箱地址');
            return;
        }
        
        try {
            // 禁用发送按钮
            this.disabled = true;
            this.textContent = '发送中...';
            
            // 发送验证码
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            
            // 保存邮箱到本地存储
            localStorage.setItem('emailForSignIn', email);
            
            alert('验证码已发送到您的邮箱，请查收！');
            
            // 60秒后重新启用发送按钮
            let countdown = 60;
            const timer = setInterval(() => {
                countdown--;
                this.textContent = `重新发送(${countdown})`;
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    this.disabled = false;
                    this.textContent = '发送验证码';
                }
            }, 1000);
            
        } catch (error) {
            console.error('发送验证码失败:', error);
            alert('发送验证码失败，请稍后重试');
            this.disabled = false;
            this.textContent = '发送验证码';
        }
    });
    
    // 处理登录
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const code = codeInput.value.trim();
        
        if (!email || !code) {
            alert('请填写完整信息');
            return;
        }
        
        try {
            // 验证登录链接
            const result = await signInWithEmailLink(auth, email, window.location.href);
            
            // 登录成功
            if (result.user) {
                // 保存用户信息到本地存储
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', email.split('@')[0]);
                localStorage.setItem('userEmail', email);
                
                // 设置默认头像
                if (!localStorage.getItem('userAvatar')) {
                    localStorage.setItem('userAvatar', './image/image--01.png');
                }
                
                alert('登录成功！');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败，请检查验证码是否正确');
        }
    });
    
    // 检查URL中是否包含验证码
    if (isSignInWithEmailLink(auth, window.location.href)) {
        const email = localStorage.getItem('emailForSignIn');
        if (email) {
            emailInput.value = email;
            codeInput.focus();
        }
    }
}); 