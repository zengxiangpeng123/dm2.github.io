// 论坛页面功能交互脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户登录状态
    initUserAuth();
    
    // 初始化管理员账号
    initAdminAccount();
    
    // 添加CSS样式
    addStyles();
    
    // 在页面加载时检查URL参数，查看是否有搜索请求
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    // 初始化论坛分类切换
    initForumCategories();
    
    // 初始化轮播图
    initTopicsSlider();
    
    // 初始化排序和视图切换
    initSortAndView();
    
    // 初始化发帖功能
    initPostModal();
    
    // 初始化折叠/展开功能
    initToggleSections();
    
    // 初始化用户下拉菜单
    initUserDropdown();
    
    // 初始化头像点击功能
    initAvatarClick();
    
    // 初始化头像选择模态框
    initAvatarModal();
    
    // 初始化论坛搜索功能
    initForumSearch();
    
    // 加载保存的帖子
    loadSavedPosts();
    
    // 添加论坛分类菜单初始化
    initForumCategoriesMenu();
    
    // 如果有搜索参数，则执行搜索
    if (searchQuery) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchQuery;
            // 在页面加载完后略微延迟执行搜索，确保所有元素都已加载
            setTimeout(() => {
                performForumSearch();
            }, 500);
        }
    }
});

// 初始化论坛分类
function initForumCategories() {
    const categoryList = document.querySelector('.category-list');
    const toggleButton = document.querySelector('.toggle-categories');
    const forumHeader = document.querySelector('.forum-header h2');
    
    // 添加分类收纳功能
    toggleButton.addEventListener('click', () => {
        categoryList.classList.toggle('collapsed');
        toggleButton.classList.toggle('collapsed');
    });

    // 为每个分类添加点击事件
    document.querySelectorAll('.forum-category').forEach(category => {
        category.addEventListener('click', function() {
            // 移除其他分类的active类
            document.querySelectorAll('.forum-category').forEach(c => {
                c.classList.remove('active');
            });
            
            // 添加当前分类的active类
            this.classList.add('active');
            
            // 获取当前分类
            const categoryType = this.getAttribute('data-category');
            
            // 更新论坛标题
            if (forumHeader) {
                switch(categoryType) {
                    case 'all':
                        forumHeader.textContent = '全部帖子';
                        break;
                    case 'academic':
                        forumHeader.textContent = '学术交流';
                        break;
                    case 'design':
                        forumHeader.textContent = '设计讨论';
                        break;
                    case 'ai':
                        forumHeader.textContent = 'AI技术';
                        break;
                    case 'media':
                        forumHeader.textContent = '影视资源';
                        break;
                    case 'questions':
                        forumHeader.textContent = '问答专区';
                        break;
                    case 'feedback':
                        forumHeader.textContent = '反馈建议';
                        break;
                    default:
                        forumHeader.textContent = '全部帖子';
                }
            }
            
            // 获取并显示对应分类的帖子
            fetchPostsByCategory(categoryType);
        });
    });
}

// 根据分类获取帖子
function fetchPostsByCategory(category) {
    // 显示加载动画
    simulateLoading();
    
    // 获取保存的帖子
    const savedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    
    // 根据分类筛选帖子
    const filteredPosts = category === 'all' 
        ? savedPosts 
        : savedPosts.filter(post => post.category === category);
    
    // 获取当前排序方式
    const sortSelect = document.getElementById('sortSelect');
    const sortType = sortSelect ? sortSelect.value : 'latest';
    
    // 获取排序方向
    const sortDirectionBtn = document.querySelector('.sort-direction-btn');
    const sortDirection = sortDirectionBtn ? sortDirectionBtn.getAttribute('data-direction') : 'desc';
    const isDescending = sortDirection === 'desc';
    
    // 根据排序方式排序帖子
    let sortedPosts = [...filteredPosts];
    switch(sortType) {
        case 'latest':
            // 按照发布日期排序
            sortedPosts.sort((a, b) => {
                const comparison = new Date(b.date) - new Date(a.date);
                return isDescending ? comparison : -comparison;
            });
            break;
        case 'popular':
            // 热门讨论：按照点赞数和回复数的综合热度排序
            sortedPosts.sort((a, b) => {
                const popularityA = (a.likes || 0) * 2 + (a.replies || 0) * 3; // 点赞权重2，回复权重3
                const popularityB = (b.likes || 0) * 2 + (b.replies || 0) * 3;
                const comparison = popularityB - popularityA;
                return isDescending ? comparison : -comparison;
            });
            break;
        case 'replies':
            // 按照回复数排序
            sortedPosts.sort((a, b) => {
                const comparison = (b.replies || 0) - (a.replies || 0);
                return isDescending ? comparison : -comparison;
            });
            break;
        case 'views':
            // 按照浏览量排序
            sortedPosts.sort((a, b) => {
                const comparison = (b.views || 0) - (a.views || 0);
                return isDescending ? comparison : -comparison;
            });
            break;
    }
    
    // 清空当前帖子列表
    const postList = document.querySelector('.post-list');
    if (postList) {
        postList.innerHTML = '';
        
        if (sortedPosts.length === 0) {
            // 如果没有帖子，显示提示信息
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-posts-message';
            emptyMessage.innerHTML = `
                <i class="bi bi-inbox"></i>
                <p>当前分类暂无帖子</p>
            `;
            postList.appendChild(emptyMessage);
        } else {
            // 显示排序后的帖子
            sortedPosts.forEach(post => {
                addPostToPage(post);
            });
        }
    }
    
    // 更新帖子计数
    updatePostCount(sortedPosts.length);
}

// 初始化热门主题
function initTopicsSlider() {
    // 创建热门帖子数据
    const hotTopics = [
        {
            id: 'hot1',
            title: '2024年值得关注的10部纪录片',
            author: '影视爱好者',
            avatar: './image/image--01.png',
            date: '4天前',
            replies: 32,
            excerpt: '推荐10部2024年新出的高分纪录片，涵盖自然、科技、人文等多个领域，附带资源获取方式...',
            tags: ['纪录片', '影视推荐'],
            category: 'media',
            content: '近期上映的纪录片中，有不少值得关注的作品。本文为大家精选了10部2024年新出的高分纪录片，涵盖了自然、科技、人文等多个领域。每部作品都配有详细介绍和资源获取方式，希望能帮助对纪录片感兴趣的朋友。'
        },
        {
            id: 'hot2',
            title: 'AI绘画最新技术发展与应用',
            author: 'AI研究员',
            avatar: './image/image--02.png',
            date: '2天前',
            replies: 45,
            excerpt: '详细介绍了AI绘画领域的最新技术突破，包括新的模型架构、训练方法和实际应用案例...',
            tags: ['AI绘画', '技术分享'],
            category: 'ai',
            content: 'AI绘画技术在近期有了重大突破，本文详细介绍了最新的技术发展，包括改进的模型架构、创新的训练方法，以及在各个领域的实际应用案例。同时也分享了一些实用的AI绘画工具和使用技巧。'
        },
        {
            id: 'hot3',
            title: '如何提高学术论文的写作效率',
            author: '学术达人',
            avatar: './image/image--03.png',
            date: '3天前',
            replies: 28,
            excerpt: '分享了一套完整的学术论文写作方法，包括文献管理、写作规范、常用工具推荐等...',
            tags: ['学术写作', '经验分享'],
            category: 'academic',
            content: '本文系统地介绍了提高学术论文写作效率的方法，包括文献收集与管理、写作规范、常用工具推荐等。特别强调了如何合理规划时间、如何进行文献综述、如何组织论文结构等关键问题。'
        }
    ];

    // 保存热门帖子到本地存储
    saveHotTopics(hotTopics);

    const slides = document.querySelectorAll('.topic-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (!slides.length || !dots.length) return;
    
    let currentSlide = 0;
    
    // 显示初始幻灯片
    showSlide(currentSlide);
    
    // 为每个幻灯片添加点击事件
    slides.forEach((slide, index) => {
        slide.addEventListener('click', function() {
            const topic = hotTopics[index];
            if (topic) {
                // 保存帖子到本地存储
                savePost({
                    id: topic.id,
                    title: topic.title,
                    author: topic.author,
                    authorAvatar: topic.avatar,
                    category: topic.category,
                    content: topic.content,
                    date: new Date().toISOString(),
                    views: 0,
                    replies: topic.replies,
                    likes: 0,
                    tags: topic.tags
                });
                
                // 跳转到帖子详情页
                window.location.href = `post-detail.html?id=${topic.id}`;
            }
        });
    });
    
    // 上一个按钮点击
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止触发幻灯片的点击事件
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
    }
    
    // 下一个按钮点击
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止触发幻灯片的点击事件
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
    }
    
    // 点击指示点
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止触发幻灯片的点击事件
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // 自动轮播
    let slideInterval = setInterval(autoSlide, 5000);
    
    // 鼠标悬停时暂停轮播
    const sliderContainer = document.querySelector('.topics-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', function() {
            slideInterval = setInterval(autoSlide, 5000);
        });
    }
    
    // 显示指定幻灯片
    function showSlide(index) {
        slides.forEach((slide, i) => {
            const topic = hotTopics[i];
            if (topic) {
                slide.innerHTML = `
                    <div class="topic-card">
                        <div class="topic-header">
                            <img src="${topic.avatar}" alt="${topic.author}的头像" class="topic-avatar">
                            <div class="topic-info">
                                <h3>${topic.title}</h3>
                                <p>发布者: ${topic.author} • ${topic.date} • ${topic.replies}回复</p>
                            </div>
                        </div>
                        <p class="topic-excerpt">${topic.excerpt}</p>
                        <div class="topic-tags">
                            ${topic.tags.map(tag => `<span class="topic-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                `;
            }
            
            if (i === index) {
                slide.style.display = 'block';
            } else {
                slide.style.display = 'none';
            }
        });
        
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // 自动滚动到下一张
    function autoSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
}

// 保存热门帖子
function saveHotTopics(topics) {
    topics.forEach(topic => {
        const existingPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
        const existingPost = existingPosts.find(p => p.id === topic.id);
        
        if (!existingPost) {
            const newPost = {
                id: topic.id,
                title: topic.title,
                author: topic.author,
                authorAvatar: topic.avatar,
                category: topic.category,
                content: topic.content,
                date: new Date().toISOString(),
                views: 0,
                replies: topic.replies,
                likes: 0,
                tags: topic.tags
            };
            
            existingPosts.push(newPost);
            localStorage.setItem('forumPosts', JSON.stringify(existingPosts));
        }
    });
}

// 初始化排序和视图切换
function initSortAndView() {
    const sortSelect = document.getElementById('sortSelect');
    const viewButtons = document.querySelectorAll('.view-btn');
    const postList = document.querySelector('.post-list');
    
    // 创建并添加升序/降序切换按钮
    const sortDirectionBtn = document.createElement('button');
    sortDirectionBtn.className = 'sort-direction-btn';
    sortDirectionBtn.innerHTML = '<i class="bi bi-sort-down-alt"></i>';
    sortDirectionBtn.title = '切换排序方向';
    sortDirectionBtn.setAttribute('data-direction', 'desc'); // 默认降序
    
    // 添加样式
    sortDirectionBtn.style.marginLeft = '8px';
    sortDirectionBtn.style.padding = '4px 8px';
    sortDirectionBtn.style.backgroundColor = '#f0f0f0';
    sortDirectionBtn.style.border = '1px solid #ddd';
    sortDirectionBtn.style.borderRadius = '4px';
    sortDirectionBtn.style.cursor = 'pointer';
    sortDirectionBtn.style.display = 'inline-flex';
    sortDirectionBtn.style.alignItems = 'center';
    sortDirectionBtn.style.justifyContent = 'center';
    sortDirectionBtn.style.transition = 'all 0.2s';
    
    // 鼠标悬停样式
    sortDirectionBtn.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#e0e0e0';
    });
    
    sortDirectionBtn.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#f0f0f0';
    });
    
    // 如果存在sortSelect，在其后插入排序方向按钮
    if (sortSelect && sortSelect.parentNode) {
        sortSelect.parentNode.insertBefore(sortDirectionBtn, sortSelect.nextSibling);
    }
    
    // 排序方向切换
    sortDirectionBtn.addEventListener('click', function() {
        const currentDirection = this.getAttribute('data-direction');
        const newDirection = currentDirection === 'desc' ? 'asc' : 'desc';
        
        // 更新按钮状态
        this.setAttribute('data-direction', newDirection);
        
        // 更新图标
        if (newDirection === 'asc') {
            this.innerHTML = '<i class="bi bi-sort-up-alt"></i>';
            this.title = '当前：升序排列';
        } else {
            this.innerHTML = '<i class="bi bi-sort-down-alt"></i>';
            this.title = '当前：降序排列';
        }
        
        // 重新获取帖子
        const activeCategory = document.querySelector('.forum-category.active');
        const categoryType = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
        fetchPostsByCategory(categoryType);
    });
    
    // 排序变更
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            
            // 获取当前选中的分类
            const activeCategory = document.querySelector('.forum-category.active');
            const categoryType = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
            
            // 根据当前分类和新的排序选项重新获取帖子
            fetchPostsByCategory(categoryType);
            
            // fetchPostsByCategory函数内部已经包含了模拟加载效果，这里不需要重复调用
            // simulateLoading();
        });
    }
    
    // 视图切换
    if (viewButtons.length && postList) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除所有按钮的活跃状态
                viewButtons.forEach(b => b.classList.remove('active'));
                
                // 添加当前按钮的活跃状态
                this.classList.add('active');
                
                // 获取视图类型
                const viewType = this.getAttribute('data-view');
                
                // 根据视图类型设置帖子列表样式
                if (viewType === 'grid') {
                    postList.classList.add('grid-view');
                } else {
                    postList.classList.remove('grid-view');
                }
            });
        });
    }
}

// 初始化发帖模态框
function initPostModal() {
    const newPostBtn = document.getElementById('newPostBtn');
    const postModal = document.getElementById('postModal');
    const closePostModal = document.getElementById('closePostModal');
    const cancelPostBtn = document.getElementById('cancelPostBtn');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const postForm = document.querySelector('.post-form');
    
    if (!newPostBtn || !postModal) return;
    
    // 打开模态框
    newPostBtn.addEventListener('click', function() {
        // 检查用户是否登录
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            // 未登录时提示用户登录
            alert('请先登录后再发布内容');
            // 可以跳转到登录页面
            window.location.href = 'login.html';
            return;
        }
        
        // 显示模态框
        postModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    
    // 关闭模态框的几种方式
    if (closePostModal) {
        closePostModal.addEventListener('click', closeModal);
    }
    
    if (cancelPostBtn) {
        cancelPostBtn.addEventListener('click', closeModal);
    }
    
    // 点击模态框外部关闭
    postModal.addEventListener('click', function(e) {
        if (e.target === postModal) {
            closeModal();
        }
    });
    
    // 提交表单
    if (submitPostBtn && postForm) {
        submitPostBtn.addEventListener('click', function() {
            // 获取表单数据
            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            const tags = document.getElementById('postTags').value.trim();
            const content = document.getElementById('postContent').value.trim();
            const notifyOnReply = document.getElementById('postNotify').checked;
            
            // 验证表单
            if (!validatePostForm(title, category, content)) {
                return;
            }
            
            // 获取用户信息
            const username = localStorage.getItem('username') || '匿名用户';
            const userAvatar = localStorage.getItem('userAvatar') || './image/image--01.png';
            
            // 创建新帖子对象
            const newPost = {
                id: generatePostId(),
                title: title,
                category: category,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                content: content,
                author: username,
                authorAvatar: userAvatar,
                date: new Date().toISOString(),
                views: 0,
                replies: 0,
                likes: 0,
                notifyOnReply: notifyOnReply,
                isPinned: false,
                isHot: false
            };
            
            // 保存到本地存储
            // savePost函数现在会处理添加到DOM和分页更新
            savePost(newPost);
            
            // 显示成功消息
            showToast('帖子发布成功！');
            
            // 关闭模态框
            closeModal();
            
            // 重置表单
            postForm.reset();
        });
    }
    
    // 富文本编辑器工具栏
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const postContentField = document.getElementById('postContent');
    
    if (toolbarButtons.length && postContentField) {
        toolbarButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const icon = this.querySelector('i').className;
                
                // 根据按钮类型插入不同的标记
                let markStart = '';
                let markEnd = '';
                
                if (icon.includes('type-bold')) {
                    markStart = '**';
                    markEnd = '**';
                } else if (icon.includes('type-italic')) {
                    markStart = '*';
                    markEnd = '*';
                } else if (icon.includes('link-45deg')) {
                    const url = prompt('请输入链接地址:', 'http://');
                    if (url) {
                        markStart = '[链接文字](';
                        markEnd = ')';
                    }
                } else if (icon.includes('image')) {
                    const url = prompt('请输入图片地址:', 'http://');
                    if (url) {
                        markStart = '![图片描述](';
                        markEnd = ')';
                    }
                } else if (icon.includes('code')) {
                    markStart = '```\n';
                    markEnd = '\n```';
                } else if (icon.includes('list-ul')) {
                    markStart = '- ';
                    markEnd = '\n- \n- ';
                } else if (icon.includes('list-ol')) {
                    markStart = '1. ';
                    markEnd = '\n2. \n3. ';
                }
                
                // 插入标记
                insertAtCursor(postContentField, markStart, markEnd);
            });
        });
    }
    
    // 在光标位置插入文本
    function insertAtCursor(field, startText, endText) {
        // 获取光标位置
        const startPos = field.selectionStart;
        const endPos = field.selectionEnd;
        
        // 获取选中的文本
        const selectedText = field.value.substring(startPos, endPos);
        
        // 构建新文本
        const newText = field.value.substring(0, startPos) + 
                        startText + 
                        selectedText + 
                        endText + 
                        field.value.substring(endPos);
        
        // 更新文本域内容
        field.value = newText;
        
        // 设置光标位置
        const newCursorPos = startPos + startText.length + selectedText.length + endText.length;
        field.focus();
        field.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    // 关闭模态框
    function closeModal() {
        postModal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    }
    
    // 验证表单
    function validatePostForm(title, category, content) {
        if (title.length < 5) {
            alert('标题至少需要5个字符');
            return false;
        }
        
        if (!category) {
            alert('请选择帖子分类');
            return false;
        }
        
        if (content.length < 20) {
            alert('内容至少需要20个字符');
            return false;
        }
        
        return true;
    }
}

// 生成帖子ID
function generatePostId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 保存帖子到本地存储
function savePost(post) {
    // 从localStorage获取现有帖子
    let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    
    // 添加新帖子到帖子数组开头（最新的帖子显示在前面）
    posts.unshift(post);
    
    // 更新localStorage
    localStorage.setItem('forumPosts', JSON.stringify(posts));
    
    // 更新帖子总数
    updatePostCount(posts.length);
    
    // 添加到页面 DOM
    const postList = document.querySelector('.post-list');
    if (postList) {
        // 创建新帖子的DOM元素并添加到列表开头
        const postElement = createPostElement(post);
        
        // 添加forum-post类，用于分页功能
        postElement.classList.add('forum-post');
        
        // 将新帖子添加到列表开头
        if (postList.firstChild) {
            postList.insertBefore(postElement, postList.firstChild);
        } else {
            postList.appendChild(postElement);
        }
        
        // 初始化点赞和收藏功能
        initPostActions(postElement, post);
        
        // 确保新添加的帖子在前端可见 - 强制滚动到页面顶部
        window.scrollTo(0, 0);
        
        // 更新分页
        try {
            // 尝试重新初始化分页
            if (typeof reinitializePagination === 'function') {
                reinitializePagination();
            } else {
                // 如果分页函数不存在，可能是旧版本，尝试刷新页面
                window.location.reload();
            }
        } catch (error) {
            console.error("分页更新错误:", error);
            // 发生错误时刷新页面以确保新帖子可见
            window.location.reload();
        }
    }
    
    return true; // 返回成功标志
}

// 更新帖子总数显示
function updatePostCount(count) {
    const postCountElement = document.querySelector('.stats-list li:nth-child(2) span');
    if (postCountElement) {
        postCountElement.textContent = count.toLocaleString();
    }
}

// 创建帖子元素但不添加到DOM (辅助函数)
function createPostElement(post) {
    // 创建帖子HTML
    const postElement = document.createElement('div');
    postElement.className = `post-item${post.isPinned ? ' pinned' : ''}`;
    postElement.setAttribute('data-post-id', post.id);
    // 添加分类属性，用于分类筛选
    postElement.setAttribute('data-category', post.category);
    
    // 计算发布时间
    const postDate = new Date(post.date);
    const formattedDate = `${postDate.getFullYear()}-${(postDate.getMonth() + 1).toString().padStart(2, '0')}-${postDate.getDate().toString().padStart(2, '0')}`;
    
    // 类别映射到中文
    const categoryMap = {
        'academic': '学术交流',
        'design': '设计讨论',
        'ai': 'AI技术',
        'media': '影视资源',
        'questions': '问答专区',
        'feedback': '反馈建议',
        'announcement': '公告'
    };
    
    const categoryText = categoryMap[post.category] || post.category;
    
    // 获取点赞状态
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const isLiked = likedPosts.includes(post.id);
    
    // 获取收藏状态
    const favoritePosts = JSON.parse(localStorage.getItem('favoritePosts') || '[]');
    const isFavorited = favoritePosts.includes(post.id);
    
    // 判断是否显示删除按钮
    const currentUser = localStorage.getItem('username');
    const isCurrentUserAdmin = isAdmin();
    const isAuthor = currentUser === post.author;
    const showDeleteButton = isCurrentUserAdmin || isAuthor;
    
    // 删除按钮HTML
    const deleteButtonHTML = showDeleteButton ? `
        <button class="delete-btn" data-post-id="${post.id}" title="${isCurrentUserAdmin ? '管理员删除' : '删除自己的帖子'}">
            <i class="bi bi-trash"></i>
        </button>
    ` : '';
    
    // 设置帖子内容
    if (post.isAnnouncement) {
        // 公告样式
        postElement.innerHTML = `
            ${post.isPinned ? '<div class="post-badge">置顶</div>' : ''}
            ${post.isAnnouncement ? '<div class="post-badge announcement">公告</div>' : ''}
            <div class="post-content announcement-content">
                <h3 class="post-title"><a href="post-detail.html?id=${post.id}">${post.title}</a></h3>
                <div class="post-meta">
                    <span class="post-date">${formattedDate}</span>
                    <span class="post-category">${categoryText}</span>
                </div>
                <p class="post-excerpt">${post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content}</p>
                <div class="post-stats">
                    <span class="views-count">
                        <i class="bi bi-eye"></i>
                        <span>${post.views || 0}</span>
                    </span>
                    <span class="comment-count">
                        <i class="bi bi-chat-dots"></i>
                        <span>${post.replies || 0}</span>
                    </span>
                    <button class="like-btn ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                        <i class="bi bi-hand-thumbs-up"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="favorite-btn ${isFavorited ? 'active' : ''}" data-post-id="${post.id}">
                        <i class="bi bi-star${isFavorited ? '-fill' : ''}"></i>
                    </button>
                    ${deleteButtonHTML}
                </div>
            </div>
        `;
    } else {
        // 普通帖子样式
        postElement.innerHTML = `
            <div class="post-avatar">
                <img src="${post.authorAvatar}" alt="${post.author}的头像">
            </div>
            <div class="post-content">
                <h3 class="post-title"><a href="post-detail.html?id=${post.id}">${post.title}</a></h3>
                <div class="post-meta">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${formattedDate}</span>
                    <span class="post-category">${categoryText}</span>
                </div>
                <p class="post-excerpt">${post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content}</p>
                <div class="post-stats">
                    <span class="views-count">
                        <i class="bi bi-eye"></i>
                        <span>${post.views || 0}</span>
                    </span>
                    <span class="comment-count">
                        <i class="bi bi-chat-dots"></i>
                        <span>${post.replies || 0}</span>
                    </span>
                    <button class="like-btn ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                        <i class="bi bi-hand-thumbs-up"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="favorite-btn ${isFavorited ? 'active' : ''}" data-post-id="${post.id}">
                        <i class="bi bi-star${isFavorited ? '-fill' : ''}"></i>
                    </button>
                    ${deleteButtonHTML}
                </div>
            </div>
        `;
    }
    
    return postElement;
}

// 将新帖子添加到页面
function addPostToPage(post) {
    const postList = document.querySelector('.post-list');
    if (!postList) return;
    
    // 使用辅助函数创建帖子元素
    const postElement = createPostElement(post);
    
    // 添加forum-post类，用于分页功能
    postElement.classList.add('forum-post');
    
    // 添加到帖子列表
    if (post.isPinned) {
        // 置顶帖子添加到列表开头
        postList.insertBefore(postElement, postList.firstChild);
    } else {
        // 普通帖子添加到置顶帖子后面
        // 查找最后一个置顶帖子
        const pinnedPosts = postList.querySelectorAll('.post-item.pinned');
        if (pinnedPosts.length > 0) {
            const lastPinned = pinnedPosts[pinnedPosts.length - 1];
            // 在最后一个置顶帖子后插入
            if (lastPinned.nextSibling) {
                postList.insertBefore(postElement, lastPinned.nextSibling);
            } else {
                postList.appendChild(postElement);
            }
        } else {
            // 没有置顶帖子，直接添加到开头
            postList.insertBefore(postElement, postList.firstChild);
        }
    }
    
    // 初始化点赞和收藏功能
    initPostActions(postElement, post);
}

// 初始化帖子的点赞和收藏功能
function initPostActions(postElement, post) {
    // 初始化点赞功能
    const likeBtn = postElement.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 检查用户是否登录
            if (!localStorage.getItem('isLoggedIn')) {
                alert('请先登录后再点赞');
                return;
            }
            
            const postId = this.getAttribute('data-post-id');
            const posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
                const isLiked = likedPosts.includes(postId);
                
                if (isLiked) {
                    // 取消点赞
                    post.likes = Math.max(0, (post.likes || 0) - 1); // 确保点赞数不会小于0
                    likedPosts.splice(likedPosts.indexOf(postId), 1);
                    this.classList.remove('active');
                } else {
                    // 点赞
                    post.likes = (post.likes || 0) + 1;
                    likedPosts.push(postId);
                    this.classList.add('active');
                }
                
                // 更新数据
                localStorage.setItem('forumPosts', JSON.stringify(posts));
                localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                this.querySelector('span').textContent = post.likes;
            }
        });
    }
    
    // 初始化收藏功能
    const favoriteBtn = postElement.querySelector('.favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 检查用户是否登录
            if (!localStorage.getItem('isLoggedIn')) {
                alert('请先登录后再收藏');
                return;
            }
            
            const postId = this.getAttribute('data-post-id');
            const favoritePosts = JSON.parse(localStorage.getItem('favoritePosts') || '[]');
            const isFavorited = favoritePosts.includes(postId);
            
            if (isFavorited) {
                // 取消收藏
                favoritePosts.splice(favoritePosts.indexOf(postId), 1);
                this.classList.remove('active');
                this.querySelector('i').className = 'bi bi-star';
                showToast('已取消收藏');
            } else {
                // 收藏
                favoritePosts.push(postId);
                this.classList.add('active');
                this.querySelector('i').className = 'bi bi-star-fill';
                showToast('已收藏帖子');
            }
            
            localStorage.setItem('favoritePosts', JSON.stringify(favoritePosts));
        });
    }
    
    // 初始化删除功能
    const deleteBtn = postElement.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const postId = this.getAttribute('data-post-id');
            
            // 获取所有帖子
            const posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) {
                showToast('帖子不存在');
                return;
            }
            
            const post = posts[postIndex];
            const currentUser = localStorage.getItem('username');
            const isCurrentUserAdmin = isAdmin();
            
            // 检查删除权限
            if (!isCurrentUserAdmin && currentUser !== post.author) {
                showToast('您没有权限删除此帖子');
                return;
            }
            
            // 确认删除
            if (confirm(isCurrentUserAdmin && currentUser !== post.author ? 
                '您确定要以管理员身份删除此帖子吗？' : 
                '您确定要删除此帖子吗？')) {
                
                // 从数组中删除帖子
                posts.splice(postIndex, 1);
                
                // 更新localStorage
                localStorage.setItem('forumPosts', JSON.stringify(posts));
                
                // 从DOM中移除帖子
                const postItem = document.querySelector(`.post-item[data-post-id="${postId}"]`);
                if (postItem) {
                    postItem.remove();
                }
                
                // 更新帖子计数
                updatePostCount(posts.length);
                
                // 显示成功消息
                showToast(isCurrentUserAdmin && currentUser !== post.author ? 
                    '管理员已删除帖子' : 
                    '帖子已删除');
                
                // 重新初始化分页
                if (typeof reinitializePagination === 'function') {
                    reinitializePagination();
                }
            }
        });
    }
}

// 初始化时加载保存的帖子
function loadSavedPosts() {
    // 创建并保存置顶公告
    const pinnedPost = {
        id: 'pinned1',
        title: '【公告】论坛使用规则及指南',
        author: '管理员',
        // authorAvatar: './image/image--01.png', // 使用默认头像
        category: 'announcement',
        content: `欢迎来到万汇网论坛！为了维护良好的社区氛围，请所有用户遵守以下规则：

1. 发帖规范
   - 标题要简明扼要，准确描述内容
   - 选择合适的分类发帖
   - 文章内容要有条理，段落分明
   - 避免重复发帖

2. 互动规则
   - 理性讨论，互相尊重
   - 遵守相关法律法规
   - 避免发布广告和垃圾信息
   - 对他人的提问和建议给予有价值的回应

3. 内容管理
   - 管理员有权处理违规内容
   - 举报违规内容将得到及时处理
   - 优质内容将被设为精华帖
   - 恶意违规账号将被封禁

4. 奖励机制
   - 发布优质内容可获得积分
   - 积极参与讨论可提升等级
   - 精华帖作者将获得特殊标识
   - 社区贡献者将获得额外权限

请大家共同维护良好的社区环境，祝大家在万汇网论坛玩得开心！`,
        date: new Date().toISOString(),
        views: 1024,
        replies: 86,
        likes: 320,
        isPinned: true,
        isAnnouncement: true
    };

    // 创建更多帖子
    const additionalPosts = [
        // 学术交流分类帖子 (已在第1部分添加)
        
        // 设计讨论分类帖子 (至少10篇)
        {
            id: 'design1',
            title: 'Pixabay和Unsplash高质量素材资源推荐',
            author: '设计爱好者',
            authorAvatar: './image/image--05.png',
            category: 'design',
            content: `在设计项目中，高质量的素材资源非常重要。今天给大家推荐两个我常用的免费图片资源网站：Pixabay和Unsplash。

1. Pixabay特点：
   - 超过260万张免费图片和视频
   - 所有资源均可用于商业项目，无需署名
   - 提供照片、矢量图、插画、视频等多种素材
   - 支持按颜色、方向、大小等筛选
   - 图片质量整体较高，风格多样

2. Unsplash特点：
   - 以高质量摄影作品为主
   - 更新频率高，每天有新作品
   - 简洁的界面，搜索便捷
   - 独特的艺术风格，适合创意项目
   - 提供API接口，可集成到设计工具中

使用建议：
- Pixabay适合寻找多样化的素材，从图标到照片应有尽有
- Unsplash则更适合需要高品质摄影作品的项目
- 使用前了解授权条款，虽然免费但仍有使用限制
- 建立自己的素材库，按主题分类收藏
- 尽量使用原图，自行裁剪和编辑以符合具体需求

这两个网站我已经使用多年，几乎能满足大部分设计项目的需求。当然，对于特定商业项目，有时还是需要考虑付费资源以获得更专业或独特的素材。`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3天前
            views: 285,
            replies: 19,
            likes: 56,
            tags: ['Pixabay', 'Unsplash', '设计素材', '免费资源']
        },
        {
            id: 'design2',
            title: '2023年网页设计趋势分析',
            author: 'UI设计师',
            authorAvatar: './image/image--06.png',
            category: 'design',
            content: `作为一名资深UI设计师，我一直密切关注设计趋势的变化。以下是我对2023年网页设计主要趋势的观察和分析：

1. 极简主义继续流行：
   - 更加注重留白和空间利用
   - 简化导航和交互元素
   - 减少不必要的装饰，突出内容本身

2. 深色模式成为标准：
   - 不再是可选功能，而是基本配置
   - 自动适应系统设置或用户时间
   - 减少眼部疲劳，节省电量

3. 三维元素与微动效：
   - 3D图形增强用户体验
   - 微妙的动画效果引导用户注意力
   - 交互反馈更加直观

4. 沉浸式滚动体验：
   - 视差滚动效果的创新应用
   - 故事化的内容呈现
   - 滚动触发的动画和内容展示

5. 多样化插图风格：
   - 手绘插图增加人性化元素
   - 几何抽象风格展现现代感
   - 品牌专属插图系统建立独特识别

6. 渐变2.0：
   - 更柔和的颜色过渡
   - 多层次渐变创造深度感
   - 与暗色背景的结合应用

7. 无障碍设计成为焦点：
   - 符合WCAG标准成为基本要求
   - 更好的颜色对比度和字体可读性
   - 考虑多种操作方式和设备适配

我认为，好的设计应该平衡美观与功能，跟随趋势但不盲从。理解这些趋势背后的用户需求和技术演进才是关键。`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4天前
            views: 352,
            replies: 27,
            likes: 68,
            tags: ['网页设计', '设计趋势', 'UI设计', '2023趋势']
        },
        {
            id: 'design3',
            title: '字体家网站资源使用心得分享',
            author: '排版设计师',
            authorAvatar: './image/image--07.png',
            category: 'design',
            content: `作为一名专注于排版的设计师，字体选择对我来说至关重要。这里分享一下我使用字体家网站的心得体会：

1. 资源丰富度：
   - 中文字体资源非常全面，包括商用和免费字体
   - 不仅有成熟字体厂商产品，还包含许多设计师个人作品
   - AI造字系列非常实用，尤其是字体家AI造字文楷

2. 下载和使用体验：
   - 注册后可获得每日下载额度
   - VIP会员可无限下载大部分资源
   - 下载速度较稳定，文件完整性有保障

3. 字体分类和筛选：
   - 可按风格、用途、语言等多维度筛选
   - 预览功能全面，可输入自定义文字进行效果查看
   - 相似字体推荐功能很实用

4. 商用授权说明：
   - 每款字体都有明确的授权说明
   - 商用字体有清晰的购买渠道和价格
   - 会定期更新授权变更信息

5. 使用建议：
   - 仔细阅读授权说明，避免侵权风险
   - 创建个人字体库，归类整理常用字体
   - 利用字体对比功能确定最终选择
   - 关注字体家公众号获取最新字体资讯

字体家对我来说是中文设计不可或缺的资源网站，尤其在需要精准控制排版效果或追求特定设计风格时特别有用。大家有什么好用的字体推荐吗？欢迎在评论区分享！`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5天前
            views: 243,
            replies: 23,
            likes: 51,
            tags: ['字体家', '中文字体', '字体设计', '排版']
        },
        {
            id: 'design4',
            title: '享设计平台作品交易经验分享',
            author: '自由设计师',
            authorAvatar: './image/image--08.png',
            category: 'design',
            content: `作为一名在享设计平台活跃了两年的自由设计师，这里分享一些我的经验和心得：

1. 平台优势：
   - 用户群体精准，多为设计行业人士
   - 版权保护机制较为完善
   - 提现流程简单，佣金比例合理
   - 客服响应及时，问题解决效率高

2. 作品上传建议：
   - 高质量预览图是成功的关键
   - 详细描述文件格式、尺寸和使用方法
   - 合理设置价格，考虑工作量和市场需求
   - 标签要精准，有助于提高曝光率
   - 定期更新作品集，保持活跃度

3. 热门素材类型：
   - 节日和季节性主题素材
   - 商业插画和扁平风图标
   - 高质量模板（PPT、社媒图文等）
   - 原创字体和排版元素
   - 适合电商的主图和Banner设计

4. 增加收入技巧：
   - 打造个人风格和辨识度
   - 关注平台活动，参与专题征集
   - 建立系列作品，提高复购率
   - 根据数据分析调整创作方向
   - 与其他设计师合作，互相推广

5. 需要注意的问题：
   - 确保原创性，避免侵权风险
   - 妥善保存源文件，以便后续修改
   - 及时回复用户咨询，提高评分
   - 理性对待负面评价，寻求改进

总体来说，享设计是一个不错的设计师副业平台。只要持续提供高质量内容，就能带来稳定的被动收入。大家对设计交易平台还有什么问题，欢迎讨论交流！`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6天前
            views: 276,
            replies: 31,
            likes: 63,
            tags: ['享设计', '设计交易', '自由设计师', '素材销售']
        },
        {
            id: 'design5',
            title: 'Everypixel人工智能图片搜索工具使用体验',
            author: '设计研究员',
            authorAvatar: './image/image--09.png',
            category: 'design',
            content: `最近一直在使用Everypixel进行项目素材搜索，这个基于AI技术的图片搜索引擎有不少亮点，分享给大家：

1. 搜索能力：
   - 采用AI算法理解搜索意图，结果更精准
   - 支持多语言搜索，中文搜索效果也不错
   - 同时检索多个图库，覆盖面广
   - 支持复杂搜索语法，可精确定位需求

2. 筛选功能：
   - 按照许可类型筛选（免费/付费/CC协议等）
   - 颜色筛选非常直观，便于寻找符合设计风格的图片
   - 可按照媒体类型（照片/矢量/插画）分类
   - 人物数量和构图方式等高级筛选很实用

3. AI图片质量评估：
   - 可预测图片的美学评分
   - 分析构图、色彩和内容质量
   - 帮助快速找到高质量图片
   - 避免筛选低质素材的时间浪费

4. 价格对比功能：
   - 自动比较不同图库的同一图片价格
   - 显示最优购买选择
   - 整合多个平台的折扣信息
   - 支持按预算范围搜索

5. 使用建议：
   - 利用关键词组合获取更准确结果
   - 使用AI评分功能优先查看高分图片
   - 注册账号可保存搜索记录和收藏夹
   - 使用浏览器插件可直接在网页中搜索类似图片

与传统图库相比，Everypixel最大的优势是节省时间和提高效率。它能帮助设计师快速定位高质量素材，不必在多个平台之间切换。不过付费图片的价格对比功能有时不够准确，需要再次确认。`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7天前
            views: 217,
            replies: 16,
            likes: 42,
            tags: ['Everypixel', 'AI搜索', '图片素材', '设计工具']
        },
        {
            id: 'design6',
            title: '如何搭建个人设计作品集网站',
            author: '前端设计师',
            authorAvatar: './image/image--02.png',
            category: 'design',
            content: `作为设计师，拥有一个优秀的个人作品集网站是展示能力的重要途径。以下是我搭建个人设计作品集的经验分享：

1. 平台选择：
   - 自建网站：最大程度的自由度，需要前端技术（HTML/CSS/JS）
   - WordPress：丰富的作品集主题，易于管理，适合大部分设计师
   - Wix/Squarespace：拖拽式构建，速度快，但自定义性稍低
   - Behance/Dribbble：专业设计社区，易于建立但差异化难度大
   
2. 域名和托管：
   - 选择简洁易记的个人域名
   - 推荐云服务如阿里云、腾讯云或国外的DigitalOcean
   - 静态网站考虑GitHub Pages或Netlify（免费）
   - 确保有SSL证书（https）以增加专业性

3. 内容组织：
   - 精选代表作品，质量胜于数量
   - 按项目类型或时间顺序清晰分类
   - 每个项目应包含背景、过程和成果
   - 突出你的设计思路和解决问题的能力
   - 加入案例研究增强专业深度

4. 设计注意点：
   - 保持简洁，让作品成为焦点
   - 注重首屏效果和导航体验
   - 确保响应式设计，适配各种设备
   - 加载速度是关键，优化图片大小
   - 考虑暗色/亮色模式切换

5. 必备内容：
   - 简洁的个人介绍
   - 核心技能和专长领域
   - 作品项目展示（含过程和结果）
   - 联系方式和社交媒体链接
   - 简历下载选项

6. SEO和分析：
   - 合理使用关键词优化
   - 添加Google Analytics追踪访问数据
   - 确保图片有alt标签
   - 考虑添加博客分享设计见解提升权重

我的建议是，无论选择哪种平台，重点都应放在内容质量和用户体验上。作品集本身就是你最大的作品，它应该完美展示你的设计能力和审美水平。`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8天前
            views: 342,
            replies: 28,
            likes: 75,
            tags: ['作品集', '个人网站', '设计展示', '网站搭建']
        },
        {
            id: 'design7',
            title: '求字体网和字体识别技术分析',
            author: '字体研究者',
            authorAvatar: './image/image--03.png',
            category: 'design',
            content: `作为一名长期关注字体识别技术的研究者，我想分享一下对求字体网及类似工具的分析和使用心得：

1. 求字体网的技术原理：
   - 基于深度学习的字形特征识别
   - 大规模字体数据库对比匹配
   - 综合考虑笔画特征、轮廓形状和排版特点
   - 不断通过用户反馈优化算法准确性

2. 识别效果分析：
   - 中文字体识别准确率较高，尤其是常见商用字体
   - 英文字体识别范围广，但相似字体区分度不足
   - 日韩文字识别有基础支持，但准确性有限
   - 手写体和艺术字体识别仍有较大挑战

3. 使用技巧：
   - 提供清晰、无干扰的字体图片
   - 尽量选择包含特征明显的字符
   - 多角度多次上传增加准确率
   - 结合推荐结果手动比对确认
   - 善用"更多相似字体"功能

4. 与其他字体识别工具对比：
   - WhatTheFont：英文字体识别更精准
   - FontSquirrel Matcherator：提供免费替代字体建议
   - Fonts Ninja：浏览器插件形式，使用便捷
   - 求字体网：中文字体库最全面，界面友好

5. 局限性：
   - 无法识别完全定制或非常新的字体
   - 某些效果（如阴影、变形）会影响识别
   - 免费版每日识别次数有限
   - 部分识别结果需要付费查看

对设计师来说，字体识别工具能大大提高工作效率，尤其是在需要匹配已有设计风格时。不过，养成记录所用字体的习惯，建立个人字体库，才是长久之道。欢迎大家分享其他好用的字体工具！`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), // 9天前
            views: 231,
            replies: 19,
            likes: 48,
            tags: ['求字体网', '字体识别', '设计工具', '字体匹配']
        },
        {
            id: 'design8',
            title: '设计配色方案工具推荐与使用心得',
            author: '色彩设计师',
            authorAvatar: './image/image--04.png',
            category: 'design',
            content: `合适的配色方案是设计成功的关键因素之一。以下是我常用的一些配色工具及使用心得：

1. Adobe Color（原Kuler）：
   - 提供多种配色规则（互补、三角形、分裂互补等）
   - 可从图片提取色彩方案
   - 与Adobe软件无缝集成
   - 社区共享功能丰富灵感来源
   - 色盲模式检查功能很实用

2. Coolors：
   - 快捷键操作生成配色方案，非常高效
   - 锁定喜欢的颜色，只刷新其他颜色
   - 调整色相、饱和度、明度很便捷
   - 导出格式多样，支持多种设计软件
   - 渐变生成功能很实用

3. ColorHunt：
   - 精选的时尚配色方案库
   - 按流行度和新鲜度排序
   - 简洁的收藏功能
   - 社区投票系统保证质量
   - 标签系统帮助定位特定风格

4. Colormind：
   - AI辅助生成和谐的配色方案
   - 可从图片、网站提取配色
   - 实时网页UI预览功能
   - 支持锁定部分颜色进行智能补充
   - 响应式设计，移动端使用方便

5. 实用配色技巧：
   - 60-30-10法则：主色60%、辅色30%、强调色10%
   - 从自然图像中提取配色方案
   - 注意色彩心理学影响
   - 考虑品牌识别和目标受众
   - 检查无障碍性（足够的对比度）

6. 个人习惯：
   - 建立个人色彩库，收集喜欢的配色
   - 参考成功案例，分析配色原理
   - 遵循"少即是多"原则，通常3-5种颜色足够
   - 总是在不同设备上检查效果
   - 征求非设计师的意见，了解普通用户感受

良好的配色能提升整体设计效果，值得花时间研究和尝试。大家有什么常用的配色工具或心得？欢迎在评论区分享！`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10天前
            views: 289,
            replies: 25,
            likes: 64,
            tags: ['设计配色', '色彩工具', '配色方案', 'Adobe Color']
        },
        {
            id: 'design9',
            title: '如何提高UI设计效率的实用技巧',
            author: '高效设计师',
            authorAvatar: './image/image--05.png',
            category: 'design',
            content: `作为一名工作5年的UI设计师，我发现效率是决定成败的关键因素。以下是我积累的一些提高设计效率的实用技巧：

1. 建立个人组件库：
   - 整理常用UI元素为组件/符号
   - 建立统一的命名规范
   - 设置合理的嵌套结构
   - 使用自动布局/约束功能
   - 定期更新和优化组件

2. 掌握软件快捷键：
   - 投入时间学习和记忆关键快捷键
   - 创建自定义快捷键组合
   - 使用快捷键管理工具
   - 购买可编程快捷键板（如Stream Deck）
   - 减少鼠标操作，提高效率

3. 使用插件和自动化：
   - Figma/Sketch插件扩展功能
   - 数据填充自动生成内容
   - 批量操作处理重复任务
   - 导出自动化节省时间
   - 脚本处理复杂操作

4. 建立设计系统：
   - 风格指南确保一致性
   - 网格系统规范布局
   - 色彩系统简化决策
   - 排版规则标准化文本
   - 版本控制跟踪变更

5. 高效工作流程：
   - 先低保真原型再细节设计
   - 使用模板加速项目启动
   - 批量处理同类型任务
   - 定时休息保持专注
   - 适当授权和团队协作

6. 文件管理技巧：
   - 清晰的文件命名规范
   - 结构化的文件夹组织
   - 云存储同步和备份
   - 版本编号避免混淆
   - 归档旧项目释放空间

7. 沟通效率：
   - 准备设计说明文档
   - 录制简短演示视频
   - 使用标注工具减少解释
   - 建立反馈收集系统
   - 定期同步会议代替频繁打断

这些技巧需要时间投入来建立，但长期来看会大大提升工作效率。我的经验是，每周安排1-2小时用于优化工作流程，逐步形成自己的效率系统。`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(), // 11天前
            views: 367,
            replies: 29,
            likes: 81,
            tags: ['UI设计', '效率技巧', '设计系统', '工作流程']
        },
        {
            id: 'design10',
            title: '移动应用UI设计规范与最佳实践',
            author: '移动UI专家',
            authorAvatar: './image/image--06.png',
            category: 'design',
            content: `随着移动设备的普及，优秀的移动UI设计变得尤为重要。以下是我根据多年经验总结的移动应用UI设计规范和最佳实践：

1. 基本设计原则：
   - 以用户为中心，考虑单手操作范围
   - 保持简洁，减少认知负担
   - 提供清晰的视觉层次和导航路径
   - 确保一致性，遵循平台设计语言
   - 提供即时反馈，增强交互感

2. 布局与导航：
   - 关键功能放在易触达区域（拇指区）
   - 使用标准导航模式（标签栏、抽屉菜单等）
   - 保持足够的点击区域（最小44x44点）
   - 考虑不同屏幕尺寸的适配
   - 确保返回路径明确

3. 视觉设计：
   - 建立清晰的色彩系统（主色、辅色、功能色）
   - 文字层级清晰（标题、正文、辅助文字）
   - 使用一致的图标风格和大小
   - 注意留白，避免视觉拥挤
   - 确保足够的对比度（符合WCAG标准）

4. 交互反馈：
   - 所有可点击元素提供状态变化
   - 加载过程显示进度指示
   - 错误信息友好且提供解决方案
   - 成功操作给予明确确认
   - 动效适度，增强体验但不干扰

5. 性能考量：
   - 优化图片和资源大小
   - 实现平滑滚动和转场
   - 预加载关键内容
   - 考虑离线状态的用户体验
   - 降低电池消耗（如深色模式）

6. 平台特性：
   - iOS：遵循Human Interface Guidelines
   - Android：遵循Material Design指南
   - 适应各平台特有手势和交互模式
   - 考虑不同硬件特性（如刘海屏、全面屏）
   - 适配系统主题（如深色模式）

7. 测试与迭代：
   - 在真实设备上测试而非仅在模拟器
   - 收集用户反馈持续优化
   - A/B测试验证设计决策
   - 分析用户行为数据指导改进
   - 关注竞品更新保持竞争力

移动UI设计是一个不断演进的领域，关注平台更新和用户行为变化至关重要。记住，最好的设计是用户几乎感觉不到的设计。`,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12天前
            views: 412,
            replies: 34,
            likes: 93,
            tags: ['移动UI', '设计规范', 'App设计', '用户体验']
        }
    ];

    // 从localStorage获取帖子
    let posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    
    // 检查是否已存在置顶公告
    const existingPinned = posts.find(p => p.id === pinnedPost.id);
    if (!existingPinned) {
        // 添加置顶公告到帖子列表开头
        posts.unshift(pinnedPost);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
    }
    
    // 如果有保存的帖子，更新帖子总数
    if (posts.length > 0) {
        updatePostCount(posts.length);
        
        // 获取帖子列表容器
        const postList = document.querySelector('.post-list');
        if (!postList) return;
        
        // 清空帖子列表容器
        postList.innerHTML = '';
        
        // 添加保存的帖子到页面 - 按顺序添加所有帖子
        posts.forEach(post => addPostToPage(post));
        
        // 初始化分页功能
        if (typeof initPagination === 'function') {
            // 传递帖子总数
            initPagination(posts.length);
            console.log('分页初始化完成，共' + posts.length + '篇帖子');
        } else {
            console.error('分页函数未定义，请检查forum-pagination.js是否正确加载');
        }
    }
}

// 初始化折叠/展开功能
function initToggleSections() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(btn => {
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (!targetSection) return;
        
        btn.addEventListener('click', function() {
            // 切换按钮样式
            this.classList.toggle('collapsed');
            
            // 切换内容可见性
            targetSection.classList.toggle('collapsed');
            
            // 切换图标方向
            const icon = this.querySelector('i');
            if (icon) {
                if (icon.classList.contains('bi-chevron-down')) {
                    icon.classList.remove('bi-chevron-down');
                    icon.classList.add('bi-chevron-right');
                } else {
                    icon.classList.remove('bi-chevron-right');
                    icon.classList.add('bi-chevron-down');
                }
            }
        });
    });
}

// 模拟加载效果
function simulateLoading() {
    const postList = document.querySelector('.post-list');
    if (!postList) return;
    
    // 显示加载提示
    postList.innerHTML = '<div class="loading"><i class="bi bi-arrow-repeat spin"></i> 加载中...</div>';
    
    // 模拟1秒延迟后显示结果
    setTimeout(() => {
        // 获取保存的帖子
        const savedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
        
        // 获取当前选中的分类
        const activeCategory = document.querySelector('.forum-category.active');
        const category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
        
        // 根据分类筛选帖子
        const filteredPosts = category === 'all' 
            ? savedPosts 
            : savedPosts.filter(post => post.category === category);
        
        // 获取当前排序方式
        const sortSelect = document.getElementById('sortSelect');
        const sortType = sortSelect ? sortSelect.value : 'latest';
        
        // 获取排序方向
        const sortDirectionBtn = document.querySelector('.sort-direction-btn');
        const sortDirection = sortDirectionBtn ? sortDirectionBtn.getAttribute('data-direction') : 'desc';
        const isDescending = sortDirection === 'desc';
        
        // 根据排序方式排序帖子
        let sortedPosts = [...filteredPosts];
        switch(sortType) {
            case 'latest':
                sortedPosts.sort((a, b) => {
                    const comparison = new Date(b.date) - new Date(a.date);
                    return isDescending ? comparison : -comparison;
                });
                break;
            case 'popular':
                sortedPosts.sort((a, b) => {
                    const popularityA = (a.likes || 0) * 2 + (a.replies || 0) * 3; // 点赞权重2，回复权重3
                    const popularityB = (b.likes || 0) * 2 + (b.replies || 0) * 3;
                    const comparison = popularityB - popularityA;
                    return isDescending ? comparison : -comparison;
                });
                break;
            case 'replies':
                sortedPosts.sort((a, b) => {
                    const comparison = (b.replies || 0) - (a.replies || 0);
                    return isDescending ? comparison : -comparison;
                });
                break;
            case 'views':
                sortedPosts.sort((a, b) => {
                    const comparison = (b.views || 0) - (a.views || 0);
                    return isDescending ? comparison : -comparison;
                });
                break;
        }
        
        // 清空当前帖子列表
        postList.innerHTML = '';
        
        if (sortedPosts.length === 0) {
            // 如果没有帖子，显示提示信息
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-posts-message';
            emptyMessage.innerHTML = `
                <i class="bi bi-inbox"></i>
                <p>当前分类暂无帖子</p>
            `;
            postList.appendChild(emptyMessage);
        } else {
            // 显示排序后的帖子
            sortedPosts.forEach(post => {
                addPostToPage(post);
            });
        }
        
        // 更新帖子计数
        updatePostCount(sortedPosts.length);
    }, 1000);
}

// 初始化统计数据更新
function updateForumStats() {
    // 这里可以添加从服务器获取最新论坛统计数据的逻辑
    // 模拟实时更新在线人数
    const onlineCountElement = document.querySelector('.stats-list li:last-child span');
    
    if (onlineCountElement) {
        // 每分钟更新一次在线人数
        setInterval(() => {
            // 生成一个随机数 (70-120)
            const randomOnline = Math.floor(Math.random() * 50) + 70;
            onlineCountElement.textContent = randomOnline;
        }, 60000);
    }
}

// 初始化统计数据更新
updateForumStats();

// 初始化分页功能
initPagination();

// 初始化用户下拉菜单
function initUserDropdown() {
    const userBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const userNameElement = document.querySelector('.user-name');
    
    // 如果用户已登录，显示管理员标识
    if (localStorage.getItem('isLoggedIn') === 'true' && isAdmin() && userNameElement) {
        // 检查是否已经有管理员标识
        if (!userNameElement.querySelector('.admin-badge')) {
            const adminBadge = document.createElement('span');
            adminBadge.className = 'admin-badge';
            adminBadge.textContent = '管理员';
            userNameElement.appendChild(adminBadge);
        }
    }
    
    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // 点击页面其他区域关闭下拉菜单
        document.addEventListener('click', function() {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
}

// 初始化头像点击功能
function initAvatarClick() {
    const userAvatar = document.getElementById('userAvatar');
    const avatarModal = document.getElementById('avatarModal');
    
    // 检查是否需要添加头像模态框
    if (userAvatar && !avatarModal) {
        // 创建头像模态框
        createAvatarModal();
    }
    
    // 如果找到了用户头像和头像模态框
    if (userAvatar && document.getElementById('avatarModal')) {
        userAvatar.addEventListener('click', function() {
            // 检查用户是否登录
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('请先登录后再修改头像');
                window.location.href = 'login.html';
                return;
            }
            
            // 显示头像模态框
            document.getElementById('avatarModal').style.display = 'flex';
        });
        
        // 初始化头像模态框功能
        initAvatarModal();
    }
}

// 创建头像模态框
function createAvatarModal() {
    const avatarModalHTML = `
    <div class="avatar-modal" id="avatarModal">
        <div class="avatar-container">
            <div class="avatar-header">
                <h3>选择头像</h3>
                <span class="close-modal" id="closeAvatarModal">&times;</span>
            </div>
            <div class="avatar-tabs">
                <div class="avatar-tab active" data-tab="preset">预设头像</div>
                <div class="avatar-tab" data-tab="upload">上传头像</div>
            </div>
            <div class="avatar-content">
                <div class="avatar-tab-panel active" id="preset-panel">
                    <div class="avatar-options">
                        <div class="avatar-option" data-avatar="./image/image--01.png">
                            <img src="./image/image--01.png" alt="头像选项1">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--02.png">
                            <img src="./image/image--02.png" alt="头像选项2">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--03.png">
                            <img src="./image/image--03.png" alt="头像选项3">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--04.png">
                            <img src="./image/image--04.png" alt="头像选项4">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--05.png">
                            <img src="./image/image--05.png" alt="头像选项5">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--06.png">
                            <img src="./image/image--06.png" alt="头像选项6">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--07.png">
                            <img src="./image/image--07.png" alt="头像选项7">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--08.png">
                            <img src="./image/image--08.png" alt="头像选项8">
                        </div>
                        <div class="avatar-option" data-avatar="./image/image--09.png">
                            <img src="./image/image--09.png" alt="头像选项9">
                        </div>
                    </div>
                </div>
                <div class="avatar-tab-panel" id="upload-panel">
                    <div class="upload-avatar-container">
                        <div class="upload-preview">
                            <img id="uploadPreview" src="./image/image--01.png" alt="预览头像">
                        </div>
                        <div class="upload-controls">
                            <label for="avatarUpload" class="upload-btn">选择图片</label>
                            <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                            <p class="upload-tip">支持JPG、PNG格式，建议使用正方形图片</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="avatar-actions">
                <button id="saveAvatar" class="save-avatar-btn">保存选择</button>
            </div>
        </div>
    </div>`;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', avatarModalHTML);
}

// 初始化头像模态框功能
function initAvatarModal() {
    const avatarModal = document.getElementById('avatarModal');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    const avatarTabs = document.querySelectorAll('.avatar-tab');
    const avatarTabPanels = document.querySelectorAll('.avatar-tab-panel');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const saveAvatarBtn = document.getElementById('saveAvatar');
    const avatarUpload = document.getElementById('avatarUpload');
    const uploadPreview = document.getElementById('uploadPreview');
    
    // 当前选中的头像
    let selectedAvatar = localStorage.getItem('userAvatar') || './image/image--01.png';
    let selectedOption = null;
    
    // 高亮当前使用的头像
    avatarOptions.forEach(option => {
        const avatarSrc = option.getAttribute('data-avatar');
        if (avatarSrc === selectedAvatar) {
            option.classList.add('selected');
            selectedOption = option;
        }
        
        // 点击选择头像
        option.addEventListener('click', function() {
            // 移除其他选项的选中状态
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // 添加当前选项的选中状态
            this.classList.add('selected');
            selectedOption = this;
            selectedAvatar = this.getAttribute('data-avatar');
        });
    });
    
    // 切换标签页
    avatarTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 切换标签活跃状态
            avatarTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 切换面板显示
            avatarTabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab + '-panel') {
                    panel.classList.add('active');
                }
            });
        });
    });
    
    // 上传头像预览
    if (avatarUpload && uploadPreview) {
        avatarUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadPreview.src = e.target.result;
                    selectedAvatar = e.target.result;
                    
                    // 移除预设头像的选中状态
                    avatarOptions.forEach(opt => opt.classList.remove('selected'));
                    selectedOption = null;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 保存头像
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', function() {
            // 保存到本地存储
            localStorage.setItem('userAvatar', selectedAvatar);
            
            // 更新页面上的头像
            const avatarImg = document.getElementById('avatarImg');
            const headerAvatarImg = document.getElementById('headerAvatarImg');
            
            if (avatarImg) {
                avatarImg.src = selectedAvatar;
            }
            
            if (headerAvatarImg) {
                headerAvatarImg.src = selectedAvatar;
            }
            
            // 关闭模态框
            avatarModal.style.display = 'none';
        });
    }
    
    // 关闭模态框
    if (closeAvatarModal) {
        closeAvatarModal.addEventListener('click', function() {
            avatarModal.style.display = 'none';
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === avatarModal) {
            avatarModal.style.display = 'none';
        }
    });
}

// 初始化论坛搜索功能
function initForumSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput || !searchBtn) return;
    
    // 修改搜索框占位符文本，明确表示这是论坛搜索
    searchInput.setAttribute('placeholder', '搜索论坛主题、帖子或用户...');
    
    // 点击搜索按钮执行搜索
    searchBtn.addEventListener('click', function() {
        performForumSearch();
    });
    
    // 回车执行搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performForumSearch();
        }
    });
    
    // 执行论坛搜索
    function performForumSearch() {
        const searchText = searchInput.value.trim().toLowerCase();
        if (!searchText) {
            showToast('请输入搜索内容');
            return;
        }
        
        // 从本地存储获取所有帖子
        const savedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
        if (!savedPosts.length) {
            showToast('暂无帖子内容');
            return;
        }
        
        // 记录找到的结果
        let foundResults = false;
        let resultsCount = 0;
        
        // 创建或获取搜索结果区域
        let searchResultsSection = document.querySelector('.forum-search-results');
        
        if (!searchResultsSection) {
            // 如果搜索结果区域不存在，创建它
            searchResultsSection = document.createElement('div');
            searchResultsSection.className = 'forum-post-list forum-search-results';
            
            const searchHeader = document.createElement('div');
            searchHeader.className = 'forum-header';
            searchHeader.innerHTML = `
                <h2>搜索结果: <span id="search-query"></span></h2>
                <div class="forum-options">
                    <span id="results-count"></span>
                    <div class="view-options">
                        <button class="back-to-forum-btn" type="button">
                            <i class="bi bi-arrow-left"></i> 返回论坛
                        </button>
                    </div>
                </div>
            `;
            
            const searchResults = document.createElement('div');
            searchResults.className = 'post-list';
            searchResults.id = 'search-results-list';
            
            searchResultsSection.appendChild(searchHeader);
            searchResultsSection.appendChild(searchResults);
            
            // 添加到论坛内容区域
            const forumContent = document.querySelector('.forum-content');
            if (forumContent) {
                forumContent.appendChild(searchResultsSection);
            }
        }
        
        // 隐藏其他内容区域，只显示搜索结果
        const welcomeSection = document.querySelector('.forum-welcome');
        const sliderSection = document.querySelector('.hot-topics-slider');
        const mainPostList = document.querySelector('.forum-post-list:not(.forum-search-results)');
        
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (sliderSection) sliderSection.style.display = 'none';
        if (mainPostList) mainPostList.style.display = 'none';
        searchResultsSection.style.display = 'block';
        
        // 清空之前的搜索结果
        const searchResultsList = document.getElementById('search-results-list');
        if (searchResultsList) {
            searchResultsList.innerHTML = '';
        }
        
        // 更新搜索查询显示
        const searchQuerySpan = document.getElementById('search-query');
        if (searchQuerySpan) {
            searchQuerySpan.textContent = searchText;
        }
        
        // 搜索所有帖子
        savedPosts.forEach(post => {
            const title = post.title.toLowerCase();
            const author = post.author.toLowerCase();
            const content = post.content.toLowerCase();
            const category = post.category.toLowerCase();
            
            if (title.includes(searchText) || 
                author.includes(searchText) || 
                content.includes(searchText) || 
                category.includes(searchText)) {
                // 创建搜索结果的帖子卡片
                const postElement = document.createElement('div');
                postElement.className = `post-item${post.isPinned ? ' pinned' : ''}`;
                postElement.setAttribute('data-post-id', post.id);
                postElement.setAttribute('data-category', post.category);
                postElement.classList.add('forum-post');

                // 格式化日期
                const postDate = new Date(post.date);
                const formattedDate = `${postDate.getFullYear()}-${(postDate.getMonth() + 1).toString().padStart(2, '0')}-${postDate.getDate().toString().padStart(2, '0')}`;

                // 获取分类中文名称
                const categoryMap = {
                    'academic': '学术交流',
                    'design': '设计讨论',
                    'ai': 'AI技术',
                    'media': '影视资源',
                    'questions': '问答专区',
                    'feedback': '反馈建议'
                };
                const categoryText = categoryMap[post.category] || post.category;

                // 高亮搜索关键词
                const highlightText = (text) => {
                    const regex = new RegExp(searchText, 'gi');
                    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
                };

                // 判断是否显示删除按钮
                const currentUser = localStorage.getItem('username');
                const isCurrentUserAdmin = isAdmin();
                const isAuthor = currentUser === post.author;
                const showDeleteButton = isCurrentUserAdmin || isAuthor;
                
                // 删除按钮HTML
                const deleteButtonHTML = showDeleteButton ? `
                    <button class="delete-btn" data-post-id="${post.id}" title="${isCurrentUserAdmin ? '管理员删除' : '删除自己的帖子'}">
                        <i class="bi bi-trash"></i>
                    </button>
                ` : '';

                // 设置帖子内容HTML
                postElement.innerHTML = `
                    <div class="post-avatar">
                        <img src="${post.authorAvatar || './image/image--01.png'}" alt="${post.author}的头像">
                    </div>
                    <div class="post-content">
                        <h3 class="post-title">
                            <a href="post-detail.html?id=${post.id}">${highlightText(post.title)}</a>
                            ${post.isPinned ? '<span class="pin-badge">置顶</span>' : ''}
                        </h3>
                        <div class="post-meta">
                            <span class="post-author">${highlightText(post.author)}</span>
                            <span class="post-date">${formattedDate}</span>
                            <span class="post-category">${highlightText(categoryText)}</span>
                        </div>
                        <p class="post-excerpt">${highlightText(post.content.substring(0, 200))}${post.content.length > 200 ? '...' : ''}</p>
                        <div class="post-stats">
                            <span class="views-count">
                                <i class="bi bi-eye"></i>
                                <span>${post.views || 0}</span>
                            </span>
                            <span class="comment-count">
                                <i class="bi bi-chat-dots"></i>
                                <span>${post.replies || 0}</span>
                            </span>
                            <button class="like-btn" data-post-id="${post.id}">
                                <i class="bi bi-hand-thumbs-up"></i>
                                <span>${post.likes || 0}</span>
                            </button>
                            <button class="favorite-btn" data-post-id="${post.id}">
                                <i class="bi bi-star"></i>
                            </button>
                            ${deleteButtonHTML}
                        </div>
                    </div>
                `;

                // 将帖子添加到搜索结果列表
                searchResultsList.appendChild(postElement);
                resultsCount++;
                foundResults = true;

                // 初始化帖子的交互功能
                initPostActions(postElement, post);
            }
        });
        
        // 更新结果计数
        const resultsCountSpan = document.getElementById('results-count');
        if (resultsCountSpan) {
            resultsCountSpan.textContent = `找到 ${resultsCount} 个结果`;
        }
        
        // 如果没有找到结果，显示无结果提示
        if (!foundResults && searchResultsList) {
            searchResultsList.innerHTML = `
                <div class="no-results">
                    <i class="bi bi-emoji-frown"></i>
                    <p>抱歉，未找到与"${searchText}"相关的论坛内容</p>
                    <p>请尝试其他关键词或浏览论坛分类</p>
                </div>
            `;
        }
        
        // 添加返回按钮功能
        const backBtn = document.querySelector('.back-to-forum-btn');
        if (backBtn) {
            // 移除所有现有的事件监听器
            const newBackBtn = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBackBtn, backBtn);
            
            // 添加新的事件监听器
            newBackBtn.addEventListener('click', function() {
                // 隐藏搜索结果
                if (searchResultsSection) {
                    searchResultsSection.style.display = 'none';
                }
                
                // 显示原来的内容
                if (welcomeSection) welcomeSection.style.display = 'block';
                if (sliderSection) sliderSection.style.display = 'block';
                if (mainPostList) mainPostList.style.display = 'block';
                
                // 清空搜索框
                if (searchInput) {
                    searchInput.value = '';
                }
            });
        }
    }
}

// 显示提示消息
function showToast(message) {
    // 如果已经有toast，先移除
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 淡出并移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// 初始化管理员账号
function initAdminAccount() {
    // 检查是否已经存在管理员账号
    if (!localStorage.getItem('adminAccount')) {
        // 创建默认管理员账号
        const adminAccount = {
            username: 'admin',
            password: 'admin123',
            isAdmin: true,
            phone: '13900139000', // 添加手机号
            email: 'admin@example.com' // 添加邮箱
        };
        
        // 保存到localStorage
        localStorage.setItem('adminAccount', JSON.stringify(adminAccount));
        console.log('已创建默认管理员账号');
    }
    
    // 检查当前登录用户是否为管理员
    const username = localStorage.getItem('username');
    if (username) {
        const adminAccount = JSON.parse(localStorage.getItem('adminAccount'));
        if (adminAccount && username === adminAccount.username) {
            // 设置管理员标识
            localStorage.setItem('isAdmin', 'true');
            console.log('当前登录用户是管理员');
        } else {
            localStorage.setItem('isAdmin', 'false');
        }
    } else {
        localStorage.setItem('isAdmin', 'false');
    }
}

// 检查是否为管理员
function isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
}

// 将CSS样式添加到页面中
function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .delete-btn {
            margin-left: 8px;
            padding: 4px 8px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            color: #dc3545;
            transition: all 0.2s;
        }
        
        .delete-btn:hover {
            background-color: #dc3545;
            color: #fff;
            border-color: #dc3545;
        }
        
        /* 管理员标识 */
        .admin-badge {
            display: inline-block;
            background-color: #6f42c1;
            color: white;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 10px;
            margin-left: 5px;
        }
    `;
    document.head.appendChild(styleElement);
}

// 初始化论坛分类的颜色和交互效果
function initForumCategoriesMenu() {
    const categoryItems = document.querySelectorAll('.forum-category');
    const toggleBtn = document.getElementById('toggleCategories');
    const categoryList = document.getElementById('categoryList');
    
    // 处理分类折叠/展开
    if (toggleBtn && categoryList) {
        toggleBtn.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            categoryList.classList.toggle('collapsed');
        });
    }
    
    // 不修改原有分类点击事件，只应用首页的颜色样式
}