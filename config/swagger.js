const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication API',
      version: '1.0.0',
      description: 'A secure authentication API with JWT access and refresh tokens',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            fullName: {
              type: 'string',
              description: 'User full name',
              maxLength: 100
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            mobileNumber: {
              type: 'string',
              description: 'User mobile number',
              pattern: '^\\+?[\\d\\s\\-\\(\\)]+$'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'User date of birth (YYYY-MM-DD)'
            },
            password: {
              type: 'string',
              description: 'User password',
              minLength: 6
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                                 user: {
                   type: 'object',
                   properties: {
                     id: {
                       type: 'string',
                       example: '507f1f77bcf86cd799439011'
                     },
                     fullName: {
                       type: 'string',
                       example: 'John Doe'
                     },
                     email: {
                       type: 'string',
                       example: 'john@example.com'
                     },
                     mobileNumber: {
                       type: 'string',
                       example: '+1234567890'
                     },
                     dateOfBirth: {
                       type: 'string',
                       format: 'date',
                       example: '1990-01-01'
                     }
                   }
                 },
                accessToken: {
                  type: 'string',
                  description: 'JWT access token (valid for 15 minutes)',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  description: 'JWT refresh token (valid for 30 days)',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        TokenResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Token refreshed successfully'
            },
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  description: 'New JWT access token (valid for 15 minutes)',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  description: 'New JWT refresh token (valid for 30 days)',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                },
                fullName: {
                  type: 'string',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  example: 'john@example.com'
                },
                mobileNumber: {
                  type: 'string',
                  example: '+1234567890'
                },
                dateOfBirth: {
                  type: 'string',
                  format: 'date',
                  example: '1990-01-01'
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            filename: {
              type: 'string',
              example: 'document-1234567890.pdf'
            },
            originalName: {
              type: 'string',
              example: 'document.pdf'
            },
            mimetype: {
              type: 'string',
              example: 'application/pdf'
            },
            size: {
              type: 'number',
              example: 1024000
            },
            description: {
              type: 'string',
              example: 'Important document'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['document', 'pdf', 'important']
            },
            uploadedBy: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                },
                fullName: {
                  type: 'string',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  example: 'john@example.com'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Video: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Sample Video'
            },
            description: {
              type: 'string',
              example: 'This is a sample video'
            },
            cloudinaryUrl: {
              type: 'string',
              example: 'https://res.cloudinary.com/example/video/upload/v123/sample.mp4'
            },
            duration: {
              type: 'number',
              example: 120
            },
            format: {
              type: 'string',
              example: 'mp4'
            },
            size: {
              type: 'number',
              example: 10240000
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['sample', 'video']
            },
            isPublic: {
              type: 'boolean',
              example: true
            },
            views: {
              type: 'number',
              example: 150
            },
            uploadedBy: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                },
                fullName: {
                  type: 'string',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  example: 'john@example.com'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Quiz: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'JavaScript Basics'
            },
            description: {
              type: 'string',
              example: 'Test your JavaScript knowledge'
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: {
                    type: 'string',
                    example: 'What is JavaScript?'
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    example: ['A programming language', 'A markup language', 'A styling language']
                  },
                  correctAnswer: {
                    type: 'integer',
                    example: 0
                  },
                  explanation: {
                    type: 'string',
                    example: 'JavaScript is a programming language used for web development.'
                  }
                }
              }
            },
            timeLimit: {
              type: 'integer',
              example: 30
            },
            passingScore: {
              type: 'integer',
              example: 70
            },
            category: {
              type: 'string',
              example: 'Programming'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['javascript', 'programming']
            },
            isPublic: {
              type: 'boolean',
              example: true
            },
            attempts: {
              type: 'integer',
              example: 25
            },
            averageScore: {
              type: 'number',
              example: 75.5
            },
            createdBy: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                },
                fullName: {
                  type: 'string',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  example: 'john@example.com'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 