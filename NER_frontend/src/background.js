// background.js - Handles requests from the UI, runs the model, then sends back a response

import { pipeline, env } from '@xenova/transformers';

// Skip initial check for local models, since we are not loading any local models.
env.allowLocalModels = false;

// Due to a bug in onnxruntime-web, we must disable multithreading for now.
// See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
env.backends.onnx.wasm.numThreads = 1;

class PipelineSingleton {
    static task = 'text-generation';
    static model = 'onnx-community/Llama-3.2-1B-Instruct';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }

        return this.instance;
    }
}

// Function to generate response from the model
const generateResponse = async (message) => {
    // Get the pipeline instance (loads the model the first time it's run).
    let model = await PipelineSingleton.getInstance((data) => {
        // Optional: Send progress data back to UI if necessary
        // console.log('progress', data);
    });

    // Define conversation structure
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
    ];

    // Run the model to generate a response
    let result = await model(messages, { max_new_tokens: 128 });

    // Extract the generated text from the response
    return result[0].generated_text;
};

////////////////////// 1. Context Menus //////////////////////
//
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
// Ensure permissions are granted and contextMenus API is available
chrome.runtime.onInstalled.addListener(function () {
    // Create a context menu item that shows up when text is selected.
    chrome.contextMenus.create({
        id: 'ask-question',
        title: 'Ask "%s"',
        contexts: ['selection'],
    });

    // Add the click handler for the context menu.
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId === 'ask-question' && info.selectionText) {
            let result = await generateResponse(info.selectionText);

            // Execute a script on the current tab with the result.
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args: [result],
                function: (result) => {
                    console.log('Generated answer:', result);
                }
            });
        }
    });
});

//////////////////////////////////////////////////////////////

////////////////////// 2. Message Events /////////////////////
//
// Listen for messages from the UI, process them, and send the result back.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('sender', sender);
    if (message.action !== 'ask') return; // Ignore unrelated messages.

    // Run model prediction asynchronously
    (async function () {
        // Generate a response based on the input message
        let result = await generateResponse(message.text);

        // Send the response back to the UI
        sendResponse(result);
    })();

    // Return true to indicate we will send a response asynchronously
    // see https://stackoverflow.com/a/46628145 for more information
    return true;
});
//////////////////////////////////////////////////////////////
