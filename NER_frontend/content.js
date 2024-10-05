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
        bubble.addEventListener('click', () => handleBubbleClick(selectedText, bubble, existingDialogBox));

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
function handleBubbleClick(selectedText, bubble, existingDialogBox) {
    console.log(selectedText);

    fetch('http://127.0.0.1:5000/mask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({string: selectedText})
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            existingDialogBox?.remove();  // Remove existing dialog box

            // 將 masked_entities 存入 sessionStorage
            storeReferenceMap(data.masked_entities);

            const dialogBox = createDialogBox(data.masked_text);
            appendButtonsToDialogBox(dialogBox, selectedText, data);
            document.body.appendChild(dialogBox);

            // 限制只能通過十字箭頭進行拖曳
            const dragHandle = createDragHandle(dialogBox);
            dialogBox.appendChild(dragHandle);
            makeDraggable(dragHandle, dialogBox);

            bubble.remove();  // Remove bubble after dialog box appears
        })
        .catch(error => console.error('Error:', error));
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
        padding: '20px',
        border: '1px solid #007BFF',
        borderRadius: '8px',
        zIndex: 1001,
        maxWidth: '400px',
        maxHeight: '300px',
        minWidth: '200px',
        minHeight: '100px',
        overflow: 'auto',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center'
    });
    dialogBox.innerText = maskedText;
    return dialogBox;
}

// 修改 appendButtonsToDialogBox，增加「還原原始文字」按鈕
function appendButtonsToDialogBox(dialogBox, selectedText, data) {
    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '20px',
    });

    const copyButton = createButton('Copy to Clipboard', () => handleCopyToClipboard(data.masked_text));
    const classifyButton = createButton('Classify Text', () => handleClassifyText(selectedText));
    const closeButton = createButton('Close', () => dialogBox.remove());

    // 新增還原原始文字按鈕
    const restoreButton = createButton('Restore Original', () => {
        const originalText = restoreOriginalText(data.masked_text);
        alert(`Restored Text: ${originalText}`);
    });

    buttonContainer.append(copyButton, classifyButton, restoreButton, closeButton);
    dialogBox.append(buttonContainer);

    logMaskedEntities(data.masked_entities);
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
        .then(() => console.log('Text copied to clipboard'))
        .catch(err => console.error('Could not copy text: ', err));
}

function handleClassifyText(selectedText) {
    chrome.runtime.sendMessage({action: 'classify', text: selectedText}, response => {
        console.log('Classification Result:', response);
        alert(`Classification Result: ${JSON.stringify(response)}`);
    });
}

function logMaskedEntities(maskedEntities) {
    maskedEntities.forEach(entity => {
        console.log(`Label: ${entity.label}`);
        console.log(`Mask: ${entity.mask}`);
        console.log(`Original Value: ${entity.original_value}`);
    });
}

function createDragHandle(dialogBox) {
    const dragHandle = document.createElement('div');
    dragHandle.innerText = '⇔';
    Object.assign(dragHandle.style, {
        cursor: 'move',
        position: 'absolute',
        top: '0',
        right: '0',
        background: '#ccc',
        padding: '5px',
        border: '1px solid black'
    });
    return dragHandle;
}

function makeDraggable(handle, dialogBox) {
    let isDragging = false, offsetX, offsetY;

    handle.addEventListener('mousedown', function (event) {
        isDragging = true;
        const rect = dialogBox.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        document.addEventListener('mousemove', onMouseMove);
        event.stopPropagation();  // Prevent unwanted propagation
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
