// Import required Node.js modules
const fs = require("fs"); // File system module
const path = require("path"); // Path module
const os = require("os"); // Operating system module
const { setInterval } = require("timers"); // Timers module
const winston = require("winston"); // Logging module

// Define file type to folder mapping
/**
 * Mapping of file extensions to their corresponding folders
 * This object is used to determine which folder a file should be moved to based on its extension
 */
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
/**
 * Configure Winston logger to log messages to both a file and the console
 * The logger is set to log messages at the 'info' level and above
 * The log format includes a timestamp, log level, and message
 */
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
    //new winston.transports.Console()
  ],
});

/**
 * Creates the base directory and all subfolders if they do not exist
 * @param {string} baseDirectory - The base directory path
 * @param {string[]} folders - The array of folder names to create
*/
// Create folders based on the provided baseDirectory and folders array
function createFolders(baseDirectory, folders) {
  // Check if the baseDirectory exists, if not create it
  if (!fs.existsSync(baseDirectory)) {
    fs.mkdirSync(baseDirectory);
  }

  // Iterate through the folders array and create each folder if it doesn't exist
  folders.forEach((folder) => {
    const folderPath = path.join(baseDirectory, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      logger.info(`Created folder: ${folderPath}`);
    }
  });
}

// Move a file to the destinationFolder
/**
 * Renames a file to the destination path
 * @param {string} file - The file path to move
 * @param {string} destinationFolder - The folder to move the file to
 */
function moveFile(file, destinationFolder) {
  // Create the full path of the destination file by joining the destinationFolder and the file name
  const destination = path.join(destinationFolder, path.basename(file));

  try {
    // Attempt to rename the file to the destination path
    fs.renameSync(file, destination);

    // Log a success message if the file is moved successfully
    logger.info(`Moved file ${file} to ${destination}`);
  } catch (error) {
    // Log an error message if an error occurs during the file move operation
    logger.error(
      `Error moving file ${file} to ${destination}: ${error.message}`
    );
  }
}

// Organize files in the provided directory based on the fileTypeMapping
/**
 * Organizes files in a directory by moving them to their corresponding folders
 * @param {string} directory - The directory path to organize
 * @param {object} fileTypeMapping - The file type to folder mapping
 */
function organizeFiles(directory, fileTypeMapping) {
  const files = fs.readdirSync(directory);

  // Iterate through the files array
  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    // Check if the file is a regular file
    if (stats.isFile()) {
      const fileExtension = path.extname(file);

      // Iterate through the fileTypeMapping object
      for (const [folder, extensions] of Object.entries(fileTypeMapping)) {
        // Check if the file extension matches any of the extensions in the current folder
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

// Define the download directory and target folders
const downloadDirectory = path.join(os.homedir(), "Downloads");
const targetFolders = Object.keys(FILE_TYPE_MAPPING);

// Create folders
createFolders(downloadDirectory, targetFolders);

// Set an interval to organize files every 5 seconds
setInterval(() => {
  try {
    // Organize files
    organizeFiles(downloadDirectory, FILE_TYPE_MAPPING);
  } catch (error) {
    logger.error(`Error organizing files: ${error.message}`);
  }
}, 5000);
