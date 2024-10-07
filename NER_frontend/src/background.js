// background.js - Handles requests from the UI, runs the model, then sends back a response

// import {pipeline, env} from '@huggingface/transformers';
import {pipeline, env} from '@xenova/transformers';

// Skip initial check for local models, since we are not loading any local models.
env.allowLocalModels = false;

// Due to a bug in onnxruntime-web, we must disable multithreading for now.
// See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
env.backends.onnx.wasm.numThreads = 1;


class PipelineSingleton {
    // static task = 'text-generation';
    // static model = 'onnx-community/Llama-3.2-1B-Instruct';
    static task = 'text-generation';
    static model = 'Xenova/distilgpt2';
    // static model = 'Xenova/bert-base-NER';
    // static task = 'text-classification';
    // static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
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
const improve = async (text) => {
    // Get the pipeline instance. This will load and build the model when run for the first time.
    let model = await PipelineSingleton.getInstance((data) => {
        // You can track the progress of the pipeline creation here.
        // e.g., you can send `data` back to the UI to indicate a progress bar
        // console.log('progress', data)
    });

    const messages = [
        {role: "system", content: "You are a helpful assistant for improving the prompt."},
        {role: "user", content: `improve the following task prompt ${text}</prompt>`},
    ];

    // Actually run the model on the input text
    let result = await model(messages, {max_new_tokens: 128});
    // let result = await model(text);
    return result;
};

////////////////////// 2. Message Events /////////////////////
//
// Listen for messages from the UI, process it, and send the result back.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('sender', sender)
    if (message.action !== 'improve') return; // Ignore messages that are not meant for classification.

    // Run model prediction asynchronously
    (async function () {
        // Perform classification
        let result = await improve(message.text);

        // Send response back to UI
        sendResponse(result);
    })();

    // return true to indicate we will send a response asynchronously
    // see https://stackoverflow.com/a/46628145 for more information
    return true;
});
//////////////////////////////////////////////////////////////

