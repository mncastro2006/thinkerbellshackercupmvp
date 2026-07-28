/**
 * Plain-language teaching guide, shown ONLY on the parent's screen, telling
 * the parent how to explain the concept behind the current story (PRD
 * roadmap: parent teaching guide). Never rendered on the student device -
 * the backend also never sends parentGuide to the student payload.
 */
export default function ParentGuide({ guide }) {
  if (!guide) return null;
  return (
    <div className="parent-guide">
      <div className="parent-guide__title">🧭 Guide for you (not shown to your child)</div>
      <p className="parent-guide__text">{guide}</p>
    </div>
  );
}
