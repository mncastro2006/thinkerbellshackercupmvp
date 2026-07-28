import { useEffect, useState } from "react";
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

  return (
    <div className="page page--narrow">
      {isWaiting && (
        <>
          <div className="center-col">
            <h1>This is your code</h1>
            <p className="helper-text">
              Enter this code on your child&apos;s device to connect it to{" "}
              <strong>{module_?.title}</strong>.
            </p>
          </div>

          {error && <p className="error-text">{error}</p>}

          {session && (
            <>
              <div className="code-display">{session.code}</div>
              <div className="center-col">
                <span className="tag">Waiting for the student to connect...</span>
                <p className="helper-text">Code expires in about an hour if unused.</p>
              </div>
            </>
          )}

          {!session && !error && <p className="helper-text">Loading your code...</p>}
        </>
      )}

      {isActive && story && (
        <>
          <div className="live-session-status">
            <span className="tag">Connected with {session.studentName || "your learner"}</span>
          </div>

          <ProgressBar
            value={storyIndex}
            max={module_.stories.length}
            label={`Story ${storyIndex + 1} of ${module_.stories.length}`}
          />

          <div className="quiz-screen parent-live">
            <h2>{story.title}</h2>
            <p className="helper-text" style={{ textAlign: "center" }}>
              Read the story on this page. Your child sees pictures and answer choices on their screen.
              Use Next / Back to control the pace.
            </p>

            <div className="story-full-text">
              <p>{story.content || (story.beats || []).join(" ")}</p>
            </div>

            <ParentGuide guide={story.parentGuide} />

            {stage === "question" && question && (
              <div className="parent-current-question">
                <p className="tag">Question {questionIndex + 1} of {story.questions.length}</p>
                <p className="question-text">{question.text}</p>
                <p className="helper-text">
                  Correct answer: <strong>{question.correctAnswer}</strong>
                </p>
                {feedback && feedback.questionId === question.id && (
                  <p className={feedback.isCorrect ? "feedback-ok" : "feedback-bad"}>
                    Learner chose <strong>{feedback.givenAnswer}</strong>
                    {feedback.isCorrect ? " — correct!" : " — not quite."}
                  </p>
                )}
                {(!feedback || feedback.questionId !== question.id) && (
                  <p className="helper-text">Waiting for the learner to tap an answer…</p>
                )}
              </div>
            )}

            {stage === "story" && (
              <p className="helper-text" style={{ textAlign: "center" }}>
                Story visuals are on the child&apos;s screen. Press <strong>Next</strong> when you are ready for questions.
              </p>
            )}

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
                  {busy ? <span className="spinner" /> : "Next"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {error && !isWaiting && <p className="error-text">{error}</p>}
    </div>
  );
}
