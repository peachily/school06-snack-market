import type { StudentId } from '@snack-market/game-core';

export function StudentTabs({ selected, onSelect }: { selected: StudentId; onSelect: (id: StudentId) => void }) {
  return (
    <div className="student-tabs" role="tablist" aria-label="활동 선택">
      {([1, 2, 3, 4] as const).map((number) => (
        <button
          key={number}
          id={`student-tab-${number}`}
          type="button"
          role="tab"
          className="student-tab"
          aria-selected={number === selected}
          aria-controls={number === selected ? 'activity-panel' : undefined}
          tabIndex={number === selected ? 0 : -1}
          onClick={() => onSelect(number)}
          onKeyDown={(event) => {
            const target = event.key === 'ArrowRight' ? (number % 4 + 1)
              : event.key === 'ArrowLeft' ? ((number + 2) % 4 + 1)
              : event.key === 'Home' ? 1 : event.key === 'End' ? 4 : undefined;
            if (target === undefined) return;
            event.preventDefault();
            onSelect(target as StudentId);
            document.getElementById(`student-tab-${target}`)?.focus();
          }}
        >
          {number}
        </button>
      ))}
    </div>
  );
}
