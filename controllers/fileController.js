const File = require('../models/File');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

// Upload single file
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const { description, tags } = req.body;
  
  // Create file record in database
  const file = await File.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    uploadedBy: req.user._id,
    description: description || '',
    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
  });

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      description: file.description,
      tags: file.tags,
      uploadedAt: file.createdAt
    }
  });
});

// Upload multiple files
const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  const { description, tags } = req.body;
  const uploadedFiles = [];

  for (const file of req.files) {
    const fileRecord = await File.create({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: req.user._id,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    uploadedFiles.push({
      id: fileRecord._id,
      filename: fileRecord.filename,
      originalName: fileRecord.originalName,
      mimetype: fileRecord.mimetype,
      size: fileRecord.size,
      description: fileRecord.description,
      tags: fileRecord.tags,
      uploadedAt: fileRecord.createdAt
    });
  }

  res.status(201).json({
    success: true,
    message: `${uploadedFiles.length} files uploaded successfully`,
    data: uploadedFiles
  });
});

// Get all files (with pagination and filtering)
const getFiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, tags, mimetype } = req.query;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { uploadedBy: req.user._id };
  
  if (search) {
    filter.$or = [
      { originalName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (tags) {
    filter.tags = { $in: tags.split(',').map(tag => tag.trim()) };
  }
  
  if (mimetype) {
    filter.mimetype = { $regex: mimetype, $options: 'i' };
  }

  const files = await File.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('uploadedBy', 'fullName email');

  const total = await File.countDocuments(filter);

  res.json({
    success: true,
    data: {
      files,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFiles: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get single file
const getFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id)
    .populate('uploadedBy', 'fullName email');

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check if user has access to this file
  if (file.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: file
  });
});

// Download file
const downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check if user has access to this file
  if (file.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Check if file exists on disk
  if (!fs.existsSync(file.path)) {
    return res.status(404).json({
      success: false,
      error: 'File not found on server'
    });
  }

  res.download(file.path, file.originalName);
});

// Delete file
const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check if user has access to this file
  if (file.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Delete file from disk
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  // Delete from database
  await File.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});

// Update file metadata
const updateFile = asyncHandler(async (req, res) => {
  const { description, tags } = req.body;
  
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check if user has access to this file
  if (file.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const updatedFile = await File.findByIdAndUpdate(
    req.params.id,
    {
      description: description || file.description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : file.tags
    },
    { new: true }
  );

  res.json({
    success: true,
    message: 'File updated successfully',
    data: updatedFile
  });
});

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
  updateFile
};
