const fs = require("fs");
const path = require("path");
const os = require("os");
const winston = require("winston");
const { setInterval } = require("timers");

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
  transports: [
    new winston.transports.File({ filename: "file_organizer.log" }),
    new winston.transports.Console(),
  ],
});

// Function to create folders if they don't exist
function createFolders(baseDirectory, folders) {
  if (!fs.existsSync(baseDirectory)) {
    fs.mkdirSync(baseDirectory);
  }

  folders.forEach((folder) => {
    const folderPath = path.join(baseDirectory, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      logger.info(`Created folder: ${folderPath}`);
    }
  });
}

// Function to move files to appropriate folders
function moveFile(file, destinationFolder) {
  const destination = path.join(destinationFolder, path.basename(file));
  try {
    fs.renameSync(file, destination);
    logger.info(`Moved file ${file} to ${destination}`);
  } catch (error) {
    logger.error(
      `Error moving file ${file} to ${destination}: ${error.message}`
    );
  }
}

// Function to organize files
function organizeFiles(directory, fileTypeMapping) {
  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      const fileExtension = path.extname(file);
      for (const [folder, extensions] of Object.entries(fileTypeMapping)) {
        if (extensions.includes(fileExtension)) {
          logger.info(
            `File ${file} matches extension ${fileExtension} for folder ${folder}`
          );
          moveFile(filePath, path.join(directory, folder));
          break;
        }
      }
    }
  });
}

// Set up the directories and organize files
const downloadDirectory = path.join(os.homedir(), "Downloads");
const targetFolders = Object.keys(FILE_TYPE_MAPPING);

createFolders(downloadDirectory, targetFolders);

// Set an interval to organize files every 5 seconds
setInterval(() => {
  try {
    organizeFiles(downloadDirectory, FILE_TYPE_MAPPING);
  } catch (error) {
    logger.error(`Error organizing files: ${error.message}`);
  }
}, 5000);
