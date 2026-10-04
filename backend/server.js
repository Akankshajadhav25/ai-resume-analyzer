const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// -----------------------------
// Upload folder
// -----------------------------

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// -----------------------------
// Multer configuration
// -----------------------------

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

// -----------------------------
// Home route
// -----------------------------

app.get("/", (req, res) => {
  res.send("Resume Analyzer Backend is running!");
});

// -----------------------------
// Skills list
// -----------------------------

const skillList = [
  "Python",
  "Java",
  "C++",
  "C",
  "JavaScript",
  "HTML",
  "CSS",
  "React",
  "Node.js",
  "Express",
  "SQL",
  "MySQL",
  "MongoDB",
  "Power BI",
  "Tableau",
  "Excel",
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "AI",
  "Data Science",
  "Data Analysis",
  "Data Visualization",
  "Big Data",
  "BigQuery",
  "Cloud Computing",
  "AWS",
  "Azure",
  "Google Cloud",
  "Git",
  "GitHub",
  "Docker",
  "Cybersecurity",
  "Linux",
  "R",
  "NLP",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Scikit-learn",
];

// -----------------------------
// Find skills
// -----------------------------

function findSkills(text) {
  const lowerText = text.toLowerCase();

  return skillList.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );
}

// -----------------------------
// Calculate resume analysis
// -----------------------------

function analyzeResume(text) {
  const lowerText = text.toLowerCase();

  // Skills
  const skills = findSkills(text);

  // -----------------------------
  // Skills score
  // -----------------------------

  let skillsScore = Math.min(100, skills.length * 10);

  if (skills.length >= 5) {
    skillsScore = Math.max(skillsScore, 70);
  }

  if (skills.length >= 8) {
    skillsScore = Math.max(skillsScore, 85);
  }

  if (skills.length >= 10) {
    skillsScore = 100;
  }

  // -----------------------------
  // Experience score
  // -----------------------------

  const experienceKeywords = [
    "experience",
    "internship",
    "intern",
    "worked",
    "work experience",
    "employment",
    "project",
    "projects",
  ];

  const experienceFound = experienceKeywords.some((keyword) =>
    lowerText.includes(keyword)
  );

  let experienceScore = experienceFound ? 80 : 40;

  if (
    lowerText.includes("internship") ||
    lowerText.includes("experience")
  ) {
    experienceScore = 90;
  }

  if (lowerText.includes("project") || lowerText.includes("projects")) {
    experienceScore = Math.min(100, experienceScore + 10);
  }

  // -----------------------------
  // Education score
  // -----------------------------

  const educationKeywords = [
    "education",
    "bachelor",
    "b.sc",
    "bsc",
    "degree",
    "university",
    "college",
    "master",
    "m.sc",
    "msc",
    "school",
  ];

  const educationFound = educationKeywords.some((keyword) =>
    lowerText.includes(keyword)
  );

  const educationScore = educationFound ? 90 : 40;

  // -----------------------------
  // Formatting score
  // -----------------------------

  let formattingScore = 60;

  if (text.length > 500) {
    formattingScore += 10;
  }

  if (text.length > 1000) {
    formattingScore += 10;
  }

  if (lowerText.includes("email")) {
    formattingScore += 5;
  }

  if (
    lowerText.includes("phone") ||
    /\b\d{10}\b/.test(text)
  ) {
    formattingScore += 5;
  }

  if (
    lowerText.includes("linkedin") ||
    lowerText.includes("github")
  ) {
    formattingScore += 10;
  }

  formattingScore = Math.min(100, formattingScore);

  // -----------------------------
  // Overall score
  // -----------------------------

  const score = Math.round(
    (skillsScore +
      experienceScore +
      educationScore +
      formattingScore) /
      4
  );

  // -----------------------------
  // Strengths
  // -----------------------------

  const strengths = [];

  if (skillsScore >= 70) {
    strengths.push("Good range of technical skills.");
  }

  if (experienceScore >= 70) {
    strengths.push("Experience or project information is present.");
  }

  if (educationScore >= 70) {
    strengths.push("Education details are clearly mentioned.");
  }

  if (formattingScore >= 70) {
    strengths.push("Resume has a reasonably good structure.");
  }

  if (skills.length > 0) {
    strengths.push(
      `Detected ${skills.length} relevant technical skill(s).`
    );
  }

  if (strengths.length === 0) {
    strengths.push("Resume information was successfully extracted.");
  }

  // -----------------------------
  // Improvements
  // -----------------------------

  const improvements = [];

  if (skillsScore < 70) {
    improvements.push(
      "Add more relevant technical skills related to the job."
    );
  }

  if (experienceScore < 70) {
    improvements.push(
      "Add internships, projects, or practical experience."
    );
  }

  if (educationScore < 70) {
    improvements.push(
      "Add complete education and degree details."
    );
  }

  if (formattingScore < 70) {
    improvements.push(
      "Improve resume formatting and make sections easier to read."
    );
  }

  if (!lowerText.includes("linkedin")) {
    improvements.push("Consider adding your LinkedIn profile.");
  }

  if (!lowerText.includes("github")) {
    improvements.push("Consider adding your GitHub profile.");
  }

  if (improvements.length === 0) {
    improvements.push(
      "Keep improving your resume with measurable achievements."
    );
  }

  return {
    score,
    breakdown: {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      formatting: formattingScore,
    },
    skills,
    strengths,
    improvements,
  };
}

// -----------------------------
// Upload and analyze PDF
// -----------------------------

app.post(
  "/upload",
  upload.single("resume"),
  async (req, res) => {
    let filePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Please upload a PDF resume.",
        });
      }

      filePath = req.file.path;

      const dataBuffer = fs.readFileSync(filePath);

      // pdf-parse v2
      const parser = new PDFParse({
        data: dataBuffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      const text = result.text || "";

      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          error:
            "Could not extract text from this PDF. Please upload a text-based PDF.",
        });
      }

      const analysis = analyzeResume(text);

      return res.json({
        success: true,
        score: analysis.score,
        breakdown: analysis.breakdown,
        skills: analysis.skills,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        text: text,
      });
    } catch (error) {
      console.error("Resume analysis error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to analyze resume.",
      });
    } finally {
      // Delete uploaded temporary file
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (deleteError) {
          console.error(
            "Could not delete temporary file:",
            deleteError
          );
        }
      }
    }
  }
);

// -----------------------------
// Error handler
// -----------------------------

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    error: err.message || "Something went wrong.",
  });
});

// -----------------------------
// Start server
// -----------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});