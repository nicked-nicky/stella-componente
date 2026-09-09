import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Slider.module.css';
import type { Grade, SizeSML } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type SliderSize = SizeSML;

interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | 'type'
  | 'size'
  | 'min'
  | 'max'
  | 'step'
  | 'value'
  | 'defaultValue'
  | 'onChange'
> {
  size?: SliderSize;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  label?: React.ReactNode;
  showValue?: boolean;
  grade?: Grade;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      size = 'md',
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onValueChange,
      label,
      showValue = true,
      grade: gradeProp,
      disabled,
      className,
      id,
      ...props
    },
    forwardedRef
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? min);
    const committedValue = isControlled ? value : internalValue;

    const [liveValue, setLiveValueState] = useState(committedValue);
    const liveValueRef = useRef(liveValue);

    const clamp = (raw: number) => Math.min(max, Math.max(min, raw));

    const setLive = (raw: number) => {
      const clamped = clamp(raw);
      liveValueRef.current = clamped;
      setLiveValueState(clamped);
      return clamped;
    };

    const commitExternal = (next: number) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    };

    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);

    useEffect(() => {
      if (!isDraggingRef.current) setLive(committedValue);
    }, [committedValue]);

    const [isEditing, setIsEditing] = useState(false);
    const [draftValue, setDraftValue] = useState(String(liveValue));

    const autoId = React.useId();
    const inputId = id ?? autoId;

    const trackStyle = useMemo(() => {
      const fraction = (liveValue - min) / (max - min || 1);
      return {
        '--slider-fraction': fraction,
      } as React.CSSProperties;
    }, [liveValue, min, max]);

    const handleTrackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const clamped = setLive(Number(event.target.value));
      if (!isDraggingRef.current) commitExternal(clamped);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
      isDraggingRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = () => {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setIsDragging(true);
      }
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) commitExternal(liveValueRef.current);
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    const startEditing = () => {
      if (disabled) return;
      setDraftValue(String(liveValue));
      setIsEditing(true);
    };

    const commitDraft = () => {
      const parsed = Number(draftValue);
      if (!Number.isNaN(parsed)) commitExternal(setLive(parsed));
      setIsEditing(false);
    };

    const cancelDraft = () => {
      setIsEditing(false);
    };

    const trackBox = (
      <span
        data-stella-grade={grade}
        className={cx(styles.trackBox, isDragging && styles.dragging)}
        style={trackStyle}
      >
        <input
          ref={forwardedRef}
          type="range"
          id={inputId}
          min={min}
          max={max}
          step={step}
          value={liveValue}
          disabled={disabled}
          onChange={handleTrackChange}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={cx(styles.track, className)}
          {...props}
        />
        <span className={styles.trackRail} aria-hidden="true" />
        <span className={styles.trackFill} aria-hidden="true" />
        <span className={styles.thumbGhost} aria-hidden="true" />
      </span>
    );

    const valueControl =
      showValue &&
      (isEditing ? (
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={draftValue}
          disabled={disabled}
          autoFocus
          className={styles.valueInput}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft();
            if (e.key === 'Escape') cancelDraft();
          }}
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          className={styles.valueButton}
          aria-label={`Edit ${typeof label === 'string' ? label : 'value'}, currently ${liveValue}`}
          onClick={startEditing}
        >
          {liveValue}
        </button>
      ));

    const control = (
      <span className={cx(styles.wrapper, styles[`size-${size}`])}>
        {trackBox}
        {valueControl}
      </span>
    );

    if (!label) return control;

    return (
      <span className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        {control}
      </span>
    );
  }
);

Slider.displayName = 'Slider';

export type { SliderProps, SliderSize };
