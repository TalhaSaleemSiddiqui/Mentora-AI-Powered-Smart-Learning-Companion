/**
 * Pre-defined lesson content for Addition, Subtraction, Multiplication & Division level plans.
 * teachingExamples = prompts sent to /tutor API; quizzes = local only.
 */

export const LEVEL_TOPIC_SLUGS = ['addition', 'subtraction', 'multiplication', 'division'];

export const LEVEL_PLAN = {
  addition: {
    apiTopic: 'addition',
    displayName: 'Addition',
    levels: {
      1: {
        teachingExamples: ['What is 2 + 3?', 'What is 1 + 4?'],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
      2: {
        teachingExamples: ['What is 12 + 15?', 'What is 20 + 10?'],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
      3: {
        teachingExamples: ['What is 34 + 48?', 'What is 55 + 37?'],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
    },
  },
  subtraction: {
    apiTopic: 'subtraction',
    displayName: 'Subtraction',
    levels: {
      1: {
        teachingExamples: ['What is 5 minus 2?', 'What is 7 minus 3?'],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
      2: {
        teachingExamples: ['What is 20 minus 8?', 'What is 35 minus 15?'],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
      3: {
        teachingExamples: ['What is 85 minus 37?', 'What is 92 minus 44?'],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
    },
  },
  multiplication: {
    apiTopic: 'multiplication',
    displayName: 'Multiplication',
    levels: {
      1: {
        teachingExamples: ['What is 3 times 2?', 'What is 4 times 2?'],
        quizzes: [
          { text: 'There are 2 bags and each bag has 3 apples. How many apples total?', answer: 6 },
          { text: 'A car has 4 wheels. How many wheels do 2 cars have?', answer: 8 },
          { text: 'There are 3 boxes and each box has 3 candies. How many candies?', answer: 9 },
          { text: 'You have 5 bags and each bag has 2 oranges. How many oranges?', answer: 10 },
          { text: 'There are 2 trees and each tree has 5 birds. How many birds?', answer: 10 },
        ],
      },
      2: {
        teachingExamples: ['What is 5 times 4?', 'What is 6 times 3?'],
        quizzes: [
          { text: 'There are 5 shelves and each shelf has 4 books. How many books?', answer: 20 },
          { text: 'A class has 6 rows and each row has 5 chairs. How many chairs?', answer: 30 },
          { text: 'There are 7 baskets and each basket has 4 oranges. How many oranges?', answer: 28 },
          { text: 'You plant 8 rows of flowers with 4 in each row. How many flowers?', answer: 32 },
          { text: 'There are 6 boxes and each box has 6 candies. How many candies?', answer: 36 },
        ],
      },
      3: {
        teachingExamples: ['What is 8 times 7?', 'What is 9 times 6?'],
        quizzes: [
          { text: 'There are 7 weeks and each week has 7 days. How many days?', answer: 49 },
          { text: 'A school has 8 classes and each class has 9 students. How many students?', answer: 72 },
          { text: 'There are 9 boxes and each box has 8 apples. How many apples?', answer: 72 },
          { text: 'You have 7 bags and each bag has 9 oranges. How many oranges?', answer: 63 },
          { text: 'There are 8 shelves and each shelf has 8 books. How many books?', answer: 64 },
        ],
      },
    },
  },
  division: {
    apiTopic: 'division',
    displayName: 'Division',
    levels: {
      1: {
        teachingExamples: ['Divide 6 by 2', 'Divide 9 by 3'],
        quizzes: [
          { text: 'You have 8 apples and share them equally between 2 friends. How many does each get?', answer: 4 },
          { text: 'There are 6 candies shared equally among 3 children. How many each?', answer: 2 },
          { text: 'You have 10 balls and put them in 2 equal groups. How many in each group?', answer: 5 },
          { text: 'There are 9 oranges shared equally among 3 bags. How many in each bag?', answer: 3 },
          { text: 'You have 8 fish and put them equally into 4 bowls. How many fish per bowl?', answer: 2 },
        ],
      },
      2: {
        teachingExamples: ['Divide 20 by 4', 'Divide 30 by 5'],
        quizzes: [
          { text: 'There are 24 apples shared equally in 4 baskets. How many in each basket?', answer: 6 },
          { text: 'You have 35 candies to share among 5 friends. How many each?', answer: 7 },
          { text: 'A school has 36 students split into 6 equal groups. How many in each group?', answer: 6 },
          { text: 'There are 40 oranges packed into 8 equal bags. How many in each bag?', answer: 5 },
          { text: 'You have 42 books to put equally on 7 shelves. How many books per shelf?', answer: 6 },
        ],
      },
      3: {
        teachingExamples: [
          'Explain fraction 1/4 using a pizza story',
          'Explain fraction 2/3 using a pizza story',
        ],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
      4: {
        teachingExamples: ['Simplify fraction 4/8'],
        dynamicQuizzes: true,
        quizCount: 5,
        quizzes: [],
      },
    },
  },
};

export function getLevelConfig(topicKey, levelNum) {
  const plan = LEVEL_PLAN[topicKey];
  if (!plan) return null;
  return plan.levels[levelNum] || null;
}

export function welcomeMessage(displayName, levelNum) {
  if (displayName === 'Division' && levelNum === 3) {
    return `Hi! Welcome to Level 3! Today we're going to learn about fractions. Watch this example first!`;
  }
  if (displayName === 'Division' && levelNum === 4) {
    return `Hi! Sometimes the same colored circle can be written with smaller numbers. Watch this example first!`;
  }
  const suffixMap = {
    Addition:       'practice adding numbers',
    Subtraction:    'practice subtracting numbers',
    Multiplication: 'practice multiplying numbers',
    Division:       'practice dividing numbers',
  };
  const suffix = suffixMap[displayName] ?? `practice ${displayName.toLowerCase()}`;
  return `Hi! Welcome to ${displayName} Level ${levelNum}! Today we are going to ${suffix}. Let's start with an example, then you'll try some questions!`;
}

export function completionMessage(levelNum) {
  return `Wow, you completed Level ${levelNum}! You are a math superstar! 🌟`;
}
