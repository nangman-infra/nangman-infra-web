import { describe, expect, it } from "vitest";
import {
  buildPageWindow,
  extractAuthors,
  extractPage,
  formatDate,
} from "./pagination-helpers";

describe("pagination-helpers", () => {
  describe("buildPageWindow", () => {
    it("returns empty array when no pages", () => {
      expect(buildPageWindow(1, 0)).toEqual([]);
    });

    it("returns all pages when total <= window size", () => {
      expect(buildPageWindow(1, 3)).toEqual([1, 2, 3]);
      expect(buildPageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it("centers the window around the current page", () => {
      // current = 5, total = 10, window = 5 → [3, 4, 5, 6, 7]
      expect(buildPageWindow(5, 10)).toEqual([3, 4, 5, 6, 7]);
    });

    it("clamps the window to the right when current is near the end", () => {
      expect(buildPageWindow(10, 10)).toEqual([6, 7, 8, 9, 10]);
    });

    it("clamps the window to the left when current is near the start", () => {
      expect(buildPageWindow(1, 10)).toEqual([1, 2, 3, 4, 5]);
      expect(buildPageWindow(2, 10)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("formatDate", () => {
    it("formats ISO date in Korean locale", () => {
      const result = formatDate("2026-05-01T00:00:00.000Z", "ko");
      expect(result).toMatch(/2026/);
    });

    it("returns the input unchanged when not a valid date", () => {
      expect(formatDate("not a date", "ko")).toBe("not a date");
    });
  });

  describe("extractPage", () => {
    it("returns an empty page for non-object input", () => {
      const result = extractPage(null, 20);
      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.pageSize).toBe(20);
    });

    it("uses fallback pageSize when data has no pageSize", () => {
      const result = extractPage({ data: { posts: [] } }, 25);
      expect(result.pageSize).toBe(25);
    });

    it("parses a valid paginated response", () => {
      const result = extractPage(
        {
          data: {
            posts: [{ title: "x" }],
            total: 100,
            page: 3,
            pageSize: 20,
            totalPages: 5,
          },
        },
        20,
      );
      expect(result).toEqual({
        posts: [{ title: "x" }],
        total: 100,
        page: 3,
        pageSize: 20,
        totalPages: 5,
      });
    });

    it("derives totalPages when not in payload", () => {
      const result = extractPage(
        { data: { posts: [], total: 47, pageSize: 10 } },
        10,
      );
      expect(result.totalPages).toBe(5);
    });

    it("returns 0 totalPages when pageSize is 0", () => {
      const result = extractPage(
        { data: { posts: [], total: 10, pageSize: 0 } },
        0,
      );
      expect(result.totalPages).toBe(0);
    });

    it("returns empty when data.posts is not an array", () => {
      const result = extractPage(
        { data: { posts: "not-array" } },
        20,
      );
      expect(result.posts).toEqual([]);
    });

    it("returns empty when data is missing", () => {
      const result = extractPage({}, 20);
      expect(result.posts).toEqual([]);
    });
  });

  describe("extractAuthors", () => {
    it("returns string array from valid payload", () => {
      const result = extractAuthors({
        data: { authors: ["이성원", "강윤서"] },
      });
      expect(result).toEqual(["이성원", "강윤서"]);
    });

    it("filters non-string entries", () => {
      const result = extractAuthors({
        data: { authors: ["이성원", 42, null, "강윤서"] },
      });
      expect(result).toEqual(["이성원", "강윤서"]);
    });

    it("returns empty array on malformed payload", () => {
      expect(extractAuthors(null)).toEqual([]);
      expect(extractAuthors({ data: null })).toEqual([]);
      expect(extractAuthors({ data: { authors: "not array" } })).toEqual([]);
    });
  });
});
