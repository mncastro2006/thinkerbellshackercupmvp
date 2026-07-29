import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import ParentGuide from "../../components/ParentGuide";
import ProgressBar from "../../components/ProgressBar";

/**
 * Parent live session: join code while waiting; once connected, one-page
 * full story text + TTS + Next/Back pacing. No story images (those are
 * student-only).
 */
export default function GeneratedCode() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [module_, setModule] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  async function poll() {
    try {
      const res = await api.get(`/sessions/${sessionId}/live`);
      setSession(res.data.session);
      setModule(res.data.module);
      if (res.data.session.status === "completed" || res.data.session.cursorStage === "done") {
        navigate(`/parent/session/${sessionId}/report`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load session");
    }
  }

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }

  function stopSpeak() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  async function handleAdvance() {
    setBusy(true);
    setError("");
    try {
      const res = await api.post(`/sessions/${sessionId}/advance`);
      setSession((s) => ({ ...s, ...res.data.session }));
      if (res.data.completed) {
        navigate(`/parent/session/${sessionId}/report`);
      } else {
        await poll();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not go forward");
    } finally {
      setBusy(false);
    }
  }

  async function handleBack() {
    setBusy(true);
    setError("");
    try {
      const res = await api.post(`/sessions/${sessionId}/back`);
      setSession((s) => ({ ...s, ...res.data.session }));
      await poll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not go back");
    } finally {
      setBusy(false);
    }
  }

  const isWaiting = session?.status === "waiting";
  const isActive = session?.status === "active";
  const storyIndex = session?.cursorStoryIndex ?? 0;
  const questionIndex = session?.cursorQuestionIndex ?? 0;
  const stage = session?.cursorStage || "story";
  const story = module_?.stories?.[storyIndex];
  const question = story?.questions?.[questionIndex];
  const feedback = session?.lastAnswerFeedback;

  const ttsText =
    stage === "question" && question
      ? `${story?.content || ""} Question: ${question.text}`
      : story?.content || story?.beats?.join(" ") || "";

  // --- GRANULAR PROGRESS CALCULATION (FIXED FOR 0% START) ---
  let currentStep = 0;
  let totalSteps = 0;
  
  if (module_?.stories) {
    module_.stories.forEach((s, idx) => {
      const qCount = s.questions?.length || 0;
      const stepsInThisStory = 1 + qCount;
      totalSteps += stepsInThisStory;
      
      if (idx < storyIndex) {
        // Entire story and its questions are completed
        currentStep += stepsInThisStory;
      } else if (idx === storyIndex) {
        // We are currently in this story
        if (stage === "question") {
          // If we reached questions, we have completed the story reading (+1)
          // and we have completed any previous questions (+questionIndex)
          currentStep += (1 + questionIndex);
        } else {
          // stage === "story"
          // We are still reading, so 0 steps completed in this current story so far
          currentStep += 0;
        }
      }
    });
  }

  return (
    <div className="generated-code-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Nunito:wght@700;900&display=swap');

        .generated-code-page-wrapper {
          font-family: 'Nunito', 'Poppins', sans-serif;
          background-image: url('/bg.png'); 
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          background-attachment: fixed;
          
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 100px 20px 40px 20px; 
          box-sizing: border-box;
        }

        /* --- GLOBAL CARD STYLE --- */
        .code-main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 40px;
          border: 6px solid #FFFFFF;
          position: relative;
          z-index: 10;
          box-shadow: 0px 20px 0px rgba(76, 55, 169, 0.08), 0px 30px 40px rgba(0,0,0,0.1);
          width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* Widened view card for side-by-side layout */
        .view-card {
          max-width: 1100px;
          padding: 40px;
          text-align: center;
        }

        /* --- WAITING FOR CONNECTION STATE --- */
        .waiting-status-card {
          max-width: 550px;
          padding: 50px 40px;
          text-align: center;
        }

        .waiting-tag {
          display: inline-block;
          background: rgba(255, 255, 255, 0.95);
          color: #6698cc;
          padding: 10px 20px;
          border-radius: 100px;
          border: 3px solid #FFFFFF;
          box-shadow: 0px 6px 0px rgba(102, 152, 204, 0.08);
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .waiting-code-display-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 30px;
          margin: 30px 0;
          border: 4px solid #FFFFFF;
          box-shadow: 0px 12px 0px #7FB9E6, 0px 20px 25px rgba(0,0,0,0.15);
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: 50px;
          color: #4c37a9;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* --- ACTIVE SESSION STATE --- */
        .parent-live-status {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .live-session-tag {
          background: rgba(255, 255, 255, 0.95);
          color: #6698cc;
          padding: 10px 20px;
          border-radius: 100px;
          border: 3px solid #FFFFFF;
          box-shadow: 0px 6px 0px rgba(102, 152, 204, 0.08);
          font-weight: 800;
          font-size: 14px;
        }

        /* Progress Bar Container styling */
        .parent-progress-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          width: 100%;
          max-width: 800px;
        }

        /* Card Content Headings & Text */
        .role-main-card h1, .parent-live h2 {
          font-size: 34px;
          font-weight: 900;
          color: #4c37a9;
          margin-top: 0;
          margin-bottom: 8px;
        }

        .role-subtitle, .parent-live p {
          font-size: 16px;
          color: #6698cc;
          font-weight: 800;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        /* --- SIDE-BY-SIDE STORY & GUIDE GRID --- */
        .story-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .story-full-text {
          background: #FAFAFA;
          border-radius: 20px;
          padding: 30px;
          border: 3px solid #f0f0f0;
          text-align: left;
          height: 100%;
          box-sizing: border-box;
        }

        .story-full-text p {
          font-size: 16px;
          line-height: 1.6;
          color: #4c37a9;
          font-weight: 700;
          margin: 0;
        }

        .ParentGuide {
          background: #fdfae7;
          border-radius: 20px;
          padding: 30px;
          text-align: left;
          position: relative;
          border: 4px dotted #F4D77A;
          height: 100%;
          box-sizing: border-box;
        }

        .ParentGuide p {
          font-size: 15px;
          line-height: 1.5;
          color: #e5c765;
          font-weight: 800;
          margin: 0 0 10px 0;
        }

        .ParentGuide p strong {
          color: #cfb155;
          font-weight: 900;
        }

        /* --- QUESTION SECTION --- */
        .parent-current-question {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 30px;
          margin-top: 10px;
          margin-bottom: 20px;
          text-align: left;
          border: 3px solid #f0f0f0;
        }

        .parent-current-question .tag {
          background: #FAFAFA;
          color: #6698cc;
          padding: 8px 16px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 12px;
          display: inline-block;
        }

        .question-text {
          font-size: 18px;
          font-weight: 900;
          color: #4c37a9;
          margin-bottom: 12px;
          margin-top: 0;
          line-height: 1.4;
        }

        /* Feedback styling */
        .feedback-ok, .feedback-bad {
          font-weight: 800;
          text-align: center;
          margin: 0;
          background: #FFFFFF;
          padding: 12px;
          border-radius: 12px;
          border-width: 2px;
          border-style: solid;
        }

        .feedback-ok {
          color: #B7C96A;
          border-color: #B7C96A;
          background: #fdfef7;
        }

        .feedback-bad {
          color: #F98BA9;
          border-color: #F98BA9;
          background: #fff0f4;
        }

        /* --- HORIZONTAL CONTROLS SECTION --- */
        .parent-controls {
          display: flex;
          flex-direction: row; /* Horizontal Layout */
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          border-top: 2px solid #f0f0f0;
          padding-top: 24px;
          width: 100%;
        }

        /* TTS Toggle Button */
        .a11y-toggle {
          cursor: pointer;
          border-radius: 30px;
          padding: 12px 30px;
          font-weight: 800;
          transition: all 0.1s ease;
          outline: none;
          display: inline-block;
          font-size: 16px;
          font-family: 'Nunito', sans-serif;
          background: #7FB9E6;
          box-shadow: 0px 8px 0px #6698cc, 0px 15px 20px rgba(0, 0, 0, 0.15);
          border: 3px solid #aaddff;
          color: #FFFFFF !important;
        }

        .a11y-toggle:hover:not(.a11y-toggle--active) {
          filter: brightness(1.05);
        }

        .a11y-toggle:active:not(.a11y-toggle--active) {
          transform: translateY(8px);
          box-shadow: 0px 0px 0px #6698cc, 0px 5px 10px rgba(0, 0, 0, 0.15);
        }

        .a11y-toggle--active {
          background: #F98BA9;
          box-shadow: 0px 8px 0px #cf6e2f, 0px 15px 20px rgba(0, 0, 0, 0.15);
          border: 3px solid #fac2d1;
        }

        .a11y-toggle--active:active {
          transform: translateY(8px);
          box-shadow: 0px 0px 0px #cf6e2f, 0px 5px 10px rgba(0, 0, 0, 0.15);
        }

        /* ParentNav group styling */
        .parent-nav {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
        }

        .parent-nav .btn--ghost {
          background: transparent;
          border-radius: 30px;
          padding: 12px 36px;
          color: #6698cc;
          text-decoration: none;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0px 4px 0px rgba(102, 152, 204, 0.08); 
        }

        .parent-nav .btn--ghost:hover:not(:disabled) {
          background: #FAFAFA;
          color: #4c37a9;
        }

        .parent-nav .btn--small {
          background-color: #4c37a9;
          color: white;
          padding: 12px 36px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          transition: background 0.2s, transform 0.1s;
          border: none;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0px 8px 0px #3c2a8c, 0px 15px 20px rgba(0, 0, 0, 0.15);
        }

        .parent-nav .btn--small:hover:not(:disabled) {
          background-color: #967cc7;
          box-shadow: 0px 8px 0px #856ab4;
        }

        .parent-nav .btn--small:active:not(:disabled) {
          transform: translateY(8px);
          box-shadow: 0px 0px 0px transparent;
        }

        /* Mobile Layout */
        @media (max-width: 850px) {
          .story-layout-grid {
            grid-template-columns: 1fr; /* Stack vertically on smaller screens */
          }
          .parent-controls {
            flex-direction: column;
            gap: 20px;
          }
          .parent-nav {
            width: 100%;
            justify-content: space-between;
          }
          .a11y-toggle, .parent-nav .btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>

      {isWaiting && (
        <>
          <div className="waiting-tag">This is your code</div>
          <div className="code-main-card waiting-status-card">
            <h1 style={{ color: "#4c37a9", fontWeight: 900 }}>Enter code on device</h1>
            <p className="helper-text" style={{color: "#6698cc"}}>
              Enter this code on your child&apos;s device to connect it to{" "}
              <strong style={{color: "#4c37a9"}}>{module_?.title}</strong>.
            </p>

            {error && <p className="feedback-bad">{error}</p>}

            {session && (
              <>
                <div className="waiting-code-display-card">{session.code}</div>
                <span className="helper-text" style={{color: "#6698cc"}}>Waiting for the student to connect...</span>
                <p className="helper-text" style={{color: "#6698cc", marginTop: "12px"}}>Code expires in about an hour if unused.</p>
              </>
            )}

            {!session && !error && <p className="helper-text" style={{color: "#6698cc"}}>Loading your code...</p>}
          </div>
        </>
      )}

      {isActive && story && (
        <>
          <div className="parent-live-status">
            <span className="live-session-tag">Connected with {session.studentName || "your learner"}</span>
          </div>

          <div className="parent-progress-container">
            {/* The granular calculation is passed here! */}
            <ProgressBar
              value={currentStep}
              max={totalSteps}
              label={`Story ${storyIndex + 1} of ${module_.stories.length}`}
            />
          </div>

          <div className="code-main-card view-card quiz-screen parent-live">
            <h2>{story.title}</h2>
            <p className="helper-text" style={{ textAlign: "center", color: "#6698cc", marginBottom: "24px" }}>
              Read the story on this page. Your child sees pictures and answer choices on their screen.
              Use Next / Back to control the pace.
            </p>

            {/* TWO COLUMN LAYOUT: Story & Parent Guide */}
            <div className="story-layout-grid">
              <div className="story-full-text">
                <p>{story.content || (story.beats || []).join(" ")}</p>
              </div>
              <ParentGuide guide={story.parentGuide} />
            </div>

            {/* QUESTION DISPLAY (spans full width below) */}
            {stage === "question" && question && (
              <div className="parent-current-question">
                <span className="tag">Question {questionIndex + 1} of {story.questions.length}</span>
                <h3 className="question-text">{question.text}</h3>
                <p className="helper-text" style={{color: "#6698cc"}}>
                  Correct answer: <strong style={{color: "#4c37a9"}}>{question.correctAnswer}</strong>
                </p>
                {feedback && feedback.questionId === question.id && (
                  <p className={feedback.isCorrect ? "feedback-ok" : "feedback-bad"} style={{marginTop: "12px"}}>
                    Learner chose <strong style={{color: feedback.isCorrect ? "#B7C96A" : "#F98BA9"}}>{feedback.givenAnswer}</strong>
                    {feedback.isCorrect ? " — correct!" : " — not quite."}
                  </p>
                )}
                {(!feedback || feedback.questionId !== question.id) && (
                  <p className="helper-text" style={{color: "#6698cc", marginTop: "12px"}}>Waiting for the learner to tap an answer…</p>
                )}
              </div>
            )}

            {stage === "story" && (
              <p className="helper-text" style={{ textAlign: "center", color: "#6698cc", margin: "10px 0" }}>
                Story visuals are on the child&apos;s screen. Press <strong style={{color: "#4c37a9"}}>Next</strong> when you are ready for questions.
              </p>
            )}

            {/* HORIZONTAL CONTROLS ROW */}
            <div className="parent-controls">
              <button
                type="button"
                className={`a11y-toggle ${speaking ? "a11y-toggle--active" : ""}`}
                onClick={() => (speaking ? stopSpeak() : speak(ttsText))}
              >
                {speaking ? "Stop voice" : "Text to voice"}
              </button>
              
              <div className="parent-nav">
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={handleBack}
                  disabled={busy || (storyIndex === 0 && stage === "story")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={handleAdvance}
                  disabled={busy}
                >
                  {busy ? "Loading..." : "Next"}
                </button>
              </div>
            </div>
            
          </div>
        </>
      )}

      {error && !isWaiting && <p className="feedback-bad">{error}</p>}
    </div>
  );
}