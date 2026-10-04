import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Select PDF
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  // Analyze Resume
  const analyzeResume = async () => {
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("https://ai-resume-analyzer-i9au.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("Backend result:", data);

      if (!data.success) {
        alert("Resume analysis failed.");
        return;
      }

      // Make sure all required values exist
      setResult({
        score: data.score || 0,
        skills: Array.isArray(data.skills) ? data.skills : [],
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        improvements: Array.isArray(data.improvements)
          ? data.improvements
          : [],
        text: data.text || "",
      });

    } catch (error) {
      console.error("ERROR:", error);
      alert(
        "Backend is not running. Please make sure node server.js is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Analyze another resume
  const analyzeAnotherResume = () => {
    setFile(null);
    setResult(null);
  };

  // Safe values
  const skills = result?.skills || [];
  const strengths = result?.strengths || [];
  const improvements = result?.improvements || [];
  const resumeText = result?.text || "";

  // Calculate breakdown
  const skillsPercentage = Math.min(
    skills.length * 10 + 20,
    100
  );

  const experiencePercentage =
    resumeText.toLowerCase().includes("experience") ||
    resumeText.toLowerCase().includes("internship")
      ? 80
      : 40;

  const educationPercentage =
    resumeText.toLowerCase().includes("education") ||
    resumeText.toLowerCase().includes("degree") ||
    resumeText.toLowerCase().includes("bachelor")
      ? 90
      : 40;

  return (
    <div className="app">

      {/* Navbar */}
      <header className="navbar">

        <div className="logo">
          🤖 ResumeAI
        </div>

        <div className="nav-text">
          AI Resume Analyzer
        </div>

      </header>

      {/* Main */}
      <main className="main">

        {/* Hero */}
        <section className="hero">

          <h1>
            Analyze Your Resume
            <br />
            <span>With AI</span>
          </h1>

          <p>
            Upload your resume and get insights about your
            skills, strengths and areas for improvement.
          </p>

          {/* Upload */}
          <div className="upload-section">

            <label className="upload-box">

              <div className="upload-icon">
                📄
              </div>

              <h3>
                Upload Your Resume
              </h3>

              <p>
                PDF files only
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />

              <span className="choose-button">
                Choose PDF
              </span>

            </label>

            {/* Selected File */}
            {file && (
              <div className="selected-file">

                <span>📄</span>

                <div>
                  <strong>
                    {file.name}
                  </strong>

                  <small>
                    Ready to analyze
                  </small>
                </div>

              </div>
            )}

            {/* Analyze Button */}
            {file && (
              <button
                className="analyze-button"
                onClick={analyzeResume}
                disabled={loading}
              >
                {loading
                  ? "Analyzing..."
                  : "✨ Analyze Resume"}
              </button>
            )}

          </div>

        </section>

        {/* Results */}
        {result && (
          <section className="results">

            <h2>
              Resume Analysis
            </h2>

            <p className="results-subtitle">
              Here's what we found in your resume
            </p>

            {/* Score Card */}
            <div className="score-card">

              <div>

                <h3>
                  Resume Score
                </h3>

                <p>
                  Your overall resume score
                </p>

              </div>

              <div
                className="score-circle"
                style={{
                  background: `conic-gradient(
                    #6366f1 0% ${result.score}%,
                    #e5e7eb ${result.score}% 100%
                  )`,
                }}
              >

                <div className="score-number">

                  {result.score}

                  <span>
                    /100
                  </span>

                </div>

              </div>

            </div>

            {/* Quality Breakdown */}
            {/* Quality Breakdown */}
<div className="breakdown">

  <h3>
    📊 Resume Quality Breakdown
  </h3>

  {/* Skills */}
  <div className="breakdown-item">

    <div className="breakdown-label">
      <span>Skills</span>
      <strong>{skillsPercentage}%</strong>
    </div>

    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: `${skillsPercentage}%`,
        }}
      ></div>
    </div>

  </div>


  {/* Experience */}
  <div className="breakdown-item">

    <div className="breakdown-label">
      <span>Experience</span>
      <strong>{experiencePercentage}%</strong>
    </div>

    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: `${experiencePercentage}%`,
        }}
      ></div>
    </div>

  </div>


  {/* Education */}
  <div className="breakdown-item">

    <div className="breakdown-label">
      <span>Education</span>
      <strong>{educationPercentage}%</strong>
    </div>

    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: `${educationPercentage}%`,
        }}
      ></div>
    </div>

  </div>


  {/* Formatting */}
  <div className="breakdown-item">

    <div className="breakdown-label">
      <span>Formatting</span>
      <strong>80%</strong>
    </div>

    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: "80%",
        }}
      ></div>
    </div>

  </div>

</div>

            {/* Cards */}
            <div className="cards">

              {/* Skills Card */}
              <div className="card">

                <div className="card-icon">
                  💻
                </div>

                <h3>
                  Skills Found
                </h3>

                <div className="skills">

                  {skills.length > 0 ? (

                    skills.map((skill, index) => (
                      <span key={index}>
                        {skill}
                      </span>
                    ))

                  ) : (

                    <p>
                      No recognized skills found.
                    </p>

                  )}

                </div>

              </div>

              {/* Strengths Card */}
              <div className="card">

                <div className="card-icon">
                  💪
                </div>

                <h3>
                  Strengths
                </h3>

                {strengths.length > 0 ? (

                  strengths.map((strength, index) => (
                    <p key={index}>
                      • {strength}
                    </p>
                  ))

                ) : (

                  <p>
                    No strengths detected yet.
                  </p>

                )}

              </div>

              {/* Improvements Card */}
              <div className="card">

                <div className="card-icon">
                  ⚠️
                </div>

                <h3>
                  Areas to Improve
                </h3>

                {improvements.length > 0 ? (

                  improvements.map((improvement, index) => (
                    <p key={index}>
                      • {improvement}
                    </p>
                  ))

                ) : (

                  <p>
                    No improvements suggested.
                  </p>

                )}

              </div>

              {/* Suggestions */}
              <div className="card">

                <div className="card-icon">
                  💡
                </div>

                <h3>
                  Suggestions
                </h3>

                <p>
                  Add measurable achievements, relevant
                  projects and certifications to make your
                  resume stronger.
                </p>

              </div>

            </div>

            {/* Another Resume */}
            <button
              className="new-resume-button"
              onClick={analyzeAnotherResume}
            >
              📄 Analyze Another Resume
            </button>

          </section>
        )}

      </main>

      {/* Footer */}
      <footer>

        <p>
          ResumeAI © 2026 • AI Resume Analyzer
        </p>

      </footer>

    </div>
  );
}

export default App;