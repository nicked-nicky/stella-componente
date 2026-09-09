import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description as paragraphs, contributing no heading structure', () => {
    render(
      <EmptyState title="No projects" description="Create one to start" />
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('No projects')).toBeInTheDocument();
    expect(screen.getByText('Create one to start')).toBeInTheDocument();
  });

  it('keeps the illustration out of the accessibility tree', () => {
    const { container } = render(
      <EmptyState icon={<svg />} title="No projects" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('renders action children alongside the copy', () => {
    render(
      <EmptyState title="No projects">
        <button>New project</button>
      </EmptyState>
    );
    expect(
      screen.getByRole('button', { name: 'New project' })
    ).toBeInTheDocument();
  });
});
