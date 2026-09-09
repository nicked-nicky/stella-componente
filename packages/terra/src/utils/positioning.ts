export type PlacementSide = 'top' | 'bottom' | 'left' | 'right';
export type PlacementAlign = 'start' | 'center' | 'end';

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface VirtualAnchor {
  getBoundingClientRect(): Rect;
}

export type Anchor = HTMLElement | VirtualAnchor;

interface ComputeAnchoredPositionInput {
  anchorRect: Rect;
  panelWidth: number;
  panelHeight: number;
  placement: Placement;
  offset: number;
  padding: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface ComputeAnchoredPositionResult {
  top: number;
  left: number;
  placement: Placement;
}

const OPPOSITE: Record<PlacementSide, PlacementSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function parsePlacement(placement: Placement): {
  side: PlacementSide;
  align: PlacementAlign;
} {
  const [side, align] = placement.split('-') as [
    PlacementSide,
    PlacementAlign?,
  ];
  return { side, align: align ?? 'center' };
}

function joinPlacement(side: PlacementSide, align: PlacementAlign): Placement {
  return (align === 'center' ? side : `${side}-${align}`) as Placement;
}

function place(
  side: PlacementSide,
  align: PlacementAlign,
  anchorRect: Rect,
  panelWidth: number,
  panelHeight: number,
  offset: number
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  if (side === 'top' || side === 'bottom') {
    top =
      side === 'top'
        ? anchorRect.top - panelHeight - offset
        : anchorRect.top + anchorRect.height + offset;
    if (align === 'start') left = anchorRect.left;
    else if (align === 'end')
      left = anchorRect.left + anchorRect.width - panelWidth;
    else left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
  } else {
    left =
      side === 'left'
        ? anchorRect.left - panelWidth - offset
        : anchorRect.left + anchorRect.width + offset;
    if (align === 'start') top = anchorRect.top;
    else if (align === 'end')
      top = anchorRect.top + anchorRect.height - panelHeight;
    else top = anchorRect.top + anchorRect.height / 2 - panelHeight / 2;
  }

  return { top, left };
}

function fitsOnSide(
  side: PlacementSide,
  anchorRect: Rect,
  panelWidth: number,
  panelHeight: number,
  offset: number,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  if (side === 'top') return anchorRect.top - panelHeight - offset >= 0;
  if (side === 'bottom')
    return (
      anchorRect.top + anchorRect.height + offset + panelHeight <=
      viewportHeight
    );
  if (side === 'left') return anchorRect.left - panelWidth - offset >= 0;
  return (
    anchorRect.left + anchorRect.width + offset + panelWidth <= viewportWidth
  );
}

export function computeAnchoredPosition({
  anchorRect,
  panelWidth,
  panelHeight,
  placement,
  offset,
  padding,
  viewportWidth,
  viewportHeight,
}: ComputeAnchoredPositionInput): ComputeAnchoredPositionResult {
  const { side, align } = parsePlacement(placement);

  const preferredFits = fitsOnSide(
    side,
    anchorRect,
    panelWidth,
    panelHeight,
    offset,
    viewportWidth,
    viewportHeight
  );
  const opposite = OPPOSITE[side];
  const oppositeFits =
    !preferredFits &&
    fitsOnSide(
      opposite,
      anchorRect,
      panelWidth,
      panelHeight,
      offset,
      viewportWidth,
      viewportHeight
    );

  const resolvedSide = preferredFits ? side : oppositeFits ? opposite : side;

  let { top, left } = place(
    resolvedSide,
    align,
    anchorRect,
    panelWidth,
    panelHeight,
    offset
  );

  if (resolvedSide === 'top' || resolvedSide === 'bottom') {
    left = Math.min(
      Math.max(left, padding),
      viewportWidth - panelWidth - padding
    );
  } else {
    top = Math.min(
      Math.max(top, padding),
      viewportHeight - panelHeight - padding
    );
  }

  return { top, left, placement: joinPlacement(resolvedSide, align) };
}

export function pointAnchor(x: number, y: number): VirtualAnchor {
  return {
    getBoundingClientRect: () => ({ top: y, left: x, width: 0, height: 0 }),
  };
}
