const fs = require("fs");
const path = require("path");
const os = require("os");

// Define file type to folder mapping
const FILE_TYPE_MAPPING = {
  Pictures: [".jpg", ".jpeg", ".png", ".gif"],
  Documents: [".pdf", ".docx", ".txt"],
  Videos: [".mp4", ".avi"],
};

// Function to create folders if they don't exist
function createFolders(baseDirectory, folders) {
  if (!fs.existsSync(baseDirectory)) {
    fs.mkdirSync(baseDirectory);
  }

  folders.forEach((folder) => {
    const folderPath = path.join(baseDirectory, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  });
}

// Function to move files to appropriate folders
function moveFile(file, destinationFolder) {
  const destination = path.join(destinationFolder, path.basename(file));
  fs.renameSync(file, destination);
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
organizeFiles(downloadDirectory, FILE_TYPE_MAPPING);
