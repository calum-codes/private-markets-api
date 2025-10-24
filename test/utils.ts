import { afterEach, beforeEach, vi } from "vitest";

export const withMockDateEach = (date: string | Date) => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(date));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
};
