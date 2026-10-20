import type { StudentId } from '@snack-market/game-core';
import { StudentTabs } from './StudentTabs';

type HeaderProps = { priceActivity: boolean; onToggleActivity: () => void; selectedStudent: StudentId; onSelect: (id: StudentId) => void; onRestart: () => void };

export function ActivityHeader({ selectedStudent, onSelect, onRestart, priceActivity, onToggleActivity }: HeaderProps) {
  return (
    <header className="activity-header">
      <div className="activity-heading">
        <h1 id="activity-title">{priceActivity ? '얼마를 낼까요?' : '얼마일까요?'}</h1>
        <p>{priceActivity ? '내가 좋아하는 과자와 아이스크림은 얼마일까요?' : '돈을 옮겨서 가격표를 만들어 보세요.'}</p>
      </div>
      <div className="header-controls">
        <button id="activity-switch" className="activity-switch" type="button" onClick={onToggleActivity}>{priceActivity ? '얼마일까요?' : '얼마를 낼까요?'}</button>
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
