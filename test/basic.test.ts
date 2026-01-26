import { describe, it, expect, vi } from "vitest";

describe("Test Setup Verification", () => {
  it("should run basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should support vitest mocking", () => {
    const mockFn = vi.fn().mockReturnValue("mocked");
    expect(mockFn()).toBe("mocked");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
