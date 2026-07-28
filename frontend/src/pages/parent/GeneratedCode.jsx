import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import StoryScene from "../../components/StoryScene";
import ParentGuide from "../../components/ParentGuide";
import ProgressBar from "../../components/ProgressBar";

/**
 * Parent's screen for an active session. While waiting, this just shows the
 * join code. Once the student connects, it becomes the parent's "live
 * session view": it mirrors the story the child is currently on and shows
 * the teaching guide for that story - so the parent can read/narrate the
 * story aloud and know how to explain the concept, while the student's
 * screen stays focused on visuals + answer selection (PRD roadmap item:
 * parent-facing live session view + teaching guide).
 */
export default function GeneratedCode() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [module_, setModule] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [error, setError] = useState("");

  async function poll() {
    try {
      const res = await api.get(`/sessions/${sessionId}/live`);
      setSession(res.data.session);
      setModule(res.data.module);
      setCurrentStoryIndex(res.data.currentStoryIndex);
      if (res.data.session.status === "completed") {
        navigate(`/parent/session/${sessionId}/report`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load session");
    }
  }

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const isWaiting = session?.status === "waiting";
  const isActive = session?.status === "active";
  const story = module_?.stories?.[currentStoryIndex];

  return (
    <div className="page page--narrow">
      {isWaiting && (
        <>
          <div className="center-col">
            <h1>This is your code</h1>
            <p className="helper-text">
              Enter this code on your child's device to connect it to <strong>{module_?.title}</strong>.
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
            <span className="tag">🟢 Connected with {session.studentName || "your learner"}</span>
          </div>

          <ProgressBar
            value={currentStoryIndex}
            max={module_.stories.length}
            label={`Story ${currentStoryIndex + 1} of ${module_.stories.length}`}
          />

          <div className="quiz-screen">
            <h2>{story.title}</h2>
            <p className="helper-text" style={{ textAlign: "center" }}>
              Read this story aloud to your child, then help them find each answer on their screen.
            </p>

            <StoryScene
              background={story.scene?.background}
              characters={story.scene?.characters}
              objects={story.visualAssets}
            />

            <div className="story-beats">
              {(story.beats?.length ? story.beats : [story.content]).map((beat, i) => (
                <p key={i} className="story-beat" style={{ animation: "none", opacity: 1, transform: "none" }}>
                  {beat}
                </p>
              ))}
            </div>

            <ParentGuide guide={story.parentGuide} />
          </div>
        </>
      )}

      {error && !isWaiting && <p className="error-text">{error}</p>}
    </div>
  );
}
