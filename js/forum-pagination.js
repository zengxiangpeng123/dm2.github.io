// 分页配置
const POSTS_PER_PAGE = 5; // 每页显示5篇帖子
const MAX_VISIBLE_PAGES = 5; // 最多显示的页码数

// 当前显示的帖子（可能经过分类筛选）
let currentVisiblePosts = [];
// 当前分类
let currentCategory = 'all';
// 当前页码
let currentPageNumber = 1;

// 初始化分页
function initPagination(totalPosts) {
    // 获取所有帖子元素
    const allPosts = document.querySelectorAll('.forum-post');
    
    console.log(`初始化分页，总帖子数: ${totalPosts}, 实际DOM元素数: ${allPosts.length}`);
    
    // 初始时，所有帖子都是可见的
    currentVisiblePosts = Array.from(allPosts);
    
    // 初始化分类点击事件
    initCategoryFilter();
    
    // 更新分页UI
    updatePagination();
    
    // 显示第一页
    showPostsForPage(1);
}

// 重新初始化分页系统 - 用于发帖或其他帖子更新后调用
function reinitializePagination() {
    // 重新获取所有帖子元素
    const allPosts = document.querySelectorAll('.forum-post');
    
    console.log(`重新初始化分页，实际DOM元素数: ${allPosts.length}`);
    
    // 更新当前分类下的可见帖子
    updateVisiblePosts(currentCategory);
    
    // 更新分页UI
    updatePagination();
    
    // 显示第一页
    currentPageNumber = 1;
    showPostsForPage(1);
}

// 初始化分类点击事件
function initCategoryFilter() {
    const categoryItems = document.querySelectorAll('.forum-category');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有分类的active类
            categoryItems.forEach(cat => cat.classList.remove('active'));
            
            // 给当前点击的分类添加active类
            this.classList.add('active');
            
            // 获取选中的分类
            const selectedCategory = this.getAttribute('data-category');
            
            // 保存当前分类
            currentCategory = selectedCategory;
            
            // 更新显示的帖子
            updateVisiblePosts(selectedCategory);
            
            // 重置为第一页
            currentPageNumber = 1;
            
            // 更新分页
            updatePagination();
            
            // 显示第一页
            showPostsForPage(1);
        });
    });
}

// 根据选中的分类更新可见帖子
function updateVisiblePosts(category) {
    const allPosts = document.querySelectorAll('.forum-post');
    
    console.log(`更新分类: ${category}, 所有帖子数量: ${allPosts.length}`);
    
    // 如果选择"全部帖子"，则显示所有帖子
    if (category === 'all') {
        currentVisiblePosts = Array.from(allPosts);
    } else {
        // 否则，只显示符合分类的帖子
        currentVisiblePosts = Array.from(allPosts).filter(post => {
            // 获取帖子的分类（存储在data-category属性中）
            const postCategory = post.getAttribute('data-category');
            return postCategory === category;
        });
    }
    
    console.log(`更新后可见帖子数量: ${currentVisiblePosts.length}`);
    
    // 更新所有帖子的显示状态
    allPosts.forEach(post => {
        if (currentVisiblePosts.includes(post)) {
            post.classList.add('category-visible'); // 用于CSS选择器
        } else {
            post.classList.remove('category-visible');
        }
    });
    
    // 如果没有找到匹配的帖子，显示提示信息
    const forumPosts = document.getElementById('forumPosts');
    const noPostsMsg = document.getElementById('noPosts');
    
    if (currentVisiblePosts.length === 0) {
        if (!noPostsMsg) {
            const msg = document.createElement('div');
            msg.id = 'noPosts';
            msg.className = 'no-posts-message';
            msg.innerHTML = `
                <i class="bi bi-exclamation-circle"></i>
                <p>该分类下暂无帖子</p>
            `;
            forumPosts.appendChild(msg);
        } else {
            noPostsMsg.style.display = 'flex';
        }
    } else if (noPostsMsg) {
        noPostsMsg.style.display = 'none';
    }
}

// // 更新分页UI
// function updatePagination() {
//     const paginationContainer = document.getElementById('pagination');
//     if (!paginationContainer) return;
    
//     // 清空分页容器
//     paginationContainer.innerHTML = '';
    
//     // 计算总页数
//     const totalPages = Math.ceil(currentVisiblePosts.length / POSTS_PER_PAGE);
    
//     console.log(`总页数: ${totalPages}, 当前页: ${currentPageNumber}`);
    
//     // 如果总页数小于等于1，不显示分页
//     if (totalPages <= 1) {
//         paginationContainer.style.display = 'none';
//         return;
//     } else {
//         paginationContainer.style.display = 'block';
//     }
    
//     // 确保当前页码在有效范围内
//     if (currentPageNumber > totalPages) {
//         currentPageNumber = totalPages;
//     }
    
//     // 创建分页UI
//     const paginationList = document.createElement('ul');
//     paginationList.className = 'pagination-list';
    
//     // 添加上一页按钮
//     const prevButton = createPaginationButton('上一页', 'prev');
//     paginationList.appendChild(prevButton);
    
//     // 生成页码按钮
//     generatePageButtons(paginationList, currentPageNumber, totalPages);
    
//     // 添加下一页按钮
//     const nextButton = createPaginationButton('下一页', 'next');
//     paginationList.appendChild(nextButton);
    
//     paginationContainer.appendChild(paginationList);
    
//     // 更新分页状态
//     updatePaginationState(currentPageNumber, totalPages);
// }

// // 生成页码按钮
// function generatePageButtons(container, currentPage, totalPages) {
//     let pages = [];
    
//     // 始终显示第一页
//     pages.push(1);
    
//     if (totalPages <= MAX_VISIBLE_PAGES) {
//         // 如果总页数小于等于最大显示数，显示所有页码
//         for (let i = 2; i <= totalPages; i++) {
//             pages.push(i);
//         }
//     } else {
//         // 复杂的分页逻辑
//         if (currentPage <= 3) {
//             // 当前页靠近开始
//             pages.push(2, 3, 4, '...', totalPages);
//         } else if (currentPage >= totalPages - 2) {
//             // 当前页靠近结束
//             pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//         } else {
//             // 当前页在中间
//             pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
//         }
//     }
    
//     // 创建页码按钮
//     pages.forEach(page => {
//         if (page === '...') {
//             // 创建省略号
//             const ellipsis = document.createElement('li');
//             ellipsis.className = 'pagination-ellipsis';
//             ellipsis.textContent = '...';
//             container.appendChild(ellipsis);
//         } else {
//             // 创建页码按钮
//             const pageButton = createPaginationButton(page);
//             container.appendChild(pageButton);
//         }
//     });
// }

// // 创建分页按钮
// function createPaginationButton(content, type = 'page') {
//     const li = document.createElement('li');
//     const button = document.createElement('button');
//     button.className = 'pagination-button';
    
//     if (type === 'page') {
//         button.setAttribute('data-page', content);
//         button.textContent = content;
//     } else {
//         button.className += ` pagination-${type}`;
//         button.textContent = content;
//     }

//     button.addEventListener('click', function() {
//         if (type === 'page') {
//             handlePageClick(parseInt(content));
//         } else {
//             handleNavigationClick(type);
//         }
//     });

//     li.appendChild(button);
//     return li;
// }

// // 处理页码点击
// function handlePageClick(pageNumber) {
//     // 保存当前页码
//     currentPageNumber = pageNumber;
    
//     console.log(`点击页码: ${pageNumber}, 当前分类: ${currentCategory}`);
    
//     const totalPages = Math.ceil(currentVisiblePosts.length / POSTS_PER_PAGE);
    
//     if (pageNumber < 1 || pageNumber > totalPages) return;
    
//     // 更新分页UI
//     updatePagination();
    
//     // 显示对应页的帖子
//     showPostsForPage(pageNumber);
// }

// // 处理上一页/下一页点击
// function handleNavigationClick(type) {
//     const totalPages = Math.ceil(currentVisiblePosts.length / POSTS_PER_PAGE);
    
//     if (type === 'prev' && currentPageNumber > 1) {
//         currentPageNumber--;
//     } else if (type === 'next' && currentPageNumber < totalPages) {
//         currentPageNumber++;
//     }
    
//     console.log(`导航按钮: ${type}, 新页码: ${currentPageNumber}`);
    
//     // 更新分页UI
//     updatePagination();
    
//     // 显示对应页的帖子
//     showPostsForPage(currentPageNumber);
// }

// // 更新分页状态
// function updatePaginationState(currentPage, totalPages) {
//     // 更新按钮状态
//     document.querySelectorAll('.pagination-button').forEach(button => {
//         button.classList.remove('active');
//         if (button.getAttribute('data-page') === currentPage.toString()) {
//             button.classList.add('active');
//         }
//     });

//     // 更新导航按钮状态
//     const prevButton = document.querySelector('.pagination-prev');
//     const nextButton = document.querySelector('.pagination-next');
    
//     if (prevButton) {
//         prevButton.disabled = currentPage === 1;
//     }
//     if (nextButton) {
//         nextButton.disabled = currentPage === totalPages;
//     }
// }

// // 显示指定页的帖子
// function showPostsForPage(pageNumber) {
//     console.log(`显示第 ${pageNumber} 页的帖子, 共 ${currentVisiblePosts.length} 篇可见帖子`);
    
//     const startIndex = (pageNumber - 1) * POSTS_PER_PAGE;
//     const endIndex = startIndex + POSTS_PER_PAGE;

//     // 显示/隐藏当前页的帖子
//     currentVisiblePosts.forEach((post, index) => {
//         if (index >= startIndex && index < endIndex) {
//             post.style.display = '';
//         } else {
//             post.style.display = 'none';
//         }
//     });
    
//     // 确保所有非当前分类的帖子都是隐藏的
//     const allPosts = document.querySelectorAll('.forum-post');
//     allPosts.forEach(post => {
//         if (!currentVisiblePosts.includes(post)) {
//             post.style.display = 'none';
//         }
//     });
// } 