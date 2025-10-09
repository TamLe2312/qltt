import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageImage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "public/images/";
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

export const uploadImage = multer({
  storage: storageImage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

export const deleteImage = async (fileName) => {
  if (!fileName) return;
  try {
    const filePath = path.join(
      __dirname,
      "../..",
      "public",
      "images",
      fileName
    );

    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

export const deleteImages = async (filenames) => {
  if (!Array.isArray(filenames) || filenames.length === 0) {
    return;
  }

  await Promise.all(filenames.map((filename) => deleteImage(filename)));
};
