import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import shared from '../shared.module.css';
import type { Tier } from '../../../types';

interface Props {
  /** Render prop receives the toggle handler and current open state */
  children: (toggle: () => void, isOpen: boolean) => ReactNode;
}

export default function TierOverrideMenu({ children }: Props) {
  const { state, setTier } = useWorkflow();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const choose = (tier: Tier) => {
    setTier(tier);
    setOpen(false);
  };

  return (
    <div className={shared.tierOverrideWrap} ref={wrapRef}>
      {children(() => setOpen(o => !o), open)}
      {open && (
        <div className={shared.tierOverrideMenu}>
          {[1, 2, 3].map(t => {
            const isSel = state.selectedTier === t;
            const label = t === 1 ? 'Tier 1 — Critical' : t === 2 ? 'Tier 2 — Standard' : 'Tier 3 — Low Risk';
            return (
              <button
                key={t}
                className={`${shared.tierOverrideOption} ${isSel ? shared.selected : ''}`}
                onClick={() => choose(t as Tier)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
