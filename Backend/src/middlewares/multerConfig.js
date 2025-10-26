const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");

const upload = multer();

const storageImage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "..", "public", "images");
    fs.mkdir(uploadPath, { recursive: true }).then(() => {
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh!"), false);
  }
};

const uploadImage = multer({
  storage: storageImage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

const deleteImage = async (fileName) => {
  if (!fileName) return;
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "images",
      fileName
    );

    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

const deleteImages = async (filenames) => {
  if (!Array.isArray(filenames) || filenames.length === 0) {
    return;
  }

  await Promise.all(filenames.map((filename) => deleteImage(filename)));
};

module.exports = {
  uploadImage,
  upload,
  deleteImage,
  deleteImages,
};
