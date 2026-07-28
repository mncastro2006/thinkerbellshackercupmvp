import { Link } from "react-router-dom";
import IconCircle from "../components/IconCircle";
import WavyDivider from "../components/WavyDivider";

export default function Landing() {
  return (
    <div className="page page--wide">
      <section className="hero">
        <div className="hero__copy">
          <h1>Math made visual, gentle, and just for them 🍎</h1>
          <p>
            ThinkerBells turns any lesson PDF into short, illustrated stories with
            bite-sized questions — designed to help neurodivergent kids build
            confidence in math, one story at a time.
          </p>
          <Link to="/role" className="btn">Get started</Link>
        </div>
        <div className="hero__art">
          <IconCircle size={160} emoji="🔔" />
        </div>
      </section>

      <WavyDivider />

      <section className="feature-grid">
        <div className="feature-card">
          <div className="feature-card__icon">📄</div>
          <h3>Upload any lesson</h3>
          <p className="helper-text">Parents upload a PDF module and AI turns it into 3 easy stories with 5 questions each.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon">🔗</div>
          <h3>Kahoot-style connect</h3>
          <p className="helper-text">A simple code links the parent's screen to the student's device — no complicated logins.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon">🍊</div>
          <h3>Visual, friendly stories</h3>
          <p className="helper-text">Emoji visuals, text-to-speech, and a dyslexia-friendly font keep learning approachable.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon">📊</div>
          <h3>Actionable feedback</h3>
          <p className="helper-text">After each session, parents get a plain-language report on strengths and next steps.</p>
        </div>
      </section>
    </div>
  );
}
