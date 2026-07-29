import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import StoryScene from "../../components/StoryScene";
import AnswerBlock from "../../components/AnswerBlock";
import ProgressBar from "../../components/ProgressBar";

/**
 * Student follower screen: polls parent cursor. Only answer choices are
 * clickable — no Next/Back, no TTS, no story text navigation.
 */
export default function StoryQuiz() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [module_, setModule] = useState(null);
  const [cursor, setCursor] = useState({
    cursorStoryIndex: 0,
    cursorQuestionIndex: 0,
    cursorStage: "story",
    status: "active",
  });
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const s = sessionStorage.getItem("tb_session");
    const m = sessionStorage.getItem("tb_module");
    if (!s || !m) {
      navigate("/student");
      return;
    }
    const parsed = JSON.parse(s);
    setSession(parsed);
    setModule(JSON.parse(m));
    setCursor({
      cursorStoryIndex: parsed.cursorStoryIndex || 0,
      cursorQuestionIndex: parsed.cursorQuestionIndex || 0,
      cursorStage: parsed.cursorStage || "story",
      status: "active",
    });
  }, [navigate]);

  useEffect(() => {
    if (!session?.id) return;

    async function pollState() {
      try {
        const res = await api.get(`/sessions/${session.id}/state`);
        setCursor(res.data);
        if (res.data.status === "completed" || res.data.cursorStage === "done") {
          navigate("/student/evaluation");
        }
        setSelected((prev) => {
          if (res.data.lastAnswerFeedback?.questionId) return prev;
          return null;
        });
        if (!res.data.lastAnswerFeedback) {
          setAnswerResult(null);
          setSelected(null);
        } else {
          setAnswerResult(res.data.lastAnswerFeedback);
          setSelected(res.data.lastAnswerFeedback.givenAnswer);
        }
      } catch {
        // ignore polling errors
      }
    }

    pollState();
    const interval = setInterval(pollState, 1200);
    return () => clearInterval(interval);
  }, [session?.id, navigate]);

  const stories = module_?.stories || [];
  const storyIndex = cursor.cursorStoryIndex || 0;
  const questionIndex = cursor.cursorQuestionIndex || 0;
  const stage = cursor.cursorStage || "story";
  const story = stories[storyIndex];
  const question = story?.questions?.[questionIndex];

  const overallProgress = useMemo(() => {
    if (!stories.length) return { value: 0, max: 1 };
    const max = stories.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
    let value = 0;
    for (let i = 0; i < storyIndex; i++) value += stories[i].questions?.length || 0;
    if (stage === "question") value += questionIndex;
    return { value, max };
  }, [stories, storyIndex, questionIndex, stage]);

  async function handleAnswer(choice) {
    if (selected || stage !== "question" || !question) return;
    setSelected(choice);
    setError("");
    try {
      const res = await api.post("/quiz/answer", {
        sessionId: session.id,
        storyId: story.id,
        questionId: question.id,
        givenAnswer: choice,
      });
      setAnswerResult({
        questionId: question.id,
        givenAnswer: choice,
        isCorrect: res.data.isCorrect,
      });
    } catch (err) {
      setSelected(null);
      setError(err.response?.data?.message || "Could not save your answer.");
    }
  }

  if (!module_ || !story) {
    return <div className="page center-col">Loading your story...</div>;
  }

  const objects =
    stage === "question" && question?.visualAssets?.length
      ? question.visualAssets
      : story.visualAssets || [];

  return (
    <div className="sq-wrapper">
      {/* Embedded Component Styles */}
      <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Nunito:wght@700;900&display=swap');

        .sq-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          margin-top: 60px;
          padding: 24px;
          box-sizing: border-box;
          font-family: 'Nunito', 'Poppins', sans-serif;
        }

        .sq-progress-container {
          margin-bottom: 16px;
        }

        .sq-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          gap: 28px;
          margin-top: 20px;
        }

        /* TOP SECTION: Split Scene (Left) & Question Text (Right) */
        .sq-top-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: center;
        }

        .sq-scene-container {
          width: 100%;
          height: 340px;
          min-height: 340px;
          max-height: 340px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
        }
        
        /* Force inner StoryScene to fill the fixed box completely */
        .sq-scene-container > * {
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          max-height: 100% !important;
          box-sizing: border-box;
        }

        .sq-text-box {
          background: #f1f5f9;
          border-radius: 16px;
          padding: 24px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sq-question-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.5;
          margin: 0;
          text-align: left;
        }

        /* BOTTOM SECTION: 4 Answer Choices Side-by-Side */
        .sq-bottom-section {
          width: 100%;
        }

        .sq-answer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          width: 100%;
        }

        .sq-helper-text {
          text-align: center;
          font-size: 1.1rem;
          color: #64748b;
          margin-top: 16px;
        }

        .sq-error {
          color: #ef4444;
          font-weight: 600;
          text-align: center;
        }

        @media (max-width: 768px) {
          .sq-top-section {
            grid-template-columns: 1fr;
          }
          .sq-answer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <ProgressBar
        value={overallProgress.value}
        max={overallProgress.max}
        label={`Story ${storyIndex + 1} of ${stories.length}`}
      />

      {error && <p className="sq-error">{error}</p>}

      <div className="sq-card">
        {/* Top Half: Visual Scene (Left) + Text/Question (Right) */}
        <div className="sq-top-section">
          <div className="sq-scene-container">
            <StoryScene
              background={story.scene?.background}
              characters={story.scene?.characters}
              objects={objects}
              size="large"
            />
          </div>

          <div className="sq-text-box">
            {stage === "story" ? (
              <p className="sq-question-text">
                {story.text || "Look at the pictures. Your parent will start the questions when you are ready."}
              </p>
            ) : (
              <p className="sq-question-text">{question?.text}</p>
            )}
          </div>
        </div>

        {/* Bottom Half: Side-by-Side 4 Answer Cards */}
        {stage === "question" && question && (
          <div className="sq-bottom-section">
            <div className="sq-answer-grid">
              {question.choices.map((choice, i) => {
                let correctness;
                if (answerResult && selected === choice) {
                  correctness = answerResult.isCorrect ? "correct" : "incorrect";
                }
                return (
                  <AnswerBlock
                    key={choice}
                    label={choice}
                    index={i}
                    selected={selected === choice}
                    disabled={!!selected}
                    correctness={correctness}
                    onClick={() => handleAnswer(choice)}
                  />
                );
              })}
            </div>

            {selected && (
              <p className="sq-helper-text">
                Nice! Wait for your parent to continue.
              </p>
            )}
          </div>
        )}

        {stage === "story" && (
          <p className="sq-helper-text">
            Look at the pictures. Your parent will start the questions when you are ready.
          </p>
        )}
      </div>
    </div>
  );
}
