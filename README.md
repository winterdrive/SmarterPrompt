## TODO List
0. 請幫我撰寫回信
1.
    - [X] 修改 bubble 的 click 事件，改為呼叫 FAKE API 取得 response，並顯示在對話框內
2.
    - [X] bubble hover 時標亮
3.
    - [X] 讓對話框 (dialogBox) 及 bubble 接可被拖曳移動
4.
    - [X] 新增對話框內 (dialogBox) 關閉鍵，可關閉對話框
5.
    - [X] 對話框請使用 singleton 設計，即一個視窗只能有一個對話框
6.
    - [X] 泡泡與對話框按以下規則進行呈現：
        - 點擊泡泡：出現對話框，泡泡消失，即泡泡與對話框不會同時存在
        - 只有泡泡存在 + 點擊泡泡外的地方：泡泡消失
        - 只有對話框存在 + 點擊關閉鍵以外的任何地方：不做任何事
        - 只有對話框存在 + 點擊關閉鍵：對話框消失
7.
    - [X] 限制對話框 (dialogBox) 的最大寬度、最大高度、最小寬度、最小高度
8.
    - [X] 新增複製鍵，可讓對話框內 (dialogBox) 的文字可一鍵複製至剪貼簿
9.
    - [X] 導入 NER model，讓機敏文字可被替換成 masked text (暫時用 API)
10.
    - [X] 新增機敏文字 mask 前 (key) 及 mask 後 (value) 的 reference map 至 session storage，以便後續復原原文使用
11.
    - [X] 只能透過拖曳十字箭頭移動對話框 (dialogBox) 位置，不可透過其他位置拖曳移動
12.
    - [ ] Prompt improve 按鈕功能實作 (請使用transformer.js)

Pending:

1.
    - [ ] 新增按鈕可讓使用者將 masked text 按 session storage 內的 reference map 轉換回原文字 (目前先不處理，因為 UX
      好像不順)
