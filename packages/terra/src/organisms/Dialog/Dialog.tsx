import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../atoms/Button';
import { ButtonIsland } from '../../molecules/ButtonIsland';
import { Text } from '../../atoms/Text';
import { useModalSurface } from '../../internal/useModalSurface';
import { CloseIcon } from '../../utils/icons';
import styles from './Dialog.module.css';
import type { Grade, SizeSML } from '../../types/types';
import { cx } from '../../utils/cx';

const EXIT_DURATION_MS = 150;

export type DialogSize = SizeSML;

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  size?: DialogSize;
  closeOnBackdrop?: boolean;
  grade?: Grade;
  className?: string;
  children?: React.ReactNode;
}

interface DialogContextValue {
  titleId: string;
  descriptionId: string;
  onClose: (() => void) | undefined;
  registerTitle: () => void;
  unregisterTitle: () => void;
  registerDescription: () => void;
  unregisterDescription: () => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog subcomponents must be used inside <Dialog>.');
  }
  return ctx;
}

export function Dialog({
  open,
  onClose,
  size = 'md',
  closeOnBackdrop = true,
  grade = 'global',
  className,
  children,
}: DialogProps) {
  const {
    root,
    visible,
    closing,
    panelRef,
    onBackdropMouseDown,
    onPanelKeyDown,
  } = useModalSurface({
    open,
    onClose,
    closeOnBackdrop,
    exitDurationMs: EXIT_DURATION_MS,
  });

  const titleId = useId();
  const descriptionId = useId();
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const registerTitle = useCallback(() => setHasTitle(true), []);
  const unregisterTitle = useCallback(() => setHasTitle(false), []);
  const registerDescription = useCallback(() => setHasDescription(true), []);
  const unregisterDescription = useCallback(() => setHasDescription(false), []);

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      titleId,
      descriptionId,
      onClose,
      registerTitle,
      unregisterTitle,
      registerDescription,
      unregisterDescription,
    }),
    [
      titleId,
      descriptionId,
      onClose,
      registerTitle,
      unregisterTitle,
      registerDescription,
      unregisterDescription,
    ]
  );

  if (!visible || !root) return null;

  return createPortal(
    <div
      className={cx(styles.backdrop, closing && styles.closing)}
      onMouseDown={onBackdropMouseDown}
    >
      <div
        ref={panelRef}
        data-stella-component="dialog"
        data-stella-grade={grade}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className={cx(
          styles.panel,
          styles[`size-${size}`],
          closing && styles.closing,
          className
        )}
      >
        <DialogContext.Provider value={contextValue}>
          {children}
        </DialogContext.Provider>
      </div>
    </div>,
    root
  );
}

Dialog.displayName = 'Dialog';

function DialogHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { onClose } = useDialogContext();
  return (
    <div className={cx(styles.header, className)} {...props}>
      <div className={styles.headerTitle}>{children}</div>
      {onClose && (
        <ButtonIsland size="xs" grade="elevated" floating>
          <Button iconOnly aria-label="Close dialog" onClick={onClose}>
            <CloseIcon />
          </Button>
        </ButtonIsland>
      )}
    </div>
  );
}

DialogHeader.displayName = 'Dialog.Header';

function DialogTitle({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { titleId, registerTitle, unregisterTitle } = useDialogContext();
  useEffect(() => {
    registerTitle();
    return unregisterTitle;
  }, [registerTitle, unregisterTitle]);
  return (
    <Text id={titleId} variant="title-3" as="h3" className={className}>
      {children}
    </Text>
  );
}

DialogTitle.displayName = 'Dialog.Title';

function DialogDescription({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { descriptionId, registerDescription, unregisterDescription } =
    useDialogContext();
  useEffect(() => {
    registerDescription();
    return unregisterDescription;
  }, [registerDescription, unregisterDescription]);
  return (
    <Text
      id={descriptionId}
      variant="body"
      color="secondary"
      as="p"
      className={className}
    >
      {children}
    </Text>
  );
}

DialogDescription.displayName = 'Dialog.Description';

function DialogBody({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.body, className)} {...props}>
      {children}
    </div>
  );
}

DialogBody.displayName = 'Dialog.Body';

function DialogFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}

DialogFooter.displayName = 'Dialog.Footer';

Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;
