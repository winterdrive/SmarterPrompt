# Smarter Prompter: A Text Masking and Improvement Extension

### Key Features:

1. **Text Masking**: The extension can mask personal information in selected text using a backend API powered by a
   machine learning model.
    - In this version, the extension call a local API to mask the text. Users can replace the API with a real one to get
      the real masking result.
    - In this version, we support two languages: English and Chinese. Chinese is the default language.
    - In this version, it stores masked entities in `sessionStorage` which will be used in the next version to restore
      the original text.
2. **Text Improvement**: It can improve text prompts by leveraging a text-generation model.
    - In this version, the extension uses a simple text generation model (distilGPT2) by transformer.js to improve the
      text. Users can replace the model with a more advanced one to get better results.
3. **Interactive UI**: Provides an interactive bubble and dialog box for user interaction, making it easy to mask and improve text directly from the web page. 
    - In this version, users can copy masked text, switch to an English model for NER, improve prompts, and restore original text with a single click.
    - In this version, the dialog box is draggable, providing a flexible and user-friendly interface.
    - In this version, clipboard integration allows users to copy masked or original text to the clipboard with a single click.

### Reasons to Install:

1. **Privacy Protection**: Helps users protect their personal information by masking sensitive data in text.
2. **Enhanced Productivity**: Improves the quality of text prompts, which can be beneficial for various applications
   like writing, coding, and more.
3. **Ease of Use**: The extension is easy to use with a simple and intuitive interface, making it accessible for all
   users.
4. **Seamless Integration**: Integrates seamlessly with the browser, allowing users to interact with it without
   disrupting their workflow.
5. **Customizable**: Offers options to switch between different models and languages, catering to diverse user needs.
6. **Real-time Feedback**: Provides real-time feedback and results, enhancing the user experience.

### Development Guide:
1. Install the frontend extension:
    ```bash
    git clone https://github.com/winterdrive/SmarterPrompt.git
    cd SmarterPrompt/NER_frontend/
    npm install 
    npm run build 
    ```
2. Add the extension to your browser. To do this, go to `chrome://extensions/`, enable developer mode (top right), and
   click "Load unpacked". Select the `build` directory from the dialog which appears and click "Select Folder".

3. That's it! You should now be able to open the extenion's popup and use the model in your browser!

4. (Optional) To run the backend API, follow the instructions in the `NER_backend` directory.
