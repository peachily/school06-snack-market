import { useEffect, useRef, useState, type RefObject } from 'react';
import { useDragDropManager, useDragDropMonitor } from '@dnd-kit/react';
import { Feedback } from '@dnd-kit/dom';
import type { CashToken, Place } from '@snack-market/game-core';
import { places } from '../data/places';
import { findDropPlace } from './dropTarget';

export type AvailableCash = CashToken & { readonly used: boolean };

export function useCashInteraction(cash: readonly AvailableCash[], onUse: (id: string, place: Place) => void, panelRef: RefObject<HTMLDivElement | null>) {
  const manager = useDragDropManager();
  const alive = useRef(true);
  const dragging = useRef(false);
  const suppressClick = useRef(false);
  const selected = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejected, setRejected] = useState<{ place: Place; key: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');

  function clearSelection() {
    selected.current = null;
    setSelectedId(null);
  }

  function focusCash(id?: string) {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!alive.current) return;
      const buttons = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('[data-cash-button]') ?? []);
      const target = buttons.find((button) => button.dataset.cashButton === id) ?? buttons[0];
      (target ?? document.querySelector<HTMLButtonElement>('.restart-button'))?.focus();
    });
  }

  function attempt(id: string, place: Place | null) {
    if (!alive.current) return false;
    const token = cash.find((item) => item.id === id && !item.used);
    clearSelection();
    if (!token) return false;
    if (place === token.place) {
      onUse(id, place);
      setAnnouncement('현금을 옮겼습니다.');
      focusCash();
      return true;
    }
    if (place) {
      setRejected((previous) => ({ place, key: (previous?.key ?? 0) + 1 }));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { if (alive.current) setRejected(null); }, 180);
      setAnnouncement('다른 자리입니다.');
    }
    focusCash(id);
    return false;
  }

  useDragDropMonitor({
    onDragStart() {
      dragging.current = true;
      suppressClick.current = true;
      clearSelection();
      const feedback = manager?.plugins.find((plugin) => plugin instanceof Feedback);
      if (feedback) feedback.dropAnimation = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? null : { duration: 180, easing: 'ease-out' };
    },
    onDragEnd(event) {
      dragging.current = false;
      if (!alive.current) return;
      const id = event.operation.source?.id;
      if (event.canceled || typeof id !== 'string') { clearSelection(); if (typeof id === 'string') focusCash(id); return; }
      const native = event.nativeEvent;
      const point = native && 'clientX' in native && 'clientY' in native
        ? { x: Number(native.clientX), y: Number(native.clientY) }
        : event.operation.position.current;
      const areas = places.flatMap(({ corePlace }) => {
        const element = panelRef.current?.querySelector<HTMLElement>(`[data-drop-place="${corePlace}"]`);
        if (!element) return [];
        const rect = element.getBoundingClientRect();
        return [{ place: corePlace, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }];
      });
      const place = findDropPlace(point, areas);
      const valid = cash.some((token) => token.id === id && !token.used && token.place === place);
      const feedback = manager?.plugins.find((plugin) => plugin instanceof Feedback);
      if (valid && feedback) feedback.dropAnimation = null;
      attempt(id, place);
    },
  });

  useEffect(() => {
    alive.current = true;
    const cancel = () => {
      manager?.actions.stop({ canceled: true });
      const previous = selected.current;
      selected.current = null;
      setSelectedId(null);
      if (previous) {
        panelRef.current?.querySelectorAll<HTMLButtonElement>('[data-cash-button]').forEach((button) => {
          if (button.dataset.cashButton === previous) button.focus();
        });
      }
    };
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
    const hidden = () => { if (document.hidden) cancel(); };
    window.addEventListener('blur', cancel);
    window.addEventListener('keydown', keydown);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('keydown', keydown);
      document.removeEventListener('visibilitychange', hidden);
      manager?.actions.stop({ canceled: true });
    };
  }, [manager, panelRef]);

  return {
    selectedId, rejected, announcement,
    preparePointer: () => { if (!dragging.current) suppressClick.current = false; },
    selectCash: (id: string, keyboard: boolean) => {
      if (suppressClick.current || dragging.current) return;
      const token = cash.find((item) => item.id === id && !item.used);
      if (!token) return;
      if (selected.current === id) { clearSelection(); return; }
      selected.current = id;
      setSelectedId(id);
      setAnnouncement('현금을 선택했습니다.');
      if (keyboard) panelRef.current?.querySelector<HTMLButtonElement>(`[data-drop-place="${token.place}"]`)?.focus();
    },
    choosePlace: (place: Place) => { if (selected.current && !dragging.current) attempt(selected.current, place); },
  };
}

export type CashInteraction = ReturnType<typeof useCashInteraction>;
