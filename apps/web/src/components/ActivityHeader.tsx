import type { StudentId } from '@snack-market/game-core';
import { StudentTabs } from './StudentTabs';

type HeaderProps = { priceActivity: boolean; onToggleActivity: () => void; selectedStudent: StudentId; onSelect: (id: StudentId) => void; onRestart: () => void };

export function ActivityHeader({ selectedStudent, onSelect, onRestart, priceActivity, onToggleActivity }: HeaderProps) {
  return (
    <header className="activity-header">
      <div className="activity-heading">
        <h1>얼마일까요?</h1>
        <p>현금을 드래그해서 숫자를 채워 보세요.</p>
      </div>
      <div className="header-controls">
        <button id="activity-switch" className="activity-switch" type="button" aria-pressed={priceActivity} onClick={onToggleActivity}>{priceActivity ? '가격만큼 옮기기' : '얼마일까요?'}</button>
        {!priceActivity && <StudentTabs selected={selectedStudent} onSelect={onSelect} />}
        <button className="restart-button" type="button" aria-label="다시 시작" onClick={onRestart}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 10a8 8 0 1 1 1 6M4 4v6h6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
