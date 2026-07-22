// A paragraph where only the word currently under the cursor highlights —
// like pointing at words as you read. Pure CSS :hover per word (no JS), using
// the site's selection colours (black bg / cream text).
export default function ReadingText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <p className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="rounded-[2px] transition-colors duration-150 hover:bg-black hover:text-background motion-reduce:transition-none">
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
