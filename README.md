# auto-file-organizer

## Description
auto-file-organizer is a Node.js script that organizes files based on specified rules, using the Winston logging library for detailed logs.

## Installation
To install and use auto-file-organizer, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Gen-2k/auto-file-organizer.git
   cd auto-file-organizer
   ```
   
2. Install dependencies using npm:
    
   ```bash
   npm install
   ```

## Dependencies

This project relies on the following npm package:

- **Winston**: A versatile logging library for Node.js

```bash
npm install winston
   ```

# Usage

Modify the `fileOrganizer.js` file to define your file organizing rules using a mapping like this:

```javascript
const FILE_TYPE_MAPPING = {
  Images: [".jpg", ".jpeg", ".png", ".gif"],
  Documents: [".pdf", ".docx", ".txt"],
  Videos: [".mp4", ".mov", ".avi"],
  Archives: [".zip", ".rar", ".tar"],
  Audio: [".mp3", ".wav"],
};
```


Then, run the script using Node.js:
```bash
node fileOrganizer.js
```

