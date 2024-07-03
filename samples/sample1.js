// Import required Node.js modules
const fs = require("fs"); // File system module
const path = require("path"); // Path module
const os = require("os"); // Operating system module
const { setInterval } = require("timers"); // Timers module
const winston = require("winston"); // Logging module

// Define file type to folder mapping
const FILE_TYPE_MAPPING = {
  Pictures: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"],
  Documents: [".pdf", ".docx", ".txt", ".csv", ".xlsx", ".pptx"],
  Videos: [".mp4", ".mov", ".avi", ".mkv", ".wmv"],
  Archives: [".zip", ".rar", ".tar", ".7z"],
  Audio: [".mp3", ".wav", ".flac", ".aac"],
  Software: [".exe", ".msi"],
  Adobe: [".psd", ".ai"],
};

// Configure logging using Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} - ${level.toUpperCase()} - ${message}`;
    })
  ),
  transports: [new winston.transports.File({ filename: "file_organizer.log" })],
});

// Define the download directory and target folders
const downloadDirectory = path.join(os.homedir(), "Downloads");
const targetFolders = Object.keys(FILE_TYPE_MAPPING);

// Create folders
function createFolders(downloadDirectory, targetFolders) {
  targetFolders.forEach((folder) => {
    const folderPath = path.join(downloadDirectory, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      logger.info(`Created folder ${folderPath}`);
    }
  });

  // Organize files after creating folders
  organizeFiles(downloadDirectory);
}

// Watch for changes in the download directory
fs.watch(downloadDirectory, (eventType, filename) => {
  if (eventType === "change" || eventType === "rename") {
    const filePath = path.join(downloadDirectory, filename);
    setTimeout(() => {
      organizeFile(filePath);
    }, 5000);
  }
});
console.log("File organizer started. Watching Downloads folder...");

// Function to organize files in the download directory
function organizeFiles(downloadDirectory) {
  const files = fs.readdirSync(downloadDirectory);
  files.forEach((file) => {
    const filePath = path.join(downloadDirectory, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      organizeFile(filePath);
    }
  });
}

// Call createFolders to create folders and start organizing files
createFolders(downloadDirectory, targetFolders);

// Function to organize a single file
function organizeFile(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();
  const targetFolder = getTargetFolder(fileExtension);
  if (targetFolder) {
    const destinationFolder = path.join(downloadDirectory, targetFolder);
    moveFile(filePath, destinationFolder);
  }
}

// Function to get the target folder for a file based on its extension
function getTargetFolder(fileExtension) {
  for (const folder in FILE_TYPE_MAPPING) {
    if (FILE_TYPE_MAPPING[folder].includes(fileExtension)) {
      return folder;
    }
  }
  return null;
}

// Function to move a file to the destinationFolder
function moveFile(file, destinationFolder) {
  const destinationPath = path.join(destinationFolder, path.basename(file));
  fs.rename(file, destinationPath, (err) => {
    if (err) {
      logger.error(`Error moving file ${file} to ${destinationFolder}: ${err.message}`);
    } else {
      logger.info(`Moved file ${file} to ${destinationFolder}`);
    }
  });
}