export const mockTests = [
  {
    id: '1',
    title: 'Basic Math Test',
    description: 'Test your basic arithmetic skills with this simple test',
    isPremium: false,
    questions: [
      {
        id: '1',
        text: 'What is 2 + 2?',
        options: [
          { id: '1', text: '3' },
          { id: '2', text: '4', isCorrect: true },
          { id: '3', text: '5' },
          { id: '4', text: '6' },
        ],
      },
      {
        id: '2',
        text: 'What is 5 × 5?',
        options: [
          { id: '1', text: '20' },
          { id: '2', text: '25', isCorrect: true },
          { id: '3', text: '30' },
          { id: '4', text: '35' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Advanced Algebra',
    description: 'Challenge yourself with complex algebraic equations',
    isPremium: true,
    questions: [
      {
        id: '1',
        text: 'Solve for x: 2x + 5 = 13',
        options: [
          { id: '1', text: 'x = 3' },
          { id: '2', text: 'x = 4', isCorrect: true },
          { id: '3', text: 'x = 5' },
          { id: '4', text: 'x = 6' },
        ],
      },
      {
        id: '2',
        text: 'What is the value of x in x² + 4x + 4 = 0?',
        options: [
          { id: '1', text: 'x = -2', isCorrect: true },
          { id: '2', text: 'x = 2' },
          { id: '3', text: 'x = -4' },
          { id: '4', text: 'x = 4' },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Geometry Basics',
    description: 'Test your knowledge of basic geometric concepts',
    isPremium: false,
    questions: [
      {
        id: '1',
        text: 'What is the area of a square with side length 5?',
        options: [
          { id: '1', text: '20' },
          { id: '2', text: '25', isCorrect: true },
          { id: '3', text: '30' },
          { id: '4', text: '35' },
        ],
      },
      {
        id: '2',
        text: 'What is the circumference of a circle with radius 3?',
        options: [
          { id: '1', text: '6π', isCorrect: true },
          { id: '2', text: '9π' },
          { id: '3', text: '12π' },
          { id: '4', text: '15π' },
        ],
      },
    ],
  },
];

export const mockVideoCourses = [
  {
    id: '1',
    title: 'Introduction to Mathematics',
    description: 'Learn the fundamentals of mathematics in this comprehensive course',
    thumbnailUrl: 'https://picsum.photos/400/225',
    duration: '2h 30m',
    videos: [
      {
        id: '1',
        title: 'Basic Arithmetic',
        duration: '45m',
        videoUrl: 'https://example.com/video1.mp4',
      },
      {
        id: '2',
        title: 'Introduction to Algebra',
        duration: '1h 15m',
        videoUrl: 'https://example.com/video2.mp4',
      },
    ],
  },
  {
    id: '2',
    title: 'Advanced Calculus',
    description: 'Master advanced calculus concepts and techniques',
    thumbnailUrl: 'https://picsum.photos/400/226',
    duration: '4h 15m',
    videos: [
      {
        id: '1',
        title: 'Derivatives and Integrals',
        duration: '1h 30m',
        videoUrl: 'https://example.com/video3.mp4',
      },
      {
        id: '2',
        title: 'Multivariable Calculus',
        duration: '2h 45m',
        videoUrl: 'https://example.com/video4.mp4',
      },
    ],
  },
  {
    id: '3',
    title: 'Statistics and Probability',
    description: 'Learn statistical analysis and probability theory',
    thumbnailUrl: 'https://picsum.photos/400/227',
    duration: '3h 45m',
    videos: [
      {
        id: '1',
        title: 'Basic Statistics',
        duration: '1h 15m',
        videoUrl: 'https://example.com/video5.mp4',
      },
      {
        id: '2',
        title: 'Probability Distributions',
        duration: '2h 30m',
        videoUrl: 'https://example.com/video6.mp4',
      },
    ],
  },
];

export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  isAdmin: true,
};

export const mockUserSolutions = [
  {
    id: '1',
    testId: '1',
    userId: '1',
    score: 100,
    completedAt: '2024-03-15T10:30:00Z',
    answers: [
      {
        questionId: '1',
        selectedOptionId: '2',
        isCorrect: true,
      },
      {
        questionId: '2',
        selectedOptionId: '2',
        isCorrect: true,
      },
    ],
  },
  {
    id: '2',
    testId: '2',
    userId: '1',
    score: 50,
    completedAt: '2024-03-16T14:20:00Z',
    answers: [
      {
        questionId: '1',
        selectedOptionId: '2',
        isCorrect: true,
      },
      {
        questionId: '2',
        selectedOptionId: '3',
        isCorrect: false,
      },
    ],
  },
]; 