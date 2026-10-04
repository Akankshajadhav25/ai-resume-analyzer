const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const app = express();

app.use(cors());

const upload = multer({
  dest: "uploads/"
});

app.get("/", (req, res) => {
  res.send("Resume Analyzer Backend is running!");
});

app.post("/upload", upload.single("resume"), async (req, res) => {
  console.log("Resume received:", req.file.originalname);

  try {
    // 1. Read PDF
    const data = fs.readFileSync(req.file.path);

    // 2. Extract text
    const parser = new PDFParse({
      data: data
    });

    const result = await parser.getText();

    await parser.destroy();

    // 3. Delete temporary PDF
    fs.unlinkSync(req.file.path);

    console.log("PDF text extracted successfully!");
    console.log("EXTRACTED TEXT:", result.text.substring(0, 1000));

    // 4. Convert text to lowercase
    const resumeText = result.text.toLowerCase();

    // ==========================================
    // SKILLS
    // ==========================================

    const skillList = [
      "python",
      "java",
      "javascript",
      "react",
      "html",
      "css",
      "sql",
      "machine learning",
      "artificial intelligence",
      "data science",
      "data analysis",
      "data visualization",
      "data visualtion",
      "bigquery",
      "cloud storage",
      "cloud computing",
      "power bi",
      "excel",
      "git",
      "github",
      "cybersecurity",
      "communication",
      "time management",
      "problem-solving",
      "problem solving",
      "analytical thinking",
      "soft skills"
    ];

    const skillsFound = [
      ...new Set(
        skillList.filter((skill) =>
          resumeText.includes(skill)
        )
      )
    ];

    // ==========================================
    // CATEGORY CHECKS
    // ==========================================

    const hasEducation =
      resumeText.includes("education") ||
      resumeText.includes("bachelor") ||
      resumeText.includes("b.sc") ||
      resumeText.includes("degree") ||
      resumeText.includes("university");

    const hasExperience =
      resumeText.includes("experience") ||
      resumeText.includes("internship") ||
      resumeText.includes("worked") ||
      resumeText.includes("employment");

    const hasProjects =
      resumeText.includes("project") ||
      resumeText.includes("projects");

    const hasCertification =
      resumeText.includes("certification") ||
      resumeText.includes("certifications") ||
      resumeText.includes("certificate") ||
      resumeText.includes("virtual internship");

    const hasEmail =
      resumeText.includes("@");

    const hasPhone =
      /\b\d{10}\b/.test(resumeText);

    const hasLinkedIn =
      resumeText.includes("linkedin");

    const hasSummary =
      resumeText.includes("summary") ||
      resumeText.includes("profile") ||
      resumeText.includes("objective");

    const hasAchievements =
      resumeText.includes("achievement") ||
      resumeText.includes("achievements") ||
      resumeText.includes("award") ||
      resumeText.includes("awards");

    // ==========================================
    // SCORE
    // ==========================================

    let score = 0;

    // Skills - 20
    if (skillsFound.length >= 8) {
      score += 20;
    } else if (skillsFound.length >= 5) {
      score += 15;
    } else if (skillsFound.length >= 3) {
      score += 10;
    } else if (skillsFound.length > 0) {
      score += 5;
    }

    // Education - 15
    if (hasEducation) {
      score += 15;
    }

    // Experience - 15
    if (hasExperience) {
      score += 15;
    }

    // Projects - 15
    if (hasProjects) {
      score += 15;
    }

    // Certifications - 10
    if (hasCertification) {
      score += 10;
    }

    // Contact information - 10
    if (hasEmail && hasPhone) {
      score += 10;
    } else if (hasEmail || hasPhone) {
      score += 5;
    }

    // LinkedIn - 5
    if (hasLinkedIn) {
      score += 5;
    }

    // Summary - 5
    if (hasSummary) {
      score += 5;
    }

    // Achievements - 5
    if (hasAchievements) {
      score += 5;
    }

    if (score > 100) {
      score = 100;
    }

    // ==========================================
    // STRENGTHS
    // ==========================================

    const strengths = [];

    if (skillsFound.length >= 5) {
      strengths.push(
        "Good technical and professional skill coverage."
      );
    } else if (skillsFound.length > 0) {
      strengths.push(
        "Relevant skills are included in the resume."
      );
    }

    if (hasExperience) {
      strengths.push(
        "Practical experience or internship is included."
      );
    }

    if (hasEducation) {
      strengths.push(
        "Educational qualifications are clearly mentioned."
      );
    }

    if (hasLinkedIn) {
      strengths.push(
        "LinkedIn profile is included."
      );
    }

    if (hasSummary) {
      strengths.push(
        "Resume includes a professional summary."
      );
    }

    if (strengths.length === 0) {
      strengths.push(
        "Resume information was successfully extracted."
      );
    }

    // ==========================================
    // IMPROVEMENTS
    // ==========================================

    const improvements = [];

    if (!hasProjects) {
      improvements.push(
        "Add relevant academic or personal projects."
      );
    }

    if (!hasCertification) {
      improvements.push(
        "Add relevant certifications."
      );
    }

    if (!hasAchievements) {
      improvements.push(
        "Add measurable achievements and results."
      );
    }

    if (!hasLinkedIn) {
      improvements.push(
        "Add your LinkedIn profile."
      );
    }

    if (skillsFound.length < 5) {
      improvements.push(
        "Add more relevant technical and professional skills."
      );
    }

    if (improvements.length === 0) {
      improvements.push(
        "Keep adding measurable results to your experience and projects."
      );
    }

    // ==========================================
    // SEND RESULT
    // ==========================================

    res.json({
      success: true,
      score: score,
      skills: skillsFound,
      strengths: strengths,
      improvements: improvements,
      text: result.text
    });

  } catch (error) {

    console.error("PDF ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(5000, () => {
  console.log(
    "Backend running on http://localhost:5000"
  );
});