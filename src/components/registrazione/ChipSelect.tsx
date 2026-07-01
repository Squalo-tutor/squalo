type ChipSelectProps = {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export default function ChipSelect({ options, selected, onChange }: ChipSelectProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-[#06B6D4] bg-[#06B6D4] text-white"
                : "border-black/10 bg-white text-[#0A2027] hover:border-[#06B6D4]"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
