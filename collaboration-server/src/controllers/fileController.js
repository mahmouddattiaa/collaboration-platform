const File = require('../models/File');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const logActivity = require('../utils/activityLogger');

// Upload file (Mock implementation for now, stores in DB but "url" is simulated)
exports.uploadFile = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const file = req.file;

    if (!file) {
      throw new BadRequestError('No file uploaded');
    }

    // In a real app, you would upload to S3/Cloudinary here.
    // For this demo/MVP, we'll assume it's stored and generate a mock URL or use base64 if small (not recommended for prod).
    // Since we are using Vercel, persistent file storage is tricky without S3.
    // We will store metadata in DB and pretend it's hosted.
    
    // NOTE: Real file content handling is skipped for Vercel serverless limitations 
    // unless we connect an external bucket.
    // We'll just save the metadata.

    const newFile = new File({
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `https://fake-storage.com/${roomId}/${file.originalname}`, // Placeholder
      roomId,
      uploadedBy: req.user._id
    });

    await newFile.save();

    await logActivity(
      req.app.get('io'),
      roomId,
      req.user._id,
      'UPLOADED_FILE',
      `Uploaded file "${file.originalname}"`,
      { fileId: newFile._id }
    );

    res.status(201).json({
      success: true,
      data: newFile
    });
  } catch (error) {
    next(error);
  }
};

exports.getRoomFiles = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { deleted } = req.query;

    const query = { roomId, isDeleted: deleted === 'true' };
    
    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');

    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    const file = await File.findById(fileId);
    if (!file) throw new NotFoundError('File not found');

    // Soft delete
    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    await logActivity(
      req.app.get('io'),
      file.roomId,
      req.user._id,
      'DELETED_FILE',
      `Deleted file "${file.originalName}"`
    );

    res.status(200).json({
      success: true,
      message: 'File moved to trash'
    });
  } catch (error) {
    next(error);
  }
};

exports.restoreFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    const file = await File.findById(fileId);
    if (!file) throw new NotFoundError('File not found');

    file.isDeleted = false;
    file.deletedAt = undefined;
    await file.save();

    await logActivity(
      req.app.get('io'),
      file.roomId,
      req.user._id,
      'RESTORED_FILE',
      `Restored file "${file.originalName}"`
    );

    res.status(200).json({
      success: true,
      message: 'File restored'
    });
  } catch (error) {
    next(error);
  }
};

exports.permanentlyDeleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    
    if (!file) throw new NotFoundError('File not found');
    
    // Check permissions (only host or uploader?)
    // Assuming host for now or uploader
    
    await File.findByIdAndDelete(fileId);

    res.status(200).json({
      success: true,
      message: 'File permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};