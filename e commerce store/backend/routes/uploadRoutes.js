import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'prostore_products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(buffer);
  });

router.post('/', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).send({ message: 'No file uploaded' });
    return;
  }

  const result = await uploadBufferToCloudinary(req.file.buffer);

  res.status(201).send({
    message: 'Image Uploaded',
    image: result.secure_url,
  });
}));

export default router;
