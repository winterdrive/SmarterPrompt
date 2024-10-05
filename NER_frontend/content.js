document.addEventListener('mouseup', function (event) {
    const selectedText = window.getSelection().toString().trim();
    let existingBubble = document.getElementById('selectionBubble');
    let existingDialogBox = document.getElementById('dialogBox');

    // 如果點擊了泡泡以外的地方，且泡泡存在，則移除泡泡
    removeBubbleIfClickedOutside(event, existingBubble);

    // 只在選擇文本時創建泡泡
    if (selectedText.length > 0) {
        existingBubble?.remove();  // 如果已有泡泡存在，則移除
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

// 滑鼠懸停時標亮
function handleMouseOver(bubble) {
    bubble.style.background = 'lightblue';  // Highlight on hover
    bubble.style.transform = 'scale(1.1)';  // Slightly enlarge
}

// 滑鼠不懸停時回復原狀
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

        const dialogBox = createDialogBox(data.masked_text);
        appendButtonsToDialogBox(dialogBox, selectedText, data);
        document.body.appendChild(dialogBox);
        makeDraggable(dialogBox);

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
        border: '1px solid black',
        zIndex: 1001,
        maxWidth: '400px',
        maxHeight: '300px',
        minWidth: '200px',
        minHeight: '100px',
        overflow: 'auto'
    });
    dialogBox.innerText = maskedText;
    return dialogBox;
}

function appendButtonsToDialogBox(dialogBox, selectedText, data) {
    const copyButton = createButton('Copy to Clipboard', () => handleCopyToClipboard(data.masked_text));
    const classifyButton = createButton('Classify Text', () => handleClassifyText(selectedText));
    const closeButton = createButton('Close', () => dialogBox.remove());

    dialogBox.append(copyButton, classifyButton, closeButton);

    logMaskedEntities(data.masked_entities);
}

function createButton(text, onClickHandler) {
    const button = document.createElement('button');
    button.innerText = text;
    button.addEventListener('click', onClickHandler);
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

// Drag functionality (used for both the bubble and dialog box)
function makeDraggable(element) {
    let isDragging = false, offsetX, offsetY;

    element.addEventListener('mousedown', function (event) {
        isDragging = true;
        offsetX = event.clientX - element.getBoundingClientRect().left;
        offsetY = event.clientY - element.getBoundingClientRect().top;

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
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                element.style.transform = 'none';  // Reset translate effect
            });
        }
    }
}
