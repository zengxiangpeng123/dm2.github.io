/**
 * 头像处理功能
 * 用于处理用户头像上传、预览和保存
 */

// 全局变量存储上传的头像
let selectedAvatar = '';
let isUploadedAvatarChoice = false;

document.addEventListener('DOMContentLoaded', function() {
    // 获取头像相关元素
    const userAvatar = document.getElementById('userAvatar');
    const avatarModal = document.getElementById('avatarModal');
    const closeModalBtn = document.getElementById('closeAvatarModal');
    const avatarTabs = document.querySelectorAll('.avatar-tab');
    const avatarTabPanels = document.querySelectorAll('.avatar-tab-panel');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const saveAvatarBtn = document.getElementById('saveAvatar');
    const uploadInput = document.getElementById('avatarUpload');
    const uploadPreview = document.getElementById('uploadPreview');
    
    console.log("Avatar handler script loaded");
    console.log("userAvatar element:", userAvatar);
    console.log("avatarModal element:", avatarModal);
    
    // 初始化：如果用户之前上传过头像，恢复预览
    if (localStorage.getItem('isUploadedAvatar') === 'true' && localStorage.getItem('userAvatar')) {
        if (uploadPreview) {
            uploadPreview.src = localStorage.getItem('userAvatar');
            selectedAvatar = localStorage.getItem('userAvatar');
            isUploadedAvatarChoice = true;
        }
    }
    
    // 点击头像打开模态框
    if (userAvatar) {
        userAvatar.addEventListener('click', function(e) {
            console.log("Avatar clicked");
            // 检查是否登录
            if (localStorage.getItem('isLoggedIn') !== 'true') {
                showToast('请先登录后再修改头像');
                return;
            }
            
            if (avatarModal) {
                console.log("Showing avatar modal");
                avatarModal.style.display = 'flex';
            }
        });
    }
    
    // 关闭模态框按钮
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            if (avatarModal) {
                avatarModal.style.display = 'none';
            }
        });
    }
    
    // 点击模态框外部关闭
    if (avatarModal) {
        window.addEventListener('click', function(e) {
            if (e.target === avatarModal) {
                avatarModal.style.display = 'none';
            }
        });
    }
    
    // 切换标签页
    if (avatarTabs.length > 0 && avatarTabPanels.length > 0) {
        avatarTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // 切换激活标签
                avatarTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 切换面板
                avatarTabPanels.forEach(panel => {
                    panel.classList.remove('active');
                });
                
                const targetPanel = document.getElementById(`${targetTab}-panel`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }
    
    // 预设头像选择
    if (avatarOptions.length > 0) {
        avatarOptions.forEach(option => {
            option.addEventListener('click', function() {
                // 移除其他选中状态
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                // 添加选中状态
                this.classList.add('selected');
            });
        });
    }
    
    // 头像上传预览
    if (uploadInput && uploadPreview) {
        uploadInput.addEventListener('change', function() {
            const file = this.files[0];
            
            if (file) {
                // 检查文件类型
                if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
                    showToast('请上传JPG或PNG格式的图片');
                    return;
                }
                
                // 检查文件大小（最大5MB）
                if (file.size > 5 * 1024 * 1024) {
                    showToast('图片大小不能超过5MB');
                    return;
                }
                
                // 读取文件并预览
                const reader = new FileReader();
                reader.onload = function(event) {
                    // 压缩图片
                    const img = new Image();
                    img.onload = function() {
                        // 创建画布进行压缩
                        const canvas = document.createElement('canvas');
                        // 限制尺寸为300x300像素，足够作为头像使用
                        const maxSize = 300;
                        let width = img.width;
                        let height = img.height;
                        
                        // 缩放逻辑
                        if (width > height) {
                            if (width > maxSize) {
                                height *= maxSize / width;
                                width = maxSize;
                            }
                        } else {
                            if (height > maxSize) {
                                width *= maxSize / height;
                                height = maxSize;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // 压缩为较低质量的JPEG
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        
                        // 更新预览和选择
                        uploadPreview.src = compressedDataUrl;
                        selectedAvatar = compressedDataUrl;
                        isUploadedAvatarChoice = true;
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 保存头像选择
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', function() {
            // 检查是哪个标签页激活
            const activeTab = document.querySelector('.avatar-tab.active');
            if (!activeTab) {
                showToast('请选择头像类型');
                return;
            }
            
            const activeTabValue = activeTab.getAttribute('data-tab');
            
            if (activeTabValue === 'preset') {
                // 获取选中的预设头像
                const selectedOption = document.querySelector('.avatar-option.selected');
                if (selectedOption) {
                    selectedAvatar = selectedOption.getAttribute('data-avatar');
                    isUploadedAvatarChoice = false;
                } else {
                    showToast('请选择一个头像');
                    return;
                }
            } else if (activeTabValue === 'upload') {
                // 验证是否已上传图片
                if (!selectedAvatar || !isUploadedAvatarChoice) {
                    showToast('请上传一张图片');
                    return;
                }
            }
            
            if (selectedAvatar) {
                // 保存头像选择到本地存储
                localStorage.setItem('userAvatar', selectedAvatar);
                localStorage.setItem('isUploadedAvatar', isUploadedAvatarChoice ? 'true' : 'false');
                
                // 更新页面上所有头像
                const headerAvatarImg = document.getElementById('headerAvatarImg');
                const avatarImg = document.getElementById('avatarImg');
                const profileAvatarImg = document.getElementById('profileAvatarImg');
                
                if (headerAvatarImg) headerAvatarImg.src = selectedAvatar;
                if (avatarImg) avatarImg.src = selectedAvatar;
                if (profileAvatarImg) profileAvatarImg.src = selectedAvatar;
                
                // 关闭模态框
                if (avatarModal) {
                    avatarModal.style.display = 'none';
                }
                
                showToast('头像已更新');
            }
        });
    }
});

// 显示提示消息
function showToast(message) {
    // 检查是否已有toast元素
    let toast = document.getElementById('toast-notification');
    
    if (!toast) {
        // 创建toast元素
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    
    // 设置消息并显示
    toast.textContent = message;
    toast.style.opacity = 1;
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.style.opacity = 0;
    }, 3000);
} 