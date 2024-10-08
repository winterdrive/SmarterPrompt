// background.js - Handles requests from the UI, runs the model, then sends back a response

// import {pipeline, env} from '@huggingface/transformers';
import {pipeline, env} from '@xenova/transformers';

// Skip initial check for local models, since we are not loading any local models.
env.allowLocalModels = false;

// Due to a bug in onnxruntime-web, we must disable multithreading for now.
// See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
env.backends.onnx.wasm.numThreads = 1;


class PipelineSingleton {
    static task = 'text-generation';
    // static model = 'Xenova/distilgpt2'; // it works, but not very good
    // static model = 'Xenova/llama-160m'; // it works, but not very good
    static model = 'Xenova/Qwen1.5-0.5B-Chat'; // it works, and it's good
    // static model = 'Xenova/bert-base-NER'; // haven't tried yet, it's an NER model
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {progress_callback});
        }
        console.log('instance', this.instance)
        return this.instance;
    }
}

// Create generic classify function, which will be reused for the different types of events.
const improve = async (text, streamResponse) => {
    let model = await PipelineSingleton.getInstance();

    const messages = [
        {role: "system", content: "你是一個專業的Prompt改進器。"},
        {
            role: "user",
            content: `
                給定一個原始的提示，請將其優化以提供更多的上下文，
                並提高語言的清晰度和精確性，使結果更符合目標需求。
                本次須改進的task prompt如下： 
                <task>
                ${text}
                </task>
                `
        },
    ];

    const callback_function = (beams) => {
        let partial_text = model.tokenizer.decode(beams[0].output_token_ids, {skip_special_tokens: true});

        // 過濾掉 "system" 和 "user" 等不必要的標籤
        // partial_text = partial_text.replace(/(system|user|assistant)/g, '').trim();
        // console.log('partial_text', partial_text);
        streamResponse(partial_text);  // 傳回過濾後的片段
    };

    // 以流式回傳生成內容
    await model(messages, {max_new_tokens: 128, callback_function});
};


////////////////////// 2. Message Events /////////////////////
//
// Listen for messages from the UI, process it, and send the result back.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== 'improve') return; // Ignore other actions

    // Stream text as it is generated
    (async function () {
        const streamResponse = (textUpdate) => {
            // 只傳送 assistant 角色內容
            const assistantIndex = textUpdate.indexOf('assistant');
            if (assistantIndex !== -1) {
                textUpdate = textUpdate.slice(assistantIndex + 'assistant'.length).trim();
            }
            // textUpdate = assistant_resp[1].trim()
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'streamUpdate',
                text: textUpdate
            });
        };

        // Perform the streaming task
        await improve(message.text, streamResponse);

        // Notify completion
        chrome.tabs.sendMessage(sender.tab.id, {
            action: 'streamComplete',
            text: 'Text generation complete'
        });
    })();

    return true;  // Keeps the connection open for asynchronous response
});
//////////////////////////////////////////////////////////////

