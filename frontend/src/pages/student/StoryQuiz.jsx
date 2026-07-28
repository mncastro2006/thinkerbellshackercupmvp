import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import StoryVisual from "../../components/StoryVisual";
import AnswerBlock from "../../components/AnswerBlock";
import ProgressBar from "../../components/ProgressBar";
import AccessibilityToggles from "../../components/AccessibilityToggles";

const STAGE = { INTRO: "intro", QUESTION: "question", FEEDBACK: "feedback", SUBMITTING: "submitting" };

export default function StoryQuiz() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [module_, setModule] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stage, setStage] = useState(STAGE.INTRO);
  const [collectedAnswers, setCollectedAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const s = sessionStorage.getItem("tb_session");
    const m = sessionStorage.getItem("tb_module");
    if (!s || !m) {
      navigate("/student");
      return;
    }
    setSession(JSON.parse(s));
    setModule(JSON.parse(m));
  }, [navigate]);

  useEffect(() => {
    document.body.classList.toggle("dyslexia-font", dyslexiaFont);
    return () => document.body.classList.remove("dyslexia-font");
  }, [dyslexiaFont]);

  const stories = module_?.stories || [];
  const story = stories[storyIndex];
  const question = story?.questions?.[questionIndex];

  const overallProgress = useMemo(() => {
    if (!stories.length) return { value: 0, max: 1 };
    const perStory = story?.questions?.length || 5;
    const doneStories = storyIndex * perStory;
    const value = doneStories + (stage === STAGE.INTRO ? 0 : questionIndex);
    const max = stories.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
    return { value, max };
  }, [stories, storyIndex, questionIndex, stage, story]);

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }

  function handleStartStory() {
    setCollectedAnswers([]);
    setQuestionIndex(0);
    setSelected(null);
    setStage(STAGE.QUESTION);
  }

  function handleAnswer(choice) {
    if (selected) return;
    setSelected(choice);
    setStage(STAGE.FEEDBACK);
    const updated = [...collectedAnswers, { questionId: question.id, givenAnswer: choice }];
    setCollectedAnswers(updated);

    setTimeout(() => {
      const isLastQuestion = questionIndex + 1 >= story.questions.length;
      if (isLastQuestion) {
        submitStory(updated);
      } else {
        setQuestionIndex((q) => q + 1);
        setSelected(null);
        setStage(STAGE.QUESTION);
      }
    }, 1100);
  }

  async function submitStory(answers) {
    setStage(STAGE.SUBMITTING);
    try {
      const res = await api.post("/quiz/submit", {
        sessionId: session.id,
        storyId: story.id,
        answers,
      });

      const isLastStory = storyIndex + 1 >= stories.length;
      if (isLastStory || res.data.isModuleComplete) {
        navigate("/student/evaluation");
      } else {
        setStoryIndex((i) => i + 1);
        setStage(STAGE.INTRO);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your answers. Please try again.");
      setStage(STAGE.QUESTION);
    }
  }

  if (!module_ || !story) {
    return <div className="page center-col">Loading your story...</div>;
  }

  return (
    <div className="page page--narrow">
      <ProgressBar value={overallProgress.value} max={overallProgress.max} label={`Story ${storyIndex + 1} of ${stories.length}`} />

      {error && <p className="error-text">{error}</p>}

      <div className="quiz-screen">
        {stage === STAGE.INTRO && (
          <div className="center-col">
            <h2>{story.title}</h2>
            <StoryVisual assets={story.visualAssets} />
            <p className="story-text">{story.content}</p>
            <AccessibilityToggles
              dyslexiaFont={dyslexiaFont}
              onToggleFont={() => setDyslexiaFont((v) => !v)}
              onSpeak={() => speak(story.content)}
              speaking={speaking}
            />
            <button className="btn" style={{ marginTop: 20 }} onClick={handleStartStory}>
              Start
            </button>
          </div>
        )}

        {(stage === STAGE.QUESTION || stage === STAGE.FEEDBACK) && question && (
          <div>
            <StoryVisual assets={question.visualAssets} size="small" />
            <p className="question-text">{question.text}</p>

            <div className="answer-grid">
              {question.choices.map((choice, i) => (
                <AnswerBlock
                  key={choice}
                  label={choice}
                  index={i}
                  selected={selected === choice}
                  disabled={stage === STAGE.FEEDBACK}
                  onClick={() => handleAnswer(choice)}
                />
              ))}
            </div>

            <AccessibilityToggles
              dyslexiaFont={dyslexiaFont}
              onToggleFont={() => setDyslexiaFont((v) => !v)}
              onSpeak={() => speak(question.text)}
              speaking={speaking}
            />
          </div>
        )}

        {stage === STAGE.SUBMITTING && (
          <div className="center-col">
            <span className="spinner" />
            <p className="helper-text">Saving your answers...</p>
          </div>
        )}
      </div>
    </div>
  );
}
