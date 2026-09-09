export type Grade = 'global' | 'default' | 'elevated';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type SizeSM = Extract<Size, 'sm' | 'md'>;

export type SizeSML = Extract<Size, 'sm' | 'md' | 'lg'>;

export type SizeXSL = Extract<Size, 'xs' | 'sm' | 'md' | 'lg'>;

export type Space =
  '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';
