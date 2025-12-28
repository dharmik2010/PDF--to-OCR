# PDF OCR Tool

This project provides two ways to extract text from PDF files:
1.  **Web Version (Recommended)**: Runs entirely in your browser. No installation required.
2.  **CLI Version**: Runs in Node.js (requires complex build tools for image processing).

## 🚀 Quick Start (Web Version)

1.  Open the folder `k:\Project\OCR` in your File Explorer.
2.  Double-click **`index.html`** to open it in your web browser.
3.  Drag and drop your PDF file to extract text.

---

## CLI Version (Advanced)

**Note**: The CLI version requires **C++ Build Tools** and **Python** installed on your system because it relies on the `canvas` native library. If `npm install` fails, please use the Web Version above.

### Prerequisites
- Node.js
- Visual Studio Build Tools (Windows) or `build-essential` (Linux)
- Python

### Installation

1.  Clone or download this repository.
2.  Open a terminal in the project directory.
3.  Install dependencies:

    ```bash
    npm install
    ```

## Usage

You can run the tool in two ways:

1.  **With Command Line Argument:**
    ```bash
    node index.js "path/to/your/document.pdf"
    ```

2.  **Interactive Mode:**
    Run the script without arguments, and it will prompt you for the file path:
    ```bash
    node index.js
    ```
    *Tip: You can drag and drop the file into the terminal window to paste the path.*

## Output

The tool will generate a text file in the same directory as the input PDF, named `[original_filename]_ocr.txt`.

## Troubleshooting

-   **Canvas Installation Issues**: If `npm install` fails on the `canvas` package, ensure you have the necessary build tools. On Windows, you can often fix this by running:
    ```bash
    npm install --global --production windows-build-tools
    ```
    Or follow the instructions at [node-canvas wiki](https://github.com/Automattic/node-canvas).

## Customization

-   **Language**: To change the OCR language, edit `index.js` and change `'eng'` to your desired language code (e.g., `'fra'` for French).
-   **Scale**: Increase the `scale` in `page.getViewport({ scale: 2.0 })` for better accuracy (but slower processing).
