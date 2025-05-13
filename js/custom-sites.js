/**
 * 自定义网站功能管理
 * 负责添加、显示和删除用户自定义网站
 */

// 默认图标，使用base64编码的内联数据
const DEFAULT_SITE_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7klEQVQ4jZ2TMUoDQRSGvzdZCGhhYRkQbAQbwTKVnQew8AiWaY9gYZsrWFoJVpZioUUaIZ1dOkHELBt3x2JndXfCMuL/weP93zczj/defHECVK3I0+TlUpPmQkRQVR4eH6aNC9XZWVCp3Bljfh3ddd0FCTp0ule5zABN0zuM+RCRz8zzvmZ7K4r7jbcN3w+25qMoFmAjSdLjnMSL88v7baJumy7J87wPPDnny+8OdJyZHQcUReGcc3sRSSYZTyYT5A9RXdft1XVNFEU4506bpjnY1mFZlp7v+5cwDDeA9y3T5pv/Dqyqz6p6/QWe8lLxLSCcSQAAAABJRU5ErkJggg==';

// 当页面加载完成时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化表单元素
    const addSiteForm = document.getElementById('addSiteForm');
    const siteNameType = document.getElementById('siteNameType');
    const presetSiteDiv = document.getElementById('presetSiteDiv');
    const customSiteDiv = document.getElementById('customSiteDiv');
    const siteNameSelect = document.getElementById('siteName');
    const customSiteName = document.getElementById('customSiteName');
    const siteUrlInput = document.getElementById('siteUrl');
    const siteIconUrlInput = document.getElementById('siteIconUrl');
    const modal = document.getElementById('customSiteModal');
    
    // 加载网站选项
    loadWebsiteOptions();
    
    // 处理添加方式切换
    siteNameType.addEventListener('change', function() {
        if (this.value === 'preset') {
            presetSiteDiv.style.display = 'block';
            customSiteDiv.style.display = 'none';
            siteNameSelect.required = true;
            customSiteName.required = false;
        } else {
            presetSiteDiv.style.display = 'none';
            customSiteDiv.style.display = 'block';
            siteNameSelect.required = false;
            customSiteName.required = true;
        }
    });
    
    // 处理表单提交
    addSiteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取网站名称（根据选择方式）
        const siteName = siteNameType.value === 'preset' ? 
            siteNameSelect.value : 
            customSiteName.value.trim();
        
        // 验证表单
        if (!siteName) {
            showToast('请输入网站名称');
            return;
        }
        
        if (!siteUrlInput.value) {
            showToast('请输入网站地址');
            return;
        }
        
        // 获取表单数据
        const newSite = {
            id: generateUniqueId(),
            name: siteName,
            url: siteUrlInput.value,
            icon: siteIconUrlInput.value || null
        };
        
        // 添加新网站
        addCustomSite(newSite);
    });
    
    // 当选择预设网站时自动填充URL
    siteNameSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.url) {
            siteUrlInput.value = selectedOption.dataset.url;
        }
    });
    
    // 获取元素
    const addCustomSiteBtn = document.getElementById('addCustomSite');
    const customSiteModal = document.getElementById('customSiteModal');
    const closeCustomModalBtn = document.getElementById('closeCustomModal');
    const saveCustomSiteBtn = document.getElementById('saveSiteBtn');
    const customSitesList = document.getElementById('customSitesList');
    
    // 加载自定义网站
    loadCustomSites();
    
    // 添加自定义网站按钮点击事件
    if (addCustomSiteBtn && customSiteModal) {
        addCustomSiteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 检查是否登录
            if (localStorage.getItem('isLoggedIn') !== 'true') {
                showToast('请先登录后再添加自定义网站');
                return;
            }
            
            // 清空表单
            document.getElementById('siteName').value = '';
            document.getElementById('siteUrl').value = '';
            document.getElementById('siteIconUrl').value = '';
            
            // 显示模态框
            customSiteModal.style.display = 'flex';
        });
    }
    
    // 关闭模态框按钮
    if (closeCustomModalBtn) {
        closeCustomModalBtn.addEventListener('click', function() {
            customSiteModal.style.display = 'none';
        });
    }
    
    // 点击模态框外部关闭
    if (customSiteModal) {
        window.addEventListener('click', function(e) {
            if (e.target === customSiteModal) {
                customSiteModal.style.display = 'none';
            }
        });
    }
    
    // 保存自定义网站按钮点击事件
    if (saveCustomSiteBtn) {
        saveCustomSiteBtn.addEventListener('click', function() {
            // 获取表单值
            let siteName = document.getElementById('siteName').value.trim();
            let siteUrl = document.getElementById('siteUrl').value.trim();
            let siteIconUrl = document.getElementById('siteIconUrl').value.trim();
            
            // 验证表单
            if (!siteName) {
                showToast('请选择网站名称');
                return;
            }
            
            if (!siteUrl) {
                showToast('网站地址不能为空');
                return;
            }
            
            // 如果URL不包含协议，添加http://
            if (!/^https?:\/\//i.test(siteUrl)) {
                siteUrl = 'http://' + siteUrl;
            }
            
            // 如果没有提供图标URL，生成一个默认图标
            if (!siteIconUrl) {
                // 提取网站域名作为默认图标
                try {
                    const url = new URL(siteUrl);
                    siteIconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
                } catch (e) {
                    // 如果URL无效，使用默认图标
                    siteIconUrl = 'https://www.google.com/s2/favicons?domain=' + siteUrl;
                }
            }
            
            // 获取现有的自定义网站
            let customSites = JSON.parse(localStorage.getItem('customSites') || '[]');
            
            // 检查是否已存在相同的网站
            const siteExists = customSites.some(site => 
                site.name === siteName || site.url === siteUrl
            );
            
            if (siteExists) {
                showToast('该网站已存在');
                return;
            }
            
            // 添加新网站
            customSites.push({
                id: Date.now().toString(),
                name: siteName,
                url: siteUrl,
                icon: siteIconUrl
            });
            
            // 保存到本地存储
            localStorage.setItem('customSites', JSON.stringify(customSites));
            
            // 重新加载自定义网站列表
            loadCustomSites();
            
            // 关闭模态框
            customSiteModal.style.display = 'none';
            
            // 显示提示
            showToast('已添加自定义网站');
        });
    }

    // 初始化图标上传相关元素
    const siteIconFile = document.getElementById('siteIconFile');
    const uploadIconBtn = document.getElementById('uploadIconBtn');
    const useDefaultIconBtn = document.getElementById('useDefaultIconBtn');
    const siteIconPreview = document.getElementById('siteIconPreview');
    const siteIconUrl = document.getElementById('siteIconUrl');
    
    // 上传图标按钮点击事件
    uploadIconBtn.addEventListener('click', function() {
        siteIconFile.click();
    });
    
    // 处理图片文件选择
    siteIconFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB限制
                showToast('图片大小不能超过5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                // 创建图片对象来获取尺寸
                const img = new Image();
                img.onload = function() {
                    // 如果图片太大，需要压缩
                    if (img.width > 256 || img.height > 256) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // 计算缩放比例
                        const scale = Math.min(256 / img.width, 256 / img.height);
                        
                        canvas.width = img.width * scale;
                        canvas.height = img.height * scale;
                        
                        // 绘制缩放后的图片
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // 转换为base64
                        const resizedImage = canvas.toDataURL('image/png');
                        siteIconPreview.src = resizedImage;
                        siteIconUrl.value = resizedImage;
                    } else {
                        siteIconPreview.src = e.target.result;
                        siteIconUrl.value = e.target.result;
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 使用默认图标按钮点击事件
    useDefaultIconBtn.addEventListener('click', function() {
        siteIconPreview.src = DEFAULT_SITE_ICON;
        siteIconUrl.value = '';
    });
    
    // 监听图标URL输入
    siteIconUrl.addEventListener('input', function() {
        if (this.value) {
            // 尝试加载URL图片
            const img = new Image();
            img.onload = function() {
                siteIconPreview.src = siteIconUrl.value;
            };
            img.onerror = function() {
                showToast('图标URL无效');
                siteIconPreview.src = DEFAULT_SITE_ICON;
            };
            img.src = this.value;
        } else {
            siteIconPreview.src = DEFAULT_SITE_ICON;
        }
    });
});

/**
 * 加载自定义网站列表
 */
function loadCustomSites() {
    const customSitesList = document.getElementById('customSitesList');
    if (!customSitesList) return;
    
    // 获取自定义网站
    const customSites = JSON.parse(localStorage.getItem('customSites') || '[]');
    
    // 清空现有内容
    customSitesList.innerHTML = '';
    
    // 如果没有自定义网站
    if (customSites.length === 0) {
        customSitesList.innerHTML = '<li class="custom-empty">暂无自定义网站，点击右上角"+"添加</li>';
        return;
    }
    
    // 添加自定义网站
    customSites.forEach(site => {
        const li = document.createElement('li');
        
        // 创建链接元素
        const a = document.createElement('a');
        a.href = site.url;
        a.target = "_blank";
        
        // 创建图标元素
        const img = document.createElement('img');
        // 先设置为默认图标，以防原图标加载失败时闪烁
        img.src = DEFAULT_SITE_ICON;
        img.alt = site.name;
        
        // 如果有图标，尝试加载原图标
        if (site.icon) {
            const tempImg = new Image();
            tempImg.onload = function() {
                img.src = site.icon;
            };
            tempImg.onerror = function() {
                // 保持默认图标
                img.src = DEFAULT_SITE_ICON;
            };
            tempImg.src = site.icon;
        }
        
        // 创建名称文本节点
        const nameText = document.createTextNode(' ' + site.name);
        
        // 将图标和名称添加到链接中
        a.appendChild(img);
        a.appendChild(nameText);
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('data-id', site.id);
        
        // 添加删除图标
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'bi bi-x-circle';
        deleteBtn.appendChild(deleteIcon);
        
        // 添加删除事件
        deleteBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            deleteCustomSite(site.id);
        };
        
        // 将链接和删除按钮添加到列表项
        li.appendChild(a);
        li.appendChild(deleteBtn);
        
        // 将列表项添加到列表中
        customSitesList.appendChild(li);
    });
}

/**
 * 删除自定义网站
 * @param {string} siteId - 要删除的网站ID
 */
function deleteCustomSite(siteId) {
    // 获取现有的自定义网站
    let customSites = JSON.parse(localStorage.getItem('customSites') || '[]');
    
    // 过滤掉要删除的网站
    customSites = customSites.filter(site => site.id !== siteId);
    
    // 保存到本地存储
    localStorage.setItem('customSites', JSON.stringify(customSites));
    
    // 重新加载自定义网站列表
    loadCustomSites();
    
    // 显示提示
    showToast('已删除自定义网站');
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 加载网站选项
async function loadWebsiteOptions() {
    try {
        const response = await fetch('teams.json');
        if (!response.ok) throw new Error('Failed to load teams data');
        
        const data = await response.json();
        const siteNameSelect = document.getElementById('siteName');
        
        // 清空现有选项
        siteNameSelect.innerHTML = '<option value="">--请选择网站--</option>';
        
        // 添加从teams.json加载的选项
        data.forEach(site => {
            const option = document.createElement('option');
            option.value = site.name;
            option.textContent = site.name;
            option.dataset.url = site.url;
            siteNameSelect.appendChild(option);
        });
    } catch (error) {
        console.error('加载网站数据失败:', error);
        showToast('加载网站数据失败');
    }
}

// 添加自定义网站
function addCustomSite(newSite) {
    // 获取现有的自定义网站
    let customSites = JSON.parse(localStorage.getItem('customSites') || '[]');
    
    // 检查是否已存在相同的网站
    if (customSites.some(site => site.url === newSite.url)) {
        showToast('该网站已经在您的列表中');
        return;
    }
    
    // 如果URL不包含协议，添加http://
    if (!/^https?:\/\//i.test(newSite.url)) {
        newSite.url = 'http://' + newSite.url;
    }
    
    // 处理图标
    if (!newSite.icon) {
        // 如果没有上传图标也没有提供URL，使用网站favicon
        try {
            const url = new URL(newSite.url);
            newSite.icon = `${url.protocol}//${url.hostname}/favicon.ico`;
        } catch (e) {
            newSite.icon = DEFAULT_SITE_ICON;
        }
    }
    
    // 如果图标是base64格式，检查大小
    if (newSite.icon.startsWith('data:image')) {
        // 检查base64字符串长度（约1.37倍于实际文件大小）
        const base64Length = newSite.icon.length - newSite.icon.indexOf(',') - 1;
        const fileSize = base64Length * 0.75;
        
        if (fileSize > 5 * 1024 * 1024) { // 5MB限制
            showToast('图标文件太大，请选择更小的图片');
            return;
        }
    }
    
    // 添加新网站
    customSites.push(newSite);
    
    // 保存到localStorage
    localStorage.setItem('customSites', JSON.stringify(customSites));
    
    // 重新加载网站列表
    loadMySites();
    
    // 关闭模态框
    document.getElementById('customSiteModal').style.display = 'none';
    
    // 重置表单
    document.getElementById('addSiteForm').reset();
    document.getElementById('presetSiteDiv').style.display = 'block';
    document.getElementById('customSiteDiv').style.display = 'none';
    
    // 显示成功提示
    showToast('网站添加成功');
}

// 显示提示消息
function showToast(message) {
    // 检查是否已存在toast元素
    let toast = document.getElementById('custom-toast');
    
    // 如果不存在，创建一个
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '10000';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
    }
    
    // 设置消息
    toast.textContent = message;
    toast.style.opacity = '1';
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
} 