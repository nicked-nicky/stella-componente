import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';
import { Breadcrumbs } from './Breadcrumbs';
import { Card } from './Card';

describe('Alert', () => {
  it('announces politely for informational variants', () => {
    render(<Alert variant="info">Saved</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('announces assertively for warning and error', () => {
    const { unmount } = render(<Alert variant="warning">Careful</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Careful');
    unmount();

    render(<Alert variant="error">Broken</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Broken');
  });

  it('keeps the variant icon out of the accessibility tree', () => {
    render(<Alert variant="info">Saved</Alert>);
    expect(
      screen.getByRole('status').querySelector('[aria-hidden="true"]')
    ).not.toBeNull();
  });

  it('offers a dismiss control only when there is something to dismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { unmount } = render(<Alert>Saved</Alert>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
    unmount();

    render(<Alert onDismiss={onDismiss}>Saved</Alert>);
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Breadcrumbs', () => {
  function trail() {
    return (
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/projects">Projects</Breadcrumbs.Item>
        <Breadcrumbs.Item>Stella</Breadcrumbs.Item>
      </Breadcrumbs>
    );
  }

  it('exposes itself as a labelled navigation landmark', () => {
    render(trail());
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });

  it('marks the last item as the current page without being told', () => {
    render(trail());
    expect(screen.getByText('Stella')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('hides the separators from assistive tech', () => {
    render(trail());
    const hidden = screen
      .getByRole('navigation', { name: 'Breadcrumb' })
      .querySelectorAll('li[aria-hidden="true"]');
    expect(hidden).toHaveLength(2);
  });
});

describe('Card', () => {
  it('steps its grade one tier above the surface it sits on', () => {
    const { container } = render(
      <Card parentGrade="default">
        <Card.Body>Body</Card.Body>
      </Card>
    );
    expect(container.firstElementChild).toHaveAttribute(
      'data-stella-grade',
      'elevated'
    );
  });

  it('an explicit grade wins over the inferred one', () => {
    const { container } = render(
      <Card parentGrade="default" grade="global">
        <Card.Body>Body</Card.Body>
      </Card>
    );
    expect(container.firstElementChild).toHaveAttribute(
      'data-stella-grade',
      'global'
    );
  });

  it('Card.Title contributes a real heading to the document outline', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Usage</Card.Title>
        </Card.Header>
      </Card>
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Usage' })
    ).toBeInTheDocument();
  });
});
