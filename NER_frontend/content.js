document.addEventListener('mouseup', function (event) {
    let selectedText = window.getSelection().toString().trim();
    let existingBubble = document.getElementById('selectionBubble');
    let existingDialogBox = document.getElementById('dialogBox');

    // 如果點擊了泡泡以外的地方，且泡泡存在，則移除泡泡
    if (existingBubble && !existingBubble.contains(event.target)) {
        existingBubble.remove(); // 移除泡泡
    }

    // 只在選擇文本時創建泡泡
    if (selectedText.length > 0) {
        // 如果已有泡泡存在，則移除
        if (existingBubble) {
            existingBubble.remove();
        }

        // 創建泡泡
        let bubble = document.createElement('div');
        bubble.id = 'selectionBubble';
        bubble.innerText = '💬';
        bubble.style.position = 'absolute';
        bubble.style.left = `${event.pageX + 10}px`;
        bubble.style.top = `${event.pageY + 10}px`;
        bubble.style.background = 'blue';
        bubble.style.color = 'white';
        bubble.style.borderRadius = '50%';
        bubble.style.padding = '5px';
        bubble.style.cursor = 'pointer';
        bubble.style.zIndex = 1000;
        bubble.style.transition = 'background-color 0.3s ease, transform 0.3s ease';  // 加入過渡效果

        document.body.appendChild(bubble);

        // 滑鼠懸停時標亮
        bubble.addEventListener('mouseover', function () {
            bubble.style.background = 'lightblue';  // 變亮的顏色
            bubble.style.transform = 'scale(1.1)';  // 略微放大
        });

        bubble.addEventListener('mouseout', function () {
            bubble.style.background = 'blue';  // 回到原色
            bubble.style.transform = 'scale(1)';  // 恢復原來大小
        });

        // 點擊泡泡後呼叫 API 並顯示對話框
        bubble.addEventListener('click', function () {
            console.log(selectedText);
            fetch('http://127.0.0.1:5000/reverse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ string: selectedText })
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);

                    // 檢查是否已有對話框存在
                    if (existingDialogBox) {
                        existingDialogBox.remove(); // 移除舊的對話框
                    }

                    // 創建新的對話框
                    let dialogBox = document.createElement('div');
                    dialogBox.id = 'dialogBox';
                    dialogBox.style.position = 'fixed';
                    dialogBox.style.left = '50%';
                    dialogBox.style.top = '50%';
                    dialogBox.style.transform = 'translate(-50%, -50%)';
                    dialogBox.style.background = 'white';
                    dialogBox.style.padding = '20px';
                    dialogBox.style.border = '1px solid black';
                    dialogBox.style.zIndex = 1001;
                    dialogBox.style.maxWidth = '400px';  // 限制最大寬度
                    dialogBox.style.maxHeight = '300px'; // 限制最大高度
                    dialogBox.style.minWidth = '200px';  // 限制最小寬度
                    dialogBox.style.minHeight = '100px'; // 限制最小高度
                    dialogBox.style.overflow = 'auto'; // 超出顯示滾動條
                    dialogBox.innerText = data.reversed_string;

                    // 創建複製按鈕
                    let copyButton = document.createElement('button');
                    copyButton.innerText = 'Copy to Clipboard';
                    copyButton.addEventListener('click', function () {
                        navigator.clipboard.writeText(data.reversed_string)
                            .then(() => {
                                console.log('Text copied to clipboard');
                            })
                            .catch(err => {
                                console.error('Could not copy text: ', err);
                            });
                    });

                    let classifyButton = document.createElement('button');
                    classifyButton.innerText = 'Classify Text';
                    classifyButton.addEventListener('click', function () {
                        chrome.runtime.sendMessage({ action: 'classify', text: selectedText }, function(response) {
                            console.log('Classification Result:', response);
                            alert(`Classification Result: ${JSON.stringify(response)}`);
                        });
                    });

                    let closeButton = document.createElement('button');
                    closeButton.innerText = 'Close';
                    closeButton.addEventListener('click', function () {
                        dialogBox.remove();
                    });

                    // 將按鈕添加到對話框
                    dialogBox.appendChild(copyButton);
                    dialogBox.appendChild(classifyButton);
                    dialogBox.appendChild(closeButton);
                    document.body.appendChild(dialogBox);

                    // 添加拖曳功能
                    makeDraggable(dialogBox);

                    // 移除泡泡，因為對話框已經出現
                    bubble.remove();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });

        // 添加拖曳功能
        makeDraggable(bubble);
    }
});

// 拖曳功能 (通用於對話框和泡泡)
function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', function (event) {
        isDragging = true;
        offsetX = event.clientX - element.getBoundingClientRect().left;
        offsetY = event.clientY - element.getBoundingClientRect().top;

        // Prevent mouseup from triggering outside
        event.stopPropagation(); // Prevents the mouseup event from propagating

        document.addEventListener('mousemove', onMouseMove);
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
        }
    });

    function onMouseMove(event) {
        if (isDragging) {
            requestAnimationFrame(function () {
                let x = event.clientX - offsetX;
                let y = event.clientY - offsetY;
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                element.style.transform = 'none';  // 清除translate效果，保證拖曳位置正確
            });
        }
    }
}

//TODO
//    [X] 1. 修改 bubble 的 click 事件，改為呼叫 FAKE API 取得 response，並顯示在對話框內
//    [X] 2. bubble hover 時標亮
//    [X] 3. 讓對話框 (dialogBox) 及 bubble 接可被拖曳移動
//    [X] 4. 新增對話框內 (dialogBox) 關閉鍵，可關閉對話框
//    [X] 5. 對話框請使用singleton設計，即一個視窗只能有一個對話框
//    [X] 6. 泡泡與對話框按以下規則進行呈現：
//           - 點擊泡泡：出現對話框，泡泡消失，即泡泡與對話框不會同時存在
//           - 只有泡泡存在 + 點擊泡泡外的地方：泡泡消失
//           - 只有對話框存在 + 點擊關閉鍵以外的任何地方：不做任何事
//           - 只有對話框存在 + 點擊關閉鍵：對話框消失
//    [X] 7. 限制對話框 (dialogBox) 的最大寬度、最大高度、最小寬度、最小高度
//    [X] 8. 新增複製鍵，可讓對話框內 (dialogBox) 的文字可一鍵複製至剪貼簿
//    [ ] 9. 導入NER model，讓機敏文字可被替換成 masked text
//    [ ] 9. 新增機敏文字 mask前 (key)及 mask後 (value)的 reference map 至 session storage，以便後續復原原文使用
//    [ ] 10. 新增按鈕可讓使用者將 masked text 按 session storage 內的 reference map 轉換回原文字

