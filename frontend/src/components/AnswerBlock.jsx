const SHAPES = ["▲", "◆", "●", "■"];
const COLORS = ["#F4795B", "#4C9F70", "#4E8FE0", "#F2C230"];

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
