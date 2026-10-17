export function StudentTabs() {
  return (
    <div className="student-tabs" role="tablist" aria-label="활동 선택">
      {([1, 2, 3] as const).map((number) => (
        <button
          key={number}
          id={`student-tab-${number}`}
          type="button"
          role="tab"
          className="student-tab"
          aria-selected={number === 1}
          aria-controls={number === 1 ? 'activity-panel' : undefined}
          disabled
        >
          {number}
        </button>
      ))}
    </div>
  );
}
