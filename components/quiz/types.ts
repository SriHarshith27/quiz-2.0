export type QuizData = {
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number;
    maxAttempts: number;
};

export type QuestionData = {
    question_text: string;
    options: string[];
    correct_answer: number; // 0-3 index
    points: number;
};
