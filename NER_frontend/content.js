document.addEventListener('mouseup', function (event) {
    const selectedText = window.getSelection().toString().trim();
    let existingBubble = document.getElementById('selectionBubble');
    let existingDialogBox = document.getElementById('dialogBox');

    removeBubbleIfClickedOutside(event, existingBubble);

    if (selectedText.length > 0) {
        existingBubble?.remove();  // Remove any existing bubble if present
        const bubble = createBubble(event.pageX, event.pageY);

        document.body.appendChild(bubble);

        // Add event listeners for bubble interaction
        bubble.addEventListener('mouseover', () => handleMouseOver(bubble));
        bubble.addEventListener('mouseout', () => handleMouseOut(bubble));
        bubble.addEventListener('click', () => handleBubbleClick(selectedText, 'zh', bubble, existingDialogBox));

        makeDraggable(bubble);  // Make the bubble draggable
    }
});

function removeBubbleIfClickedOutside(event, existingBubble) {
    if (existingBubble && !existingBubble.contains(event.target)) {
        existingBubble.remove();  // Remove bubble if clicked outside
    }
}

function createBubble(x, y) {
    const bubble = document.createElement('div');
    bubble.id = 'selectionBubble';
    bubble.innerText = '💬';
    Object.assign(bubble.style, {
        position: 'absolute',
        left: `${x + 10}px`,
        top: `${y + 10}px`,
        background: 'blue',
        color: 'white',
        borderRadius: '50%',
        padding: '5px',
        cursor: 'pointer',
        zIndex: 1000,
        transition: 'background-color 0.3s ease, transform 0.3s ease'
    });
    return bubble;
}

function handleMouseOver(bubble) {
    bubble.style.background = 'lightblue';  // Highlight on hover
    bubble.style.transform = 'scale(1.1)';  // Slightly enlarge
}

function handleMouseOut(bubble) {
    bubble.style.background = 'blue';  // Revert color
    bubble.style.transform = 'scale(1)';  // Revert size
}

// 呼叫 API 並顯示對話框
function handleBubbleClick(selectedText, language, bubble, existingDialogBox) {
    callMaskAPI(selectedText, language)
        .then(data => {
            existingDialogBox?.remove();  // Remove existing dialog box

            // Store masked_entities in sessionStorage
            storeReferenceMap(data.masked_entities);

            const dialogBox = createDialogBox(data.masked_text);
            logMaskedEntities(data.masked_entities);
            document.body.appendChild(dialogBox);

            bubble.remove();  // Remove bubble after dialog box appears
        })
        .catch(error => console.error('Error:', error));
}


function callMaskAPI(selectedText, language) {
    return fetch('http://127.0.0.1:5000/mask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({string: selectedText, language: language})
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error:', error);
        throw error; // 傳遞錯誤到調用的地方
    });
}

function createDialogBox(maskedText) {
    const dialogBox = document.createElement('div');
    dialogBox.id = 'dialogBox';
    Object.assign(dialogBox.style, {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '0',
        border: '1px solid #007BFF',
        borderRadius: '8px',
        zIndex: 1001,
        maxWidth: '400px',
        minWidth: '200px',
        minHeight: '100px',
        overflow: 'auto',  // 確保內容可以滾動
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center'
    });

    // 創建 header 和按鈕的容器
    const headerContainer = document.createElement('div');
    Object.assign(headerContainer.style, {
        display: 'flex',
        flexDirection: 'column'
    });

    // 創建 header bar
    const headerBar = document.createElement('div');
    Object.assign(headerBar.style, {
        width: '100%',
        backgroundColor: '#007BFF',
        color: 'white',
        padding: '5px',
        cursor: 'move',
        textAlign: 'left',
        position: 'relative',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        zIndex: 1002
    });
    headerBar.innerText = 'Smarter Prompt';

    // 創建關閉按鈕
    const closeButton = document.createElement('button');
    closeButton.innerText = '✖';
    Object.assign(closeButton.style, {
        position: 'absolute',
        right: '10px',
        top: '3px',
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px'
    });
    closeButton.addEventListener('click', () => dialogBox.remove());

    // 將關閉按鈕添加到 header bar
    headerBar.appendChild(closeButton);
    headerContainer.appendChild(headerBar);

    // 創建按鈕容器
    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '10px',
        marginBottom: '10px',
    });

    // 創建各種按鈕
    const copyButton = createButton('複製\n結果', () => handleCopyToClipboard(maskedText));
    const englishModelButton = createButton('英文\n模型', () => handleEnglishNER(maskedText)); //TODO
    const improveButton = createButton('增強\n提示詞', () => handleImprovePromptTask(maskedText));
    const restoreButton = createButton('復原\n資料', () => {
        const originalText = restoreOriginalText(maskedText);
        alert(`Restored Text: ${originalText}`);
    });

    buttonContainer.append(copyButton, restoreButton, englishModelButton, improveButton);
    headerContainer.appendChild(buttonContainer);
    dialogBox.appendChild(headerContainer);

    // 創建內容區
    const content = document.createElement('div');
    content.innerText = maskedText;
    content.style.overflowY = 'auto';  // 允許內容區滾動
    content.style.maxHeight = '200px';  // 限制內容區的最大高度
    content.style.padding = '10px';  // 添加一些內邊距
    dialogBox.appendChild(content);

    // 為 header bar 啟用拖曳功能
    makeDraggable(headerBar, dialogBox);

    return dialogBox;
}


// 創建按鈕
function createButton(text, onClickHandler) {
    const button = document.createElement('button');
    button.innerText = text;
    Object.assign(button.style, {
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s',
        margin: '0 5px',
        width: '120px'
    });
    button.addEventListener('click', onClickHandler);
    button.addEventListener('mouseover', () => button.style.backgroundColor = '#0056b3');
    button.addEventListener('mouseout', () => button.style.backgroundColor = '#007BFF');
    return button;
}

function handleCopyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert('文字已複製到剪貼簿'))
        .catch(err => console.error('Could not copy text: ', err));
}

function handleEnglishNER(selectedText) {
    // TODO 透過調用 mask API 並指定語言為英文，獲取 masked_text
    chrome.runtime.sendMessage({action: 'classify', text: selectedText}, response => {
        console.log('Classification Result:', response);
        alert(`Classification Result: ${JSON.stringify(response)}`);
    });
}

function handleImprovePromptTask(maskedText) {
    // TODO 透過 API 改進 maskedText，API 回傳改進後的結果
    chrome.runtime.sendMessage({action: 'improve', text: maskedText}, response => {
        console.log('Improve Prompt Result:', response);
        alert(`Improve Prompt Result: ${JSON.stringify(response)}`);
    });
}

function logMaskedEntities(maskedEntities) {
    maskedEntities.forEach(entity => {
        console.log(`Label: ${entity.label}`);
        console.log(`Mask: ${entity.mask}`);
        console.log(`Original Value: ${entity.original_value}`);
    });
}


// 將拖曳功能綁定到 header bar
function makeDraggable(handle, dialogBox) {
    let isDragging = false, offsetX, offsetY;

    handle.addEventListener('mousedown', function (event) {
        // 檢查 handle 和 dialogBox 是否存在
        if (!dialogBox || !handle) {
            console.log('等待模型生成結果中...');
            return;
        }

        isDragging = true;
        const rect = dialogBox.getBoundingClientRect(); // 這裡可能會報錯
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        document.addEventListener('mousemove', onMouseMove);
        event.stopPropagation();  // 防止事件冒泡
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
        }
    });

    function onMouseMove(event) {
        if (isDragging) {
            requestAnimationFrame(() => {
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;
                dialogBox.style.left = `${x}px`;
                dialogBox.style.top = `${y}px`;
                dialogBox.style.transform = 'none';  // 清除translate效果，保證拖曳位置正確
            });
        }
    }
}

// 10. 將 mask 前的 key 和 mask 後的 value 儲存在 sessionStorage 中
function storeReferenceMap(maskedEntities) {
    const referenceMap = {};
    maskedEntities.forEach(entity => {
        referenceMap[entity.mask] = entity.original_value;
    });
    // 將 reference map 存儲到 sessionStorage
    sessionStorage.setItem('referenceMap', JSON.stringify(referenceMap));
}

// 11. 將 masked text 根據 sessionStorage 中的 reference map 還原
function restoreOriginalText(maskedText) {
    // TODO
    return "TODO";
}
