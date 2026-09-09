import { Button } from '../../atoms/Button';
import type { ButtonSize } from '../../atoms/Button';
import { ButtonIsland } from '../ButtonIsland';
import type { Grade } from '../../types/types';
import {
  CloseIcon,
  MaximizeIcon,
  MinimizeIcon,
  RestoreIcon,
} from '../../utils/icons';

export interface WindowControlsHandlers {
  minimize?: () => void;
  maximize?: () => void;
  close?: () => void;
  maximized?: boolean;
}

export interface WindowControlsProps {
  controls: WindowControlsHandlers;
  size?: ButtonSize;
  grade?: Grade;
  className?: string | undefined;
}

export function WindowControls({
  controls,
  size = 'sm',
  grade,
  className,
}: WindowControlsProps) {
  const { minimize, maximize, close, maximized = false } = controls;

  if (!minimize && !maximize && !close) return null;

  return (
    <ButtonIsland
      size={size}
      {...(grade ? { grade } : {})}
      className={className}
    >
      {minimize && (
        <Button iconOnly aria-label="Minimize" onClick={minimize}>
          <MinimizeIcon />
        </Button>
      )}
      {maximize && (
        <Button
          iconOnly
          aria-label={maximized ? 'Restore' : 'Maximize'}
          onClick={maximize}
        >
          {maximized ? <RestoreIcon /> : <MaximizeIcon />}
        </Button>
      )}
      {close && (
        <Button iconOnly aria-label="Close" onClick={close}>
          <CloseIcon />
        </Button>
      )}
    </ButtonIsland>
  );
}

WindowControls.displayName = 'WindowControls';
