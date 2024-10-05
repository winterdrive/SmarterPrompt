// import { pipeline, env } from '@xenova/transformers';
//
// env.allowLocalModels = false;
// env.backends.onnx.wasm.numThreads = 1;
//
// class PipelineSingleton {
//     static task = 'text-classification';
//     static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
//     static instance = null;
//
//     static async getInstance(progress_callback = null) {
//         if (this.instance === null) {
//             this.instance = pipeline(this.task, this.model, { progress_callback });
//         }
//
//         return this.instance;
//     }
// }
//
// const classify = async (text) => {
//     let model = await PipelineSingleton.getInstance();
//     let result = await model(text);
//     return result;
// };
//
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action !== 'classify') return;
//
//     (async function () {
//         let result = await classify(message.text);
//         sendResponse(result);
//     })();
//
//     return true;
// });
