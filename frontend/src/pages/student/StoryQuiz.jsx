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
        // Clear local selection when parent moves to a new question/story
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
        // ignore transient poll errors
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
    <div className="page page--narrow">
      <ProgressBar
        value={overallProgress.value}
        max={overallProgress.max}
        label={`Story ${storyIndex + 1} of ${stories.length}`}
      />

      {error && <p className="error-text">{error}</p>}

      <div className="quiz-screen student-follower">
        <StoryScene
          background={story.scene?.background}
          characters={story.scene?.characters}
          objects={objects}
          size={stage === "question" ? "small" : "large"}
        />

        {stage === "story" && (
          <p className="helper-text" style={{ textAlign: "center" }}>
            Look at the pictures. Your parent will start the questions when you are ready.
          </p>
        )}

        {stage === "question" && question && (
          <>
            <p className="question-text">{question.text}</p>
            <div className="answer-grid">
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
              <p className="helper-text" style={{ textAlign: "center", marginTop: 12 }}>
                Nice! Wait for your parent to continue.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
