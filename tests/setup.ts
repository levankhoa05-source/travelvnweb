import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (!window.scrollTo) {
  window.scrollTo = vi.fn();
}

if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined)
    },
    writable: true
  });
}
