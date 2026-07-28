const SHAPES = ["▲", "◆", "●", "■"];
const COLORS = ["#F4795B", "#6baa75", "#6698cc", "#F4d77a"];

export default function AnswerBlock({ label, index, onClick, selected, disabled, correctness }) {
  const shape = SHAPES[index % SHAPES.length];
  const color = COLORS[index % COLORS.length];

  let extraClass = "";
  if (correctness === "correct") extraClass = "answer-block--correct";
  if (correctness === "incorrect") extraClass = "answer-block--incorrect";
  if (selected && !correctness) extraClass = "answer-block--selected";

  return (
    <button
      className={`answer-block ${extraClass}`}
      style={{ backgroundColor: color }}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <span className="answer-block__shape">{shape}</span>
      <span className="answer-block__label">{label}</span>
    </button>
  );
}
