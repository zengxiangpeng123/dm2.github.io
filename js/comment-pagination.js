// 评论分页配置
const COMMENTS_PER_PAGE = 5; // 每页显示5条评论
const MAX_VISIBLE_PAGES = 5; // 最多显示的页码数

// // 初始化评论分页
// function initCommentPagination(totalComments) {
//     const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
//     const paginationContainer = document.getElementById('commentPagination');
//     if (!paginationContainer) return;

//     // 清空分页容器
//     paginationContainer.innerHTML = '';

//     // 如果总页数小于等于1，不显示分页
//     if (totalPages <= 1) return;

//     // 创建分页UI
//     const paginationList = document.createElement('ul');
//     paginationList.className = 'pagination-list';

//     // 添加上一页按钮
//     const prevButton = createCommentPaginationButton('上一页', 'prev');
//     paginationList.appendChild(prevButton);

//     // 生成页码按钮
//     generateCommentPageButtons(paginationList, 1, totalPages);

//     // 添加下一页按钮
//     const nextButton = createCommentPaginationButton('下一页', 'next');
//     paginationList.appendChild(nextButton);

//     paginationContainer.appendChild(paginationList);

//     // 初始化第一页为激活状态
//     updateCommentPaginationState(1, totalPages);
//     showCommentsForPage(1);
// }

// 生成页码按钮
function generateCommentPageButtons(container, currentPage, totalPages) {
    let pages = [];
    
    // 始终显示第一页
    pages.push(1);
    
    if (totalPages <= MAX_VISIBLE_PAGES) {
        // 如果总页数小于等于最大显示数，显示所有页码
        for (let i = 2; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // 复杂的分页逻辑
        if (currentPage <= 3) {
            // 当前页靠近开始
            pages.push(2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            // 当前页靠近结束
            pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            // 当前页在中间
            pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
    }
    
    // 创建页码按钮
    pages.forEach(page => {
        if (page === '...') {
            // 创建省略号
            const ellipsis = document.createElement('li');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            container.appendChild(ellipsis);
        } else {
            // 创建页码按钮
            const pageButton = createCommentPaginationButton(page);
            container.appendChild(pageButton);
        }
    });
}

// 创建分页按钮
function createCommentPaginationButton(content, type = 'page') {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'pagination-button';
    
    if (type === 'page') {
        button.setAttribute('data-page', content);
        button.textContent = content;
    } else {
        button.className += ` pagination-${type}`;
        button.textContent = content;
    }

    button.addEventListener('click', function() {
        if (type === 'page') {
            handleCommentPageClick(parseInt(content));
        } else {
            handleCommentNavigationClick(type);
        }
    });

    li.appendChild(button);
    return li;
}

// 处理页码点击
function handleCommentPageClick(pageNumber) {
    const totalComments = document.querySelectorAll('.comment-item').length;
    const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
    
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    // 重新生成分页按钮
    const paginationList = document.querySelector('#commentPagination .pagination-list');
    paginationList.innerHTML = '';
    
    // 添加上一页按钮
    const prevButton = createCommentPaginationButton('上一页', 'prev');
    paginationList.appendChild(prevButton);
    
    // 生成页码按钮
    generateCommentPageButtons(paginationList, pageNumber, totalPages);
    
    // 添加下一页按钮
    const nextButton = createCommentPaginationButton('下一页', 'next');
    paginationList.appendChild(nextButton);
    
    updateCommentPaginationState(pageNumber, totalPages);
    showCommentsForPage(pageNumber);
}

// 处理上一页/下一页点击
function handleCommentNavigationClick(type) {
    const currentPage = parseInt(document.querySelector('#commentPagination .pagination-button.active')?.getAttribute('data-page') || 1);
    const totalComments = document.querySelectorAll('.comment-item').length;
    const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
    
    let newPage = currentPage;
    if (type === 'prev' && currentPage > 1) {
        newPage = currentPage - 1;
    } else if (type === 'next' && currentPage < totalPages) {
        newPage = currentPage + 1;
    }
    
    handleCommentPageClick(newPage);
}

// 更新分页状态
function updateCommentPaginationState(currentPage, totalPages) {
    // 更新按钮状态
    document.querySelectorAll('#commentPagination .pagination-button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-page') === currentPage.toString()) {
            button.classList.add('active');
        }
    });

    // 更新导航按钮状态
    const prevButton = document.querySelector('#commentPagination .pagination-prev');
    const nextButton = document.querySelector('#commentPagination .pagination-next');
    
    if (prevButton) {
        prevButton.disabled = currentPage === 1;
    }
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
    }
}

// 显示指定页的评论
function showCommentsForPage(pageNumber) {
    const comments = document.querySelectorAll('.comment-item');
    const startIndex = (pageNumber - 1) * COMMENTS_PER_PAGE;
    const endIndex = startIndex + COMMENTS_PER_PAGE;

    comments.forEach((comment, index) => {
        if (index >= startIndex && index < endIndex) {
            comment.style.display = '';
        } else {
            comment.style.display = 'none';
        }
    });
} 