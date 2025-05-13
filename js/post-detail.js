// 帖子详情页面功能交互脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户登录状态
    initUserAuth();
    
    // 获取帖子ID
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (postId) {
        // 加载帖子详情
        loadPostDetail(postId);
        
        // 初始化点赞功能
        initLikeButton(postId);
        
        // 初始化收藏功能
        initFavoriteButton(postId);
        
        // 初始化评论功能
        initCommentSection(postId);
        
        // 初始化分享功能
        initShareButton(postId);
        
        // 初始化用户导航功能
        initUserNavigation();
        
        // 初始化搜索功能
        initSearch();
    } else {
        // 如果没有帖子ID，显示错误信息
        showError('未找到帖子');
    }
});

// 初始化用户导航功能
function initUserNavigation() {
    const userBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userBtn && dropdownMenu) {
        // 点击用户按钮显示/隐藏下拉菜单
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
        
        // 处理下拉菜单项点击
        dropdownMenu.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (!target) return;
            
            e.preventDefault();
            const action = target.getAttribute('data-action');
            
            switch(action) {
                case 'home':
                    window.location.href = 'index.html';
                    break;
                case 'favorites':
                    window.location.href = 'favorites.html';
                    break;
                case 'settings':
                    window.location.href = 'settings.html';
                    break;
                case 'logout':
                    handleLogout();
                    break;
            }
        });
    }
    
    // 处理登录按钮点击
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }
}

// 处理退出登录
function handleLogout() {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    
    // 显示提示消息
    showToast('已成功退出登录');
    
    // 延迟跳转到首页
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// 加载帖子详情
function loadPostDetail(postId) {
    // 获取保存的帖子
    const posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        // 设置帖子类型
        const postDetailElement = document.querySelector('.post-detail');
        if (postDetailElement) {
            postDetailElement.setAttribute('data-type', post.isAnnouncement ? 'announcement' : 'normal');
        }

        // 增加浏览次数（在更新页面之前）
        post.views = (post.views || 0) + 1;
        localStorage.setItem('forumPosts', JSON.stringify(posts));

        // 更新帖子信息
        document.getElementById('postTitle').textContent = post.title;
        
        // 根据是否是公告显示不同的内容
        if (post.isAnnouncement) {
            // 公告只显示时间
            document.querySelector('.post-meta').innerHTML = `
                <div class="post-info">
                    <span id="postDate">${formatDate(post.date)}</span>
                    <span id="postCategory">${getCategoryText(post.category)}</span>
                </div>
            `;
            // 隐藏作者信息区域
            const authorInfo = document.querySelector('.author-info');
            if (authorInfo) {
                authorInfo.style.display = 'none';
            }
        } else {
            // 普通帖子显示完整信息
            document.getElementById('authorAvatar').src = post.authorAvatar;
            document.getElementById('authorName').textContent = post.author;
            document.getElementById('postDate').textContent = formatDate(post.date);
            document.getElementById('postCategory').textContent = getCategoryText(post.category);
        }
        
        document.getElementById('postViews').textContent = `${post.views}`;
        document.getElementById('postContent').innerHTML = formatContent(post.content);
        document.getElementById('likeCount').textContent = post.likes || 0;
        document.getElementById('commentCount').textContent = post.replies || 0;
        
        // 更新用户头像
        const userAvatar = localStorage.getItem('userAvatar') || './image/image--01.png';
        document.getElementById('commentUserAvatar').src = userAvatar;
        
    } else {
        showError('帖子不存在');
    }
}

// 格式化内容，将换行符转换为HTML段落
function formatContent(content) {
    return content.split('\n\n')
        .filter(paragraph => paragraph.trim())
        .map(paragraph => `<p>${paragraph.trim()}</p>`)
        .join('');
}

// 初始化点赞功能
function initLikeButton(postId) {
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    
    // 获取点赞状态
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const isLiked = likedPosts.includes(postId);
    
    if (isLiked) {
        likeBtn.classList.add('active');
    }
    
    likeBtn.addEventListener('click', function() {
        // 检查用户是否登录
        if (!localStorage.getItem('isLoggedIn')) {
            alert('请先登录后再点赞');
            return;
        }
        
        // 获取帖子数据
        const posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            const isCurrentlyLiked = likedPosts.includes(postId);
            
            if (isCurrentlyLiked) {
                // 取消点赞
                post.likes = Math.max(0, (post.likes || 0) - 1); // 确保点赞数不会小于0
                likedPosts.splice(likedPosts.indexOf(postId), 1);
                likeBtn.classList.remove('active');
                showToast('已取消点赞');
            } else {
                // 点赞
                post.likes = (post.likes || 0) + 1;
                likedPosts.push(postId);
                likeBtn.classList.add('active');
                showToast('点赞成功');
            }
            
            // 更新数据
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            likeCount.textContent = post.likes;
        }
    });
}

// 初始化收藏功能
function initFavoriteButton(postId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    // 获取收藏状态
    const favoritePosts = JSON.parse(localStorage.getItem('favoritePosts') || '[]');
    const isFavorited = favoritePosts.includes(postId);
    
    // 设置初始状态
    if (isFavorited) {
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="bi bi-star-fill"></i>';
        favoriteBtn.title = '取消收藏';
    } else {
        favoriteBtn.innerHTML = '<i class="bi bi-star"></i>';
        favoriteBtn.title = '收藏帖子';
    }
    
    favoriteBtn.addEventListener('click', function() {
        // 检查用户是否登录
        if (!localStorage.getItem('isLoggedIn')) {
            alert('请先登录后再收藏');
            return;
        }
        
        const isCurrentlyFavorited = favoritePosts.includes(postId);
        
        if (isCurrentlyFavorited) {
            // 取消收藏
            favoritePosts.splice(favoritePosts.indexOf(postId), 1);
            favoriteBtn.classList.remove('active');
            favoriteBtn.innerHTML = '<i class="bi bi-star"></i>';
            favoriteBtn.title = '收藏帖子';
            showToast('已取消收藏');
        } else {
            // 收藏
            favoritePosts.push(postId);
            favoriteBtn.classList.add('active');
            favoriteBtn.innerHTML = '<i class="bi bi-star-fill"></i>';
            favoriteBtn.title = '取消收藏';
            showToast('帖子已收藏，可在<a href="user-forum-favorites.html">我的收藏帖子</a>中查看');
        }
        
        // 保存收藏状态
        localStorage.setItem('favoritePosts', JSON.stringify(favoritePosts));
    });
}

// 初始化评论功能
function initCommentSection(postId) {
    const commentText = document.getElementById('commentText');
    const submitComment = document.getElementById('submitComment');
    const commentsList = document.getElementById('commentsList');
    
    // 加载评论
    loadComments(postId);
    
    submitComment.addEventListener('click', function() {
        // 检查用户是否登录
        if (!localStorage.getItem('isLoggedIn')) {
            alert('请先登录后再评论');
            return;
        }
        
        const content = commentText.value.trim();
        if (!content) {
            alert('请输入评论内容');
            return;
        }
        
        // 创建新评论
        const comment = {
            id: Date.now().toString(),
            postId: postId,
            author: localStorage.getItem('username') || '匿名用户',
            authorAvatar: localStorage.getItem('userAvatar') || './image/image--01.png',
            content: content,
            date: new Date().toISOString(),
            likes: 0
        };
        
        // 保存评论
        const comments = JSON.parse(localStorage.getItem('postComments') || '{}');
        if (!comments[postId]) {
            comments[postId] = [];
        }
        comments[postId].unshift(comment);
        localStorage.setItem('postComments', JSON.stringify(comments));
        
        // 更新帖子回复数
        const posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.replies = (post.replies || 0) + 1;
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            document.getElementById('commentCount').textContent = post.replies;
        }
        
        // 清空输入框并重新加载评论
        commentText.value = '';
        loadComments(postId);
        showToast('评论发表成功');
    });
}

// 加载评论
function loadComments(postId) {
    const commentsList = document.getElementById('commentsList');
    const comments = JSON.parse(localStorage.getItem('postComments') || '{}');
    const postComments = comments[postId] || [];
    
    if (postComments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <i class="bi bi-chat-left"></i>
                <p>暂无评论，快来发表第一条评论吧！</p>
            </div>
        `;
        // 隐藏分页控件
        const paginationContainer = document.getElementById('commentPagination');
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }
        return;
    }
    
    // 渲染所有评论
    commentsList.innerHTML = postComments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <img class="comment-avatar" src="${comment.authorAvatar}" alt="${comment.author}的头像">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${formatDate(comment.date)}</span>
                </div>
                <p class="comment-text">${comment.content}</p>
                <div class="comment-actions">
                    <button class="like-comment-btn" data-comment-id="${comment.id}">
                        <i class="bi bi-hand-thumbs-up"></i>
                        <span>${comment.likes || 0}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // 初始化评论点赞功能
    initCommentLikes();
    
    // 显示分页控件
    const paginationContainer = document.getElementById('commentPagination');
    if (paginationContainer) {
        paginationContainer.style.display = 'block';
    }
    
    // 初始化评论分页
    if (typeof initCommentPagination === 'function') {
        initCommentPagination(postComments.length);
        console.log('评论分页初始化完成，共' + postComments.length + '条评论');
    } else {
        console.error('评论分页函数未定义，请检查comment-pagination.js是否正确加载');
    }
}

// 初始化评论点赞功能
function initCommentLikes() {
    const likeButtons = document.querySelectorAll('.like-comment-btn');
    
    likeButtons.forEach(button => {
        const commentId = button.getAttribute('data-comment-id');
        const likedComments = JSON.parse(localStorage.getItem('likedComments') || '[]');
        
        // 获取用户每天点赞记录
        const userDailyLikes = JSON.parse(localStorage.getItem('userDailyCommentLikes') || '{}');
        const today = new Date().toISOString().split('T')[0]; // 获取当天日期 YYYY-MM-DD
        
        // 检查是否点赞过该评论
        const isLiked = likedComments.includes(commentId);
        
        // 设置初始状态
        if (isLiked) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        
        button.addEventListener('click', function() {
            // 检查用户是否登录
            if (!localStorage.getItem('isLoggedIn')) {
                showToast('请先登录后再点赞');
                return;
            }
            
            // 重新获取最新状态，防止页面长时间打开导致状态不同步
            const currentLikedComments = JSON.parse(localStorage.getItem('likedComments') || '[]');
            const currentIsLiked = currentLikedComments.includes(commentId);
            
            const comments = JSON.parse(localStorage.getItem('postComments') || '{}');
            const comment = Object.values(comments)
                .flat()
                .find(c => c.id === commentId);
            
            if (comment) {
                // 如果没有当天的记录，创建一个空数组
                if (!userDailyLikes[today]) {
                    userDailyLikes[today] = [];
                }
                
                if (currentIsLiked) {
                    // 取消点赞
                    comment.likes = Math.max(0, (comment.likes || 0) - 1); // 确保点赞数不会小于0
                    const index = currentLikedComments.indexOf(commentId);
                    if (index !== -1) {
                        currentLikedComments.splice(index, 1);
                    }
                    button.classList.remove('active');
                    
                    // 从当天点赞记录中移除
                    const dailyIndex = userDailyLikes[today].indexOf(commentId);
                    if (dailyIndex !== -1) {
                        userDailyLikes[today].splice(dailyIndex, 1);
                    }
                    
                    showToast('已取消点赞');
                } else {
                    // 检查当天是否已经给这条评论点过赞
                    if (userDailyLikes[today].includes(commentId)) {
                        showToast('您今天已经给这条评论点过赞了');
                        return;
                    }
                    
                    // 点赞
                    comment.likes = (comment.likes || 0) + 1;
                    currentLikedComments.push(commentId);
                    userDailyLikes[today].push(commentId);
                    button.classList.add('active');
                    showToast('点赞成功');
                }
                
                // 更新数据
                localStorage.setItem('postComments', JSON.stringify(comments));
                localStorage.setItem('likedComments', JSON.stringify(currentLikedComments));
                localStorage.setItem('userDailyCommentLikes', JSON.stringify(userDailyLikes));
                button.querySelector('span').textContent = comment.likes;
            }
        });
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 获取分类文本
function getCategoryText(category) {
    const categoryMap = {
        'academic': '学术交流',
        'design': '设计讨论',
        'ai': 'AI技术',
        'media': '影视资源',
        'questions': '问答专区',
        'feedback': '反馈建议'
    };
    return categoryMap[category] || category;
}

// 显示错误信息
function showError(message) {
    const postContent = document.getElementById('postContent');
    postContent.innerHTML = `
        <div class="error-message">
            <i class="bi bi-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

/**
 * 显示一个提示消息
 * @param {string} message 要显示的消息内容
 */
function showToast(message) {
    // 检查是否已存在toast元素，如果存在则移除
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建新的toast元素
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    
    // 设置样式
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    
    // 添加到文档
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// 初始化分享功能
function initShareButton(postId) {
    const shareBtn = document.getElementById('shareBtn');
    
    shareBtn.addEventListener('click', function() {
        // 获取当前页面的完整URL
        const postUrl = window.location.href;
        
        // 复制链接到剪贴板
        navigator.clipboard.writeText(postUrl).then(() => {
            showToast('链接已复制到剪贴板');
        }).catch(err => {
            console.error('复制链接失败:', err);
            showToast('复制链接失败，请手动复制');
        });
    });
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput || !searchBtn) return;
    
    searchBtn.addEventListener('click', function() {
        performSearch();
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 在当前页面执行搜索
    function performSearch() {
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
        
        // 创建或获取搜索结果容器
        let searchResultsContainer = document.querySelector('.post-search-results');
        if (!searchResultsContainer) {
            searchResultsContainer = document.createElement('div');
            searchResultsContainer.className = 'post-search-results';
            
            // 将搜索结果容器添加到主容器中
            const postDetailContainer = document.querySelector('.post-detail-container');
            if (postDetailContainer) {
                postDetailContainer.appendChild(searchResultsContainer);
            }
        }
        
        // 清空之前的搜索结果
        searchResultsContainer.innerHTML = '';
        
        // 创建搜索结果标题和返回按钮
        const searchHeader = document.createElement('div');
        searchHeader.className = 'search-results-header';
        searchHeader.innerHTML = `
            <h2>搜索结果: "${searchText}"</h2>
            <button class="close-search-btn">
                <i class="bi bi-x"></i> 关闭搜索
            </button>
        `;
        searchResultsContainer.appendChild(searchHeader);
        
        // 搜索帖子并显示结果
        let resultsCount = 0;
        const matchedPosts = savedPosts.filter(post => {
            const title = post.title.toLowerCase();
            const author = post.author.toLowerCase();
            const content = post.content.toLowerCase();
            const category = post.category.toLowerCase();
            
            return title.includes(searchText) || 
                   author.includes(searchText) || 
                   content.includes(searchText) || 
                   category.includes(searchText);
        });
        
        if (matchedPosts.length > 0) {
            const resultsList = document.createElement('div');
            resultsList.className = 'search-results-list';
            
            matchedPosts.forEach(post => {
                // 格式化日期
                const postDate = new Date(post.date);
                const formattedDate = `${postDate.getFullYear()}-${(postDate.getMonth() + 1).toString().padStart(2, '0')}-${postDate.getDate().toString().padStart(2, '0')}`;
                
                // 创建帖子元素
                const postElement = document.createElement('div');
                postElement.className = 'search-result-item';
                
                // 高亮搜索关键词
                const highlightText = (text) => {
                    const regex = new RegExp(searchText, 'gi');
                    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
                };
                
                postElement.innerHTML = `
                    <h3><a href="post-detail.html?id=${post.id}">${highlightText(post.title)}</a></h3>
                    <div class="result-meta">
                        <span class="result-author">${highlightText(post.author)}</span>
                        <span class="result-date">${formattedDate}</span>
                        <span class="result-category">${getCategoryText(post.category)}</span>
                    </div>
                    <p class="result-excerpt">${highlightText(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
                `;
                
                resultsList.appendChild(postElement);
                resultsCount++;
            });
            
            searchResultsContainer.appendChild(resultsList);
        } else {
            // 显示无结果提示
            const noResults = document.createElement('div');
            noResults.className = 'no-search-results';
            noResults.innerHTML = `
                <i class="bi bi-search"></i>
                <p>未找到与"${searchText}"相关的内容</p>
                <p>请尝试其他关键词</p>
            `;
            searchResultsContainer.appendChild(noResults);
        }
        
        // 添加结果计数
        const resultsCountElement = document.createElement('div');
        resultsCountElement.className = 'results-count';
        resultsCountElement.textContent = `找到 ${resultsCount} 个结果`;
        searchHeader.appendChild(resultsCountElement);
        
        // 添加关闭搜索按钮事件
        const closeSearchBtn = searchResultsContainer.querySelector('.close-search-btn');
        if (closeSearchBtn) {
            closeSearchBtn.addEventListener('click', function() {
                // 隐藏搜索结果容器
                searchResultsContainer.style.display = 'none';
                
                // 恢复原帖子内容显示
                const postDetail = document.querySelector('.post-detail');
                const commentsSection = document.querySelector('.comments-section');
                const relatedPosts = document.querySelector('.related-posts');
                
                if (postDetail) postDetail.style.display = 'block';
                if (commentsSection) commentsSection.style.display = 'block';
                if (relatedPosts) relatedPosts.style.display = 'block';
                
                // 清空搜索框
                searchInput.value = '';
            });
        }
        
        // 显示搜索结果容器
        searchResultsContainer.style.display = 'block';
        
        // 隐藏正常的帖子内容
        const postDetail = document.querySelector('.post-detail');
        const commentsSection = document.querySelector('.comments-section');
        const relatedPosts = document.querySelector('.related-posts');
        
        if (postDetail) postDetail.style.display = 'none';
        if (commentsSection) commentsSection.style.display = 'none';
        if (relatedPosts) relatedPosts.style.display = 'none';
        
        // 滚动到搜索结果顶部
        searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
} 