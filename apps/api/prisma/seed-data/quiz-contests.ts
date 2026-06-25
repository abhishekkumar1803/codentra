import { ContestStatus, ContestType, type PrismaClient } from '@prisma/client';

type QuizOptionSeed = {
  text: string;
  isCorrect: boolean;
};

type QuizQuestionSeed = {
  text: string;
  points: number;
  options: QuizOptionSeed[];
};

type QuizContestSeed = {
  slug: string;
  title: string;
  description: string;
  status: ContestStatus;
  questions: QuizQuestionSeed[];
};

const JAVA_QUESTIONS: QuizQuestionSeed[] = [
  {
    text: 'Which keyword is used to inherit a class in Java?',
    points: 10,
    options: [
      { text: 'implements', isCorrect: false },
      { text: 'extends', isCorrect: true },
      { text: 'inherits', isCorrect: false },
      { text: 'super', isCorrect: false },
    ],
  },
  {
    text: 'What is the size of `int` in Java?',
    points: 10,
    options: [
      { text: '16 bits', isCorrect: false },
      { text: '32 bits', isCorrect: true },
      { text: '64 bits', isCorrect: false },
      { text: 'Platform dependent', isCorrect: false },
    ],
  },
  {
    text: 'Which collection does not allow duplicate elements?',
    points: 10,
    options: [
      { text: 'ArrayList', isCorrect: false },
      { text: 'LinkedList', isCorrect: false },
      { text: 'HashSet', isCorrect: true },
      { text: 'Vector', isCorrect: false },
    ],
  },
  {
    text: 'Which method is the entry point of a Java application?',
    points: 10,
    options: [
      { text: 'start()', isCorrect: false },
      { text: 'run()', isCorrect: false },
      { text: 'main()', isCorrect: true },
      { text: 'init()', isCorrect: false },
    ],
  },
  {
    text: 'What does JVM stand for?',
    points: 10,
    options: [
      { text: 'Java Variable Machine', isCorrect: false },
      { text: 'Java Virtual Machine', isCorrect: true },
      { text: 'Joint Version Manager', isCorrect: false },
      { text: 'Java Visual Module', isCorrect: false },
    ],
  },
  {
    text: 'Which access modifier allows visibility within the same package only?',
    points: 10,
    options: [
      { text: 'private', isCorrect: false },
      { text: 'protected', isCorrect: false },
      { text: 'default (package-private)', isCorrect: true },
      { text: 'public', isCorrect: false },
    ],
  },
  {
    text: 'Which interface must be implemented for object sorting using Collections.sort()?',
    points: 10,
    options: [
      { text: 'Runnable', isCorrect: false },
      { text: 'Comparable', isCorrect: true },
      { text: 'Serializable', isCorrect: false },
      { text: 'Cloneable', isCorrect: false },
    ],
  },
  {
    text: 'What is autoboxing in Java?',
    points: 10,
    options: [
      { text: 'Automatic conversion of primitive to wrapper class', isCorrect: true },
      { text: 'Automatic memory cleanup', isCorrect: false },
      { text: 'Automatic exception handling', isCorrect: false },
      { text: 'Automatic interface implementation', isCorrect: false },
    ],
  },
  {
    text: 'Which keyword prevents method overriding?',
    points: 10,
    options: [
      { text: 'static', isCorrect: false },
      { text: 'final', isCorrect: true },
      { text: 'abstract', isCorrect: false },
      { text: 'volatile', isCorrect: false },
    ],
  },
  {
    text: 'Which exception is unchecked in Java?',
    points: 10,
    options: [
      { text: 'IOException', isCorrect: false },
      { text: 'SQLException', isCorrect: false },
      { text: 'NullPointerException', isCorrect: true },
      { text: 'ClassNotFoundException', isCorrect: false },
    ],
  },
];

const REACT_QUESTIONS: QuizQuestionSeed[] = [
  {
    text: 'What is JSX?',
    points: 10,
    options: [
      { text: 'A JavaScript database', isCorrect: false },
      { text: 'A syntax extension for JavaScript', isCorrect: true },
      { text: 'A CSS preprocessor', isCorrect: false },
      { text: 'A React state manager', isCorrect: false },
    ],
  },
  {
    text: 'Which hook manages local component state?',
    points: 10,
    options: [
      { text: 'useEffect', isCorrect: false },
      { text: 'useState', isCorrect: true },
      { text: 'useMemo', isCorrect: false },
      { text: 'useContext', isCorrect: false },
    ],
  },
  {
    text: 'What is the virtual DOM?',
    points: 10,
    options: [
      { text: 'A browser API', isCorrect: false },
      { text: 'A lightweight copy of the real DOM in memory', isCorrect: true },
      { text: 'A React routing layer', isCorrect: false },
      { text: 'A server-side rendering engine', isCorrect: false },
    ],
  },
  {
    text: 'Which prop makes a component controlled?',
    points: 10,
    options: [
      { text: 'defaultValue only', isCorrect: false },
      { text: 'value + onChange handler', isCorrect: true },
      { text: 'key', isCorrect: false },
      { text: 'ref', isCorrect: false },
    ],
  },
  {
    text: 'What does `key` help React with in lists?',
    points: 10,
    options: [
      { text: 'Styling elements', isCorrect: false },
      { text: 'Identifying which items changed', isCorrect: true },
      { text: 'Encrypting props', isCorrect: false },
      { text: 'Lazy loading components', isCorrect: false },
    ],
  },
  {
    text: 'When does useEffect run by default?',
    points: 10,
    options: [
      { text: 'Only on mount', isCorrect: false },
      { text: 'After every render', isCorrect: true },
      { text: 'Before render', isCorrect: false },
      { text: 'Only on unmount', isCorrect: false },
    ],
  },
  {
    text: 'Which API shares state without prop drilling?',
    points: 10,
    options: [
      { text: 'Context', isCorrect: true },
      { text: 'Fragment', isCorrect: false },
      { text: 'Portal', isCorrect: false },
      { text: 'Suspense only', isCorrect: false },
    ],
  },
  {
    text: 'What is React.memo used for?',
    points: 10,
    options: [
      { text: 'Memoizing expensive calculations', isCorrect: false },
      { text: 'Preventing re-renders when props are unchanged', isCorrect: true },
      { text: 'Persisting state to localStorage', isCorrect: false },
      { text: 'Creating refs', isCorrect: false },
    ],
  },
  {
    text: 'In React 18+, automatic batching means…',
    points: 10,
    options: [
      { text: 'Multiple setState calls may batch into one render', isCorrect: true },
      { text: 'Components render twice always', isCorrect: false },
      { text: 'Effects run synchronously', isCorrect: false },
      { text: 'Keys are auto-generated', isCorrect: false },
    ],
  },
  {
    text: 'Which tool is commonly used for React server components in Next.js?',
    points: 10,
    options: [
      { text: 'Webpack only', isCorrect: false },
      { text: 'App Router with RSC support', isCorrect: true },
      { text: 'jQuery', isCorrect: false },
      { text: 'Redux middleware', isCorrect: false },
    ],
  },
];

const JAVASCRIPT_QUESTIONS: QuizQuestionSeed[] = [
  {
    text: 'Which keyword declares a block-scoped variable in ES6?',
    points: 10,
    options: [
      { text: 'var', isCorrect: false },
      { text: 'let', isCorrect: true },
      { text: 'function', isCorrect: false },
      { text: 'define', isCorrect: false },
    ],
  },
  {
    text: 'What does `typeof null` return?',
    points: 10,
    options: [
      { text: 'null', isCorrect: false },
      { text: 'undefined', isCorrect: false },
      { text: 'object', isCorrect: true },
      { text: 'number', isCorrect: false },
    ],
  },
  {
    text: 'Which method adds an element to the end of an array?',
    points: 10,
    options: [
      { text: 'push()', isCorrect: true },
      { text: 'pop()', isCorrect: false },
      { text: 'shift()', isCorrect: false },
      { text: 'unshift()', isCorrect: false },
    ],
  },
  {
    text: 'What is a closure?',
    points: 10,
    options: [
      { text: 'A function with access to its outer lexical scope', isCorrect: true },
      { text: 'A closed TCP connection', isCorrect: false },
      { text: 'A private class field only', isCorrect: false },
      { text: 'A deprecated var feature', isCorrect: false },
    ],
  },
  {
    text: 'Which operator checks strict equality?',
    points: 10,
    options: [
      { text: '==', isCorrect: false },
      { text: '===', isCorrect: true },
      { text: '=', isCorrect: false },
      { text: '!=', isCorrect: false },
    ],
  },
  {
    text: 'What does `async/await` simplify?',
    points: 10,
    options: [
      { text: 'DOM traversal', isCorrect: false },
      { text: 'Working with Promises', isCorrect: true },
      { text: 'CSS animations', isCorrect: false },
      { text: 'Memory allocation', isCorrect: false },
    ],
  },
  {
    text: 'Which array method returns a new array of mapped values?',
    points: 10,
    options: [
      { text: 'forEach', isCorrect: false },
      { text: 'map', isCorrect: true },
      { text: 'filter', isCorrect: false },
      { text: 'reduce', isCorrect: false },
    ],
  },
  {
    text: 'What is the value of `[] + []` in JavaScript?',
    points: 10,
    options: [
      { text: '[]', isCorrect: false },
      { text: '"" (empty string)', isCorrect: true },
      { text: '0', isCorrect: false },
      { text: 'undefined', isCorrect: false },
    ],
  },
  {
    text: 'Which symbol creates a Promise that resolves immediately?',
    points: 10,
    options: [
      { text: 'Promise.reject()', isCorrect: false },
      { text: 'Promise.resolve()', isCorrect: true },
      { text: 'new Callback()', isCorrect: false },
      { text: 'setTimeout only', isCorrect: false },
    ],
  },
  {
    text: 'What does `use strict` enable?',
    points: 10,
    options: [
      { text: 'Stricter parsing and error handling in JavaScript', isCorrect: true },
      { text: 'TypeScript compilation', isCorrect: false },
      { text: 'Automatic semicolon removal', isCorrect: false },
      { text: 'Private fields in objects', isCorrect: false },
    ],
  },
];

const DEVOPS_QUESTIONS: QuizQuestionSeed[] = [
  {
    text: 'What does CI stand for in DevOps?',
    points: 10,
    options: [
      { text: 'Continuous Integration', isCorrect: true },
      { text: 'Centralized Infrastructure', isCorrect: false },
      { text: 'Container Isolation', isCorrect: false },
      { text: 'Code Inspection', isCorrect: false },
    ],
  },
  {
    text: 'Which file defines a multi-container Docker application?',
    points: 10,
    options: [
      { text: 'Dockerfile only', isCorrect: false },
      { text: 'docker-compose.yml', isCorrect: true },
      { text: '.env', isCorrect: false },
      { text: 'package.json', isCorrect: false },
    ],
  },
  {
    text: 'What is Kubernetes primarily used for?',
    points: 10,
    options: [
      { text: 'Container orchestration', isCorrect: true },
      { text: 'Frontend bundling', isCorrect: false },
      { text: 'SQL query optimization', isCorrect: false },
      { text: 'DNS registration', isCorrect: false },
    ],
  },
  {
    text: 'Which Git command creates a new branch and switches to it?',
    points: 10,
    options: [
      { text: 'git branch name', isCorrect: false },
      { text: 'git checkout -b name', isCorrect: true },
      { text: 'git merge name', isCorrect: false },
      { text: 'git stash name', isCorrect: false },
    ],
  },
  {
    text: 'What is an immutable infrastructure practice?',
    points: 10,
    options: [
      { text: 'SSH and patch servers manually', isCorrect: false },
      { text: 'Replace servers instead of modifying them in place', isCorrect: true },
      { text: 'Store secrets in git', isCorrect: false },
      { text: 'Disable monitoring', isCorrect: false },
    ],
  },
  {
    text: 'Which metric type counts cumulative events in Prometheus?',
    points: 10,
    options: [
      { text: 'Gauge', isCorrect: false },
      { text: 'Counter', isCorrect: true },
      { text: 'Histogram only', isCorrect: false },
      { text: 'Summary only', isCorrect: false },
    ],
  },
  {
    text: 'What does CD often mean alongside CI?',
    points: 10,
    options: [
      { text: 'Continuous Delivery or Deployment', isCorrect: true },
      { text: 'Container Distribution', isCorrect: false },
      { text: 'Code Duplication', isCorrect: false },
      { text: 'Cluster Discovery', isCorrect: false },
    ],
  },
  {
    text: 'Which tool is commonly used for infrastructure as code?',
    points: 10,
    options: [
      { text: 'Terraform', isCorrect: true },
      { text: 'Prettier', isCorrect: false },
      { text: 'ESLint', isCorrect: false },
      { text: 'Jest', isCorrect: false },
    ],
  },
  {
    text: 'What is a rolling deployment?',
    points: 10,
    options: [
      { text: 'Updating instances gradually with minimal downtime', isCorrect: true },
      { text: 'Deleting all pods at once', isCorrect: false },
      { text: 'Manual FTP upload', isCorrect: false },
      { text: 'Running tests locally only', isCorrect: false },
    ],
  },
  {
    text: 'Where should production secrets ideally be stored?',
    points: 10,
    options: [
      { text: 'In the Git repository', isCorrect: false },
      { text: 'In a secrets manager or vault', isCorrect: true },
      { text: 'In README.md', isCorrect: false },
      { text: 'In client-side JavaScript', isCorrect: false },
    ],
  },
];

const QUIZ_CONTESTS: QuizContestSeed[] = [
  {
    slug: 'java-fundamentals-quiz',
    title: 'Java Fundamentals Quiz',
    description:
      '10 questions on core Java — OOP, collections, JVM, and exceptions.',
    status: ContestStatus.LIVE,
    questions: JAVA_QUESTIONS,
  },
  {
    slug: 'react-fundamentals-quiz',
    title: 'React Fundamentals Quiz',
    description:
      '10 questions on React — hooks, JSX, rendering, and component patterns.',
    status: ContestStatus.LIVE,
    questions: REACT_QUESTIONS,
  },
  {
    slug: 'javascript-fundamentals-quiz',
    title: 'JavaScript Fundamentals Quiz',
    description:
      '10 questions on modern JavaScript — types, async, arrays, and closures.',
    status: ContestStatus.LIVE,
    questions: JAVASCRIPT_QUESTIONS,
  },
  {
    slug: 'devops-fundamentals-quiz',
    title: 'DevOps Fundamentals Quiz',
    description:
      '10 questions on DevOps — CI/CD, Docker, Kubernetes, and observability.',
    status: ContestStatus.LIVE,
    questions: DEVOPS_QUESTIONS,
  },
];

async function seedQuizContest(
  prisma: PrismaClient,
  adminId: string,
  config: QuizContestSeed,
  now: Date,
) {
  const startTime = new Date(now.getTime() - 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const contest = await prisma.contest.upsert({
    where: { slug: config.slug },
    update: {
      title: config.title,
      description: config.description,
      status: config.status,
      startTime,
      endTime,
    },
    create: {
      title: config.title,
      slug: config.slug,
      description: config.description,
      type: ContestType.QUIZ,
      status: config.status,
      startTime,
      endTime,
      durationMinutes: 45,
      maxParticipants: 500,
      createdById: adminId,
    },
  });

  const existingCount = await prisma.quizQuestion.count({
    where: { contestId: contest.id },
  });

  if (existingCount >= config.questions.length) {
    return;
  }

  await prisma.quizQuestion.deleteMany({ where: { contestId: contest.id } });

  for (let i = 0; i < config.questions.length; i++) {
    const q = config.questions[i]!;
    await prisma.quizQuestion.create({
      data: {
        contestId: contest.id,
        text: q.text,
        points: q.points,
        orderIndex: i,
        options: {
          create: q.options.map((opt, orderIndex) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            orderIndex,
          })),
        },
      },
    });
  }
}

export async function seedQuizContests(
  prisma: PrismaClient,
  adminId: string,
  now: Date,
) {
  for (const config of QUIZ_CONTESTS) {
    await seedQuizContest(prisma, adminId, config, now);
  }
}
