const Quiz = require('../models/Quiz');
const asyncHandler = require('../utils/asyncHandler');

// Create new quiz
const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, questions, timeLimit, passingScore, category, tags, isPublic } = req.body;

  // Validate questions
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one question is required'
    });
  }

  // Validate each question
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (!question.question || !Array.isArray(question.options) || question.options.length < 2) {
      return res.status(400).json({
        success: false,
        error: `Question ${i + 1} must have a question text and at least 2 options`
      });
    }
    if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      return res.status(400).json({
        success: false,
        error: `Question ${i + 1} must have a valid correct answer index`
      });
    }
  }

  const quiz = await Quiz.create({
    title,
    description: description || '',
    questions,
    timeLimit: timeLimit || 0,
    passingScore: passingScore || 70,
    category: category || '',
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    isPublic: isPublic !== 'false',
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questions.length,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      category: quiz.category,
      tags: quiz.tags,
      isPublic: quiz.isPublic,
      createdAt: quiz.createdAt
    }
  });
});

// Get all quizzes (with pagination and filtering)
const getQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, tags, isPublic } = req.query;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  // If not admin, only show public quizzes or user's own quizzes
  if (!req.user.isAdmin) {
    filter.$or = [
      { isPublic: true },
      { createdBy: req.user._id }
    ];
  }
  
  if (search) {
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    });
  }
  
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }
  
  if (tags) {
    filter.tags = { $in: tags.split(',').map(tag => tag.trim()) };
  }
  
  if (isPublic !== undefined) {
    filter.isPublic = isPublic === 'true';
  }

  const quizzes = await Quiz.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('createdBy', 'fullName email')
    .select('-questions.correctAnswer'); // Don't send correct answers

  const total = await Quiz.countDocuments(filter);

  res.json({
    success: true,
    data: {
      quizzes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQuizzes: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get single quiz (without correct answers for taking)
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('createdBy', 'fullName email');

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found'
    });
  }

  // Check access permissions
  if (!quiz.isPublic && quiz.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Remove correct answers for quiz taking
  const quizForTaking = {
    ...quiz.toObject(),
    questions: quiz.questions.map(q => ({
      question: q.question,
      options: q.options,
      _id: q._id
    }))
  };

  res.json({
    success: true,
    data: quizForTaking
  });
});

// Get quiz with answers (for creator/admin)
const getQuizWithAnswers = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('createdBy', 'fullName email');

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found'
    });
  }

  // Check if user has access to this quiz
  if (quiz.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: quiz
  });
});

// Update quiz
const updateQuiz = asyncHandler(async (req, res) => {
  const { title, description, questions, timeLimit, passingScore, category, tags, isPublic } = req.body;
  
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found'
    });
  }

  // Check if user has access to this quiz
  if (quiz.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Validate questions if provided
  if (questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one question is required'
      });
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !Array.isArray(question.options) || question.options.length < 2) {
        return res.status(400).json({
          success: false,
          error: `Question ${i + 1} must have a question text and at least 2 options`
        });
      }
      if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          error: `Question ${i + 1} must have a valid correct answer index`
        });
      }
    }
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    {
      title: title || quiz.title,
      description: description !== undefined ? description : quiz.description,
      questions: questions || quiz.questions,
      timeLimit: timeLimit !== undefined ? timeLimit : quiz.timeLimit,
      passingScore: passingScore !== undefined ? passingScore : quiz.passingScore,
      category: category !== undefined ? category : quiz.category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : quiz.tags,
      isPublic: isPublic !== undefined ? isPublic === 'true' : quiz.isPublic
    },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Quiz updated successfully',
    data: updatedQuiz
  });
});

// Delete quiz
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found'
    });
  }

  // Check if user has access to this quiz
  if (quiz.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await Quiz.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Quiz deleted successfully'
  });
});

// Submit quiz answers and get results
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // answers should be an array of question indices

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      error: 'Answers array is required'
    });
  }

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found'
    });
  }

  // Check access permissions
  if (!quiz.isPublic && quiz.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Validate answers
  if (answers.length !== quiz.questions.length) {
    return res.status(400).json({
      success: false,
      error: 'Number of answers must match number of questions'
    });
  }

  // Calculate score
  let correctAnswers = 0;
  const results = [];

  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i];
    const userAnswer = answers[i];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correctAnswers++;
    }

    results.push({
      question: question.question,
      userAnswer: userAnswer !== undefined ? question.options[userAnswer] : null,
      correctAnswer: question.options[question.correctAnswer],
      isCorrect,
      explanation: question.explanation
    });
  }

  const score = Math.round((correctAnswers / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  // Update quiz statistics
  quiz.attempts += 1;
  quiz.averageScore = ((quiz.averageScore * (quiz.attempts - 1)) + score) / quiz.attempts;
  await quiz.save();

  res.json({
    success: true,
    data: {
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      passed,
      passingScore: quiz.passingScore,
      results
    }
  });
});

module.exports = {
  createQuiz,
  getQuizzes,
  getQuiz,
  getQuizWithAnswers,
  updateQuiz,
  deleteQuiz,
  submitQuiz
};
