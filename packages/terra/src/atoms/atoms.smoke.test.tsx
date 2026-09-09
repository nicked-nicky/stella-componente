import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Divider } from './Divider';
import { Spinner } from './Spinner';
import { Text } from './Text';
import { Link } from './Link';
import { Progress } from './Progress';
import { Skeleton } from './Skeleton';
import { Code } from './Code';
import { Kbd } from './Kbd';
import { Icon } from './Icon';
import { Island } from './Island';
import { FlexContainer } from '../layout/FlexContainer';
import { ScrollArea } from '../layout/ScrollArea';
import { WindowControls } from '../molecules/WindowControls';

describe('Avatar', () => {
  it('renders the image when a src is given', () => {
    render(<Avatar src="/jane.jpg" alt="Jane Doe" initials="JD" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
  });

  it('falls back to initials when the image fails to load', () => {
    render(<Avatar src="/broken.jpg" alt="Jane Doe" initials="JD" />);
    fireEvent.error(screen.getByRole('img', { name: 'Jane Doe' }));
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('falls back to a generic icon when there are no initials either', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('truncates initials to two characters', () => {
    render(<Avatar initials="ABCD" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('carries colour and variant as data attributes for CSS to resolve', () => {
    render(
      <Badge color="error" variant="filled">
        3 errors
      </Badge>
    );
    const badge = screen.getByText('3 errors');
    expect(badge).toHaveAttribute('data-color', 'error');
    expect(badge).toHaveAttribute('data-variant', 'filled');
  });

  it('defaults to neutral/tinted', () => {
    render(<Badge>Plain</Badge>);
    const badge = screen.getByText('Plain');
    expect(badge).toHaveAttribute('data-color', 'neutral');
    expect(badge).toHaveAttribute('data-variant', 'tinted');
  });
});

describe('Divider', () => {
  it('uses role="separator" rather than an <hr>', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'horizontal'
    );
  });

  it('reports its vertical orientation to assistive tech', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'vertical'
    );
  });
});

describe('Spinner', () => {
  it('announces itself as a loading status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('allows the label to be overridden for a specific context', () => {
    render(<Spinner aria-label="Saving changes" />);
    expect(
      screen.getByRole('status', { name: 'Saving changes' })
    ).toBeInTheDocument();
  });
});

describe('Text', () => {
  it('maps title variants to matching heading levels by default', () => {
    render(
      <>
        <Text variant="title-1">One</Text>
        <Text variant="title-2">Two</Text>
        <Text variant="title-3">Three</Text>
      </>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'One' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Two' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Three' })
    ).toBeInTheDocument();
  });

  it('keeps the visual variant and the semantic element independent', () => {
    render(
      <Text variant="title-2" as="h1">
        Smaller but primary
      </Text>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Smaller but primary' })
    ).toBeInTheDocument();
  });

  it('renders body-level variants as a span, contributing no heading structure', () => {
    render(<Text variant="body">Just copy</Text>);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Just copy').tagName).toBe('SPAN');
  });
});

describe('Link', () => {
  it('renders a real anchor with its href', () => {
    render(<Link href="/settings">Settings</Link>);
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings'
    );
  });

  it('forces target=_blank and a safe rel when external', () => {
    render(
      <Link href="https://example.com" external>
        Docs
      </Link>
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('applies the same safe rel when target=_blank is set manually, without external', () => {
    render(
      <Link href="https://example.com" target="_blank">
        Docs
      </Link>
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('leaves rel/target untouched for a plain in-app link', () => {
    render(<Link href="/settings">Settings</Link>);
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});

describe('Progress', () => {
  it('reports its value via the standard aria-value triplet', () => {
    render(<Progress value={40} max={100} aria-label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<Progress aria-label="Working" />);
    expect(
      screen.getByRole('progressbar', { name: 'Working' })
    ).not.toHaveAttribute('aria-valuenow');
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Code', () => {
  it('renders its children inside a real <code> element', () => {
    render(<Code>pnpm install</Code>);
    expect(screen.getByText('pnpm install').tagName).toBe('CODE');
  });
});

describe('Kbd', () => {
  it('renders its children inside a real <kbd> element', () => {
    render(<Kbd>⌘</Kbd>);
    expect(screen.getByText('⌘').tagName).toBe('KBD');
  });
});

describe('FlexContainer', () => {
  it('renders its children', () => {
    render(
      <FlexContainer>
        <span>child</span>
      </FlexContainer>
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders as a div by default and contributes no semantics of its own', () => {
    const { container } = render(
      <FlexContainer>
        <span>child</span>
      </FlexContainer>
    );
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });
});

describe('WindowControls', () => {
  it('renders only the buttons whose handler was supplied', () => {
    render(
      <WindowControls controls={{ maximize: () => {}, close: () => {} }} />
    );
    expect(screen.queryByRole('button', { name: 'Minimize' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Maximize' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('renders nothing at all when no handlers are supplied', () => {
    const { container } = render(<WindowControls controls={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('swaps the maximize button to Restore when the window is maximized', () => {
    render(
      <WindowControls controls={{ maximize: () => {}, maximized: true }} />
    );
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Maximize' })).toBeNull();
  });

  it('invokes the supplied handlers on click', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(
      <WindowControls
        controls={{
          minimize: () => calls.push('minimize'),
          maximize: () => calls.push('maximize'),
          close: () => calls.push('close'),
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Minimize' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(calls).toEqual(['minimize', 'close']);
  });
});

describe('Icon', () => {
  it('is decorative by default, hidden from assistive tech', () => {
    const { container } = render(
      <Icon>
        <svg />
      </Icon>
    );
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('becomes a named image when given a title', () => {
    render(
      <Icon title="Search">
        <svg />
      </Icon>
    );
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument();
  });

  it('sizes the child glyph rather than relying on the child to size itself', () => {
    const { container } = render(
      <Icon size="lg">
        <svg />
      </Icon>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});

describe('Island', () => {
  it('renders a plain div contributing no landmark of its own', () => {
    const { container } = render(<Island>Body</Island>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders the semantic element asked for by `as`', () => {
    render(<Island as="nav" aria-label="Sidebar" />);
    expect(
      screen.getByRole('navigation', { name: 'Sidebar' })
    ).toBeInTheDocument();
  });

  it('publishes its grade for the CSS cascade to read', () => {
    const { container } = render(<Island grade="elevated">Body</Island>);
    expect(container.firstElementChild).toHaveAttribute(
      'data-stella-grade',
      'elevated'
    );
  });

  it('marks itself nested only when nesting actually deepens the surface', () => {
    const { container, rerender } = render(
      <Island grade="elevated" nested>
        Body
      </Island>
    );
    expect(container.firstElementChild).toHaveAttribute('data-stella-nested');

    rerender(
      <Island grade="global" nested>
        Body
      </Island>
    );
    expect(container.firstElementChild).not.toHaveAttribute(
      'data-stella-nested'
    );
  });
});

describe('ScrollArea', () => {
  it('renders the semantic element asked for by `as`', () => {
    render(<ScrollArea as="nav" aria-label="Categories" />);
    expect(
      screen.getByRole('navigation', { name: 'Categories' })
    ).toBeInTheDocument();
  });

  it('identifies itself to the cascade without inventing semantics', () => {
    const { container } = render(<ScrollArea>Body</ScrollArea>);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-stella-component', 'scroll-area');
    expect(root.tagName).toBe('DIV');
  });
});
