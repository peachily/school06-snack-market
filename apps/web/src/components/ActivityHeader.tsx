import { StudentTabs } from './StudentTabs';

export function ActivityHeader() {
  return (
    <header className="activity-header">
      <div className="activity-heading">
        <h1>얼마일까요?</h1>
        <p>현금을 드래그해서 숫자를 채워 보세요.</p>
      </div>
      <div className="header-controls">
        <StudentTabs />
        <button className="restart-button" type="button" aria-label="다시 시작" disabled>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 10a8 8 0 1 1 1 6M4 4v6h6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
