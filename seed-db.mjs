import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const SAMPLE_QUESTIONS = [
  // N5 - Vocabulary
  {
    level: "N5",
    type: "vocabulary",
    question: "私は毎日___に起きます。",
    options: ["朝", "昼", "夜", "晩"],
    correctAnswer: "A",
    explanation: "朝（あさ）は「morning」という意味です。毎日朝に起きるのが一般的です。",
  },
  {
    level: "N5",
    type: "vocabulary",
    question: "これは___です。",
    options: ["本", "ペン", "机", "椅子"],
    correctAnswer: "A",
    explanation: "文脈から、これは本（ほん）です。本は「book」という意味です。",
  },
  {
    level: "N5",
    type: "vocabulary",
    question: "私は___を飲みます。",
    options: ["水", "食べ物", "本", "机"],
    correctAnswer: "A",
    explanation: "水（みず）は「water」という意味です。飲むことができるのは水です。",
  },

  // N5 - Grammar
  {
    level: "N5",
    type: "grammar",
    question: "私は学生___。",
    options: ["です", "ます", "ある", "いる"],
    correctAnswer: "A",
    explanation: "「です」は丁寧な肯定形です。「私は学生です。」は「I am a student.」という意味です。",
  },
  {
    level: "N5",
    type: "grammar",
    question: "毎日___勉強します。",
    options: ["一時間", "二時間", "三時間", "四時間"],
    correctAnswer: "A",
    explanation: "「一時間（いちじかん）」は「one hour」という意味です。時間を表す場合に使います。",
  },

  // N4 - Vocabulary
  {
    level: "N4",
    type: "vocabulary",
    question: "彼は___な人です。",
    options: ["親切", "美しい", "新しい", "古い"],
    correctAnswer: "A",
    explanation: "親切（しんせつ）は「kind」という意味です。な形容詞です。",
  },
  {
    level: "N4",
    type: "vocabulary",
    question: "私たちは___へ行きました。",
    options: ["公園", "学校", "病院", "駅"],
    correctAnswer: "A",
    explanation: "公園（こうえん）は「park」という意味です。へは方向を示す助詞です。",
  },

  // N4 - Grammar
  {
    level: "N4",
    type: "grammar",
    question: "もし明日___なら、私は家にいます。",
    options: ["雨が降る", "晴れる", "曇る", "風が吹く"],
    correctAnswer: "A",
    explanation: "「雨が降る（あめがふる）」は「rain falls」という意味です。条件文で使われます。",
  },

  // N3 - Vocabulary
  {
    level: "N3",
    type: "vocabulary",
    question: "このプロジェクトは___な課題に直面しています。",
    options: ["深刻", "単純", "明確", "曖昧"],
    correctAnswer: "A",
    explanation: "深刻（しんこく）は「serious」という意味です。問題の重大さを表します。",
  },
  {
    level: "N3",
    type: "vocabulary",
    question: "彼の___は素晴らしい。",
    options: ["才能", "欠点", "弱点", "失敗"],
    correctAnswer: "A",
    explanation: "才能（さいのう）は「talent」という意味です。素晴らしい能力を指します。",
  },

  // N3 - Grammar
  {
    level: "N3",
    type: "grammar",
    question: "彼は毎日___ほど忙しい。",
    options: ["働く", "走る", "歩く", "考える"],
    correctAnswer: "A",
    explanation: "「働くほど」は「as much as working」という意味で、程度を表します。",
  },

  // N2 - Vocabulary
  {
    level: "N2",
    type: "vocabulary",
    question: "この状況は___を示唆している。",
    options: ["深刻な問題", "経済的な課題", "社会的な矛盾", "政治的な対立"],
    correctAnswer: "C",
    explanation: "示唆（しさ）は「suggest」という意味です。暗に示すことを表します。",
  },
  {
    level: "N2",
    type: "vocabulary",
    question: "彼の___は業界で知られている。",
    options: ["専門知識", "一般的な知識", "基本的な知識", "表面的な知識"],
    correctAnswer: "A",
    explanation: "専門知識（せんもんちしき）は「specialized knowledge」という意味です。",
  },

  // N2 - Grammar
  {
    level: "N2",
    type: "grammar",
    question: "この論文は___ことを主張している。",
    options: ["重要である", "重要であること", "重要だということ", "重要であるという"],
    correctAnswer: "D",
    explanation: "「～という」は引用や説明を表す表現です。論文の主張を述べるのに適切です。",
  },

  // N1 - Vocabulary
  {
    level: "N1",
    type: "vocabulary",
    question: "この現象は___な社会的背景を反映している。",
    options: ["複雑で多層的", "単純で明白", "明確で直線的", "曖昧で不確定"],
    correctAnswer: "A",
    explanation: "多層的（たそうてき）は「multilayered」という意味です。複雑な構造を表します。",
  },
  {
    level: "N1",
    type: "vocabulary",
    question: "彼の議論は___を欠いている。",
    options: ["論理的一貫性", "感情的共感", "直感的理解", "経験的知識"],
    correctAnswer: "A",
    explanation: "論理的一貫性（ろんりてきいっかんせい）は「logical consistency」という意味です。",
  },

  // N1 - Grammar
  {
    level: "N1",
    type: "grammar",
    question: "彼の主張は___ばかりか、___も問題がある。",
    options: ["妥当でない", "実現不可能である", "倫理的に問題がある", "経済的に不利である"],
    correctAnswer: "A",
    explanation: "「～ばかりか」は「not only... but also...」という意味です。複数の問題を列挙します。",
  },
];

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "jlpt_quiz",
  });

  try {
    console.log("Seeding questions table...");

    for (const question of SAMPLE_QUESTIONS) {
      const query = `
        INSERT INTO questions (level, type, question, options, correctAnswer, explanation)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(query, [
        question.level,
        question.type,
        question.question,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.explanation,
      ]);
    }

    console.log(`✓ Successfully seeded ${SAMPLE_QUESTIONS.length} questions`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
