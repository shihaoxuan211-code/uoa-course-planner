import type { Course } from "@/types/course";

// ── Types ──────────────────────────────────────────────────────────

export type PrerequisiteStatus = "met" | "assumed" | "missing";

export interface PrerequisiteCheck {
  status: PrerequisiteStatus;
  parseable: boolean;
  missingCodes: string[];
  assumedCodes: string[];
  metBy: string[];           // which courses (from completed/plan) satisfy prereqs
  assumedBy: string[];       // which assumed courses satisfy prereqs
  description: string;
}

interface Requirement {
  type: "code" | "oneOf" | "nOf" | "allOf" | "and" | "or";
  code?: string;
  codes?: string[];
  n?: number;
  children?: Requirement[];
}

// ── Course code extraction ─────────────────────────────────────────

const COURSE_CODE_RE = /[A-Z]{2,10}\s\d{3}[A-Z]*/g;

function extractAllCodes(text: string): string[] {
  const matches = text.match(COURSE_CODE_RE);
  if (!matches) return [];
  return [...new Set(matches)];
}

// ── Tokenizer ──────────────────────────────────────────────────────

type Token =
  | { type: "CODE"; value: string }
  | { type: "NUMBER"; value: number }
  | { type: "ALL" }
  | { type: "OF" }
  | { type: "AND" }
  | { type: "OR" }
  | { type: "SLASH" }
  | { type: "LPAREN" }
  | { type: "RPAREN" }
  | { type: "COMPLETED" };

function tokenize(raw: string): Token[] {
  const tokens: Token[] = [];
  let remaining = raw.trim();

  while (remaining.length > 0) {
    // Skip whitespace
    const spaceMatch = remaining.match(/^\s+/);
    if (spaceMatch) {
      remaining = remaining.slice(spaceMatch[0].length);
      continue;
    }

    // Parentheses
    if (remaining.startsWith("(")) {
      tokens.push({ type: "LPAREN" });
      remaining = remaining.slice(1);
      continue;
    }
    if (remaining.startsWith(")")) {
      tokens.push({ type: "RPAREN" });
      remaining = remaining.slice(1);
      continue;
    }

    // Slash (separator within groups)
    if (remaining.startsWith("/")) {
      tokens.push({ type: "SLASH" });
      remaining = remaining.slice(1);
      continue;
    }

    // "all of" or "all"
    const allMatch = remaining.match(/^all\b/i);
    if (allMatch) {
      tokens.push({ type: "ALL" });
      remaining = remaining.slice(allMatch[0].length);
      continue;
    }

    // "of"
    const ofMatch = remaining.match(/^of\b/i);
    if (ofMatch) {
      tokens.push({ type: "OF" });
      remaining = remaining.slice(ofMatch[0].length);
      continue;
    }

    // "AND"
    const andMatch = remaining.match(/^AND\b/i);
    if (andMatch) {
      tokens.push({ type: "AND" });
      remaining = remaining.slice(andMatch[0].length);
      continue;
    }

    // "OR"
    const orMatch = remaining.match(/^OR\b/i);
    if (orMatch) {
      tokens.push({ type: "OR" });
      remaining = remaining.slice(orMatch[0].length);
      continue;
    }

    // "must have completed" / "must have passed" etc — skip
    const completedMatch = remaining.match(
      /^(must\s+(have\s+)?(completed|passed|be\s+enrolled)|have\s+(completed|passed))\b\s*/i
    );
    if (completedMatch) {
      tokens.push({ type: "COMPLETED" });
      remaining = remaining.slice(completedMatch[0].length);
      continue;
    }

    // "with a B or higher" / "with at least" — skip qualifier phrases
    const qualifierMatch = remaining.match(
      /^(with\s+a\s+[A-C][+-]?\s+or\s+higher|with\s+at\s+least\s+[A-C][+-]?)\b\s*/i
    );
    if (qualifierMatch) {
      remaining = remaining.slice(qualifierMatch[0].length);
      continue;
    }

    // Number (for N-of)
    const numMatch = remaining.match(/^(\d+)\b/);
    if (numMatch) {
      tokens.push({ type: "NUMBER", value: Number(numMatch[1]) });
      remaining = remaining.slice(numMatch[1].length);
      continue;
    }

    // Course code
    const codeMatch = remaining.match(/^[A-Z]{2,10}\s\d{3}[A-Z]*\b/i);
    if (codeMatch) {
      tokens.push({ type: "CODE", value: codeMatch[0].toUpperCase() });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Stray commas
    if (remaining.startsWith(",")) {
      tokens.push({ type: "SLASH" }); // treat comma as slash
      remaining = remaining.slice(1);
      continue;
    }

    // Unknown — skip one character
    remaining = remaining.slice(1);
  }

  return tokens;
}

// ── Parser ─────────────────────────────────────────────────────────

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private advance(): Token | undefined {
    return this.tokens[this.pos++];
  }

  private expect(type: Token["type"]): Token | undefined {
    const token = this.peek();
    if (token && token.type === type) {
      return this.advance();
    }
    return undefined;
  }

  /** Skip noise tokens (COMPLETED, OF) */
  private skipNoise() {
    while (this.peek() && ["COMPLETED", "OF"].includes(this.peek()!.type)) {
      this.advance();
    }
  }

  // expression := or_expr
  parse(): Requirement | null {
    this.skipNoise();
    const result = this.parseOr();
    if (!result) return null;
    this.skipNoise();
    return result;
  }

  // or_expr := and_expr ("OR" and_expr)*
  private parseOr(): Requirement | null {
    const left = this.parseAnd();
    if (!left) return null;

    this.skipNoise();
    if (this.peek()?.type === "OR") {
      this.advance();
      const right = this.parseOr();
      if (!right) return left;
      return { type: "or", children: [left, right] };
    }

    return left;
  }

  // and_expr := atom ("AND" atom)*
  private parseAnd(): Requirement | null {
    const left = this.parseAtom();
    if (!left) return null;

    this.skipNoise();
    if (this.peek()?.type === "AND") {
      this.advance();
      const right = this.parseAnd();
      if (!right) return left;
      return { type: "and", children: [left, right] };
    }

    return left;
  }

  // atom := "(" or_expr ")" | simple_req
  private parseAtom(): Requirement | null {
    this.skipNoise();

    const token = this.peek();
    if (!token) return null;

    if (token.type === "LPAREN") {
      this.advance();
      const inner = this.parseOr();
      this.skipNoise();
      this.expect("RPAREN");
      return inner;
    }

    return this.parseSimpleReq();
  }

  // simple_req := [NUMBER] [ALL] CODE { SLASH CODE } ...
  private parseSimpleReq(): Requirement | null {
    this.skipNoise();

    const first = this.peek();
    if (!first) return null;

    // Check for "NUMBER of" pattern
    if (first.type === "NUMBER") {
      const n = first.value;
      this.advance();
      this.skipNoise(); // skip potential OF

      const codes = this.parseCodeList();
      if (codes.length === 0) return null;
      return n === 1
        ? { type: "oneOf", codes }
        : { type: "nOf", n, codes };
    }

    // Check for "ALL [of]" pattern
    if (first.type === "ALL") {
      this.advance();
      this.skipNoise(); // skip potential OF

      const codes = this.parseCodeList();
      if (codes.length === 0) return null;
      return { type: "allOf", codes };
    }

    // Single code or implicit 1-of list
    if (first.type === "CODE") {
      const codes = this.parseCodeList();
      if (codes.length === 0) return null;
      if (codes.length === 1) return { type: "code", code: codes[0] };
      // Multiple codes separated by slashes without explicit quantifier → 1-of
      return { type: "oneOf", codes };
    }

    this.advance(); // skip unknown token
    return this.parseSimpleReq();
  }

  private parseCodeList(): string[] {
    const codes: string[] = [];
    this.skipNoise();

    while (this.peek()) {
      const token = this.peek()!;

      if (token.type === "CODE") {
        this.advance();
        codes.push(token.value);
        this.skipNoise();
        // After a CODE, expect SLASH or a delimiter
        if (this.peek()?.type === "SLASH") {
          this.advance();
          this.skipNoise();
          // Continue — next should be another CODE
          continue;
        }
        // No slash — end of code list
        break;
      }

      // Delimiters end the code list
      if (
        token.type === "OR" ||
        token.type === "AND" ||
        token.type === "RPAREN" ||
        token.type === "LPAREN"
      ) {
        break;
      }

      // Skip stray tokens (SLASH without preceding CODE, junk characters, etc.)
      this.advance();
      this.skipNoise();
    }

    return codes;
  }
}

// ── Normalize ──────────────────────────────────────────────────────

function normalizePrerequisiteText(raw: string): string {
  // Strip enclosing parentheses if they wrap the entire expression
  let text = raw.trim();

  // Remove leading/trailing parentheses that wrap everything
  while (text.startsWith("(") && text.endsWith(")")) {
    // Check that the opening paren matches the closing one at the end
    let depth = 0;
    let matched = true;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "(") depth++;
      if (text[i] === ")") depth--;
      if (depth === 0 && i < text.length - 1) {
        matched = false;
        break;
      }
    }
    if (matched) {
      text = text.slice(1, -1).trim();
    } else {
      break;
    }
  }

  // Remove "with a [grade] or higher" qualifiers — they're not about course codes
  text = text.replace(/with\s+a\s+[A-C][+-]?\s+or\s+higher\b/gi, "");
  text = text.replace(/must\s+be\s+with\s+a\s+[A-C][+-]?\s+or\s+higher\b/gi, "");

  // Normalize "must have completed" / "have completed" etc.
  text = text.replace(/must\s+(have\s+)?(completed|passed)/gi, "must have completed");
  text = text.replace(/have\s+(completed|passed)/gi, "must have completed");

  // Remove trailing stray chars
  text = text.replace(/\s*,\s*$/, "");

  return text.trim();
}

// ── Public API ─────────────────────────────────────────────────────

function parsePrerequisite(raw: string): {
  parseable: boolean;
  req: Requirement | null;
  allCodes: string[];
} {
  const allCodes = extractAllCodes(raw);
  if (allCodes.length === 0) {
    return { parseable: false, req: null, allCodes: [] };
  }

  const normalized = normalizePrerequisiteText(raw);
  if (!normalized) {
    return { parseable: false, req: null, allCodes };
  }

  try {
    const tokens = tokenize(normalized);
    if (tokens.filter((t) => t.type === "CODE").length === 0) {
      return { parseable: false, req: null, allCodes };
    }

    const parser = new Parser(tokens);
    const req = parser.parse();

    if (!req) {
      return { parseable: false, req: null, allCodes };
    }

    return { parseable: true, req, allCodes };
  } catch {
    return { parseable: false, req: null, allCodes };
  }
}

/** Evaluate a parsed requirement against a set of completed course codes */
function evaluateRequirement(
  req: Requirement,
  completed: Set<string>
): { met: boolean; missing: string[] } {
  switch (req.type) {
    case "code":
      return {
        met: completed.has(req.code!),
        missing: completed.has(req.code!) ? [] : [req.code!],
      };

    case "oneOf": {
      const found = req.codes!.filter((c) => completed.has(c));
      return {
        met: found.length >= 1,
        missing: found.length >= 1 ? [] : req.codes!,
      };
    }

    case "nOf": {
      const found = req.codes!.filter((c) => completed.has(c));
      return {
        met: found.length >= req.n!,
        missing:
          found.length >= req.n!
            ? []
            : req.codes!.filter((c) => !completed.has(c)),
      };
    }

    case "allOf": {
      const missing = req.codes!.filter((c) => !completed.has(c));
      return {
        met: missing.length === 0,
        missing,
      };
    }

    case "and": {
      const results = req.children!.map((child) =>
        evaluateRequirement(child, completed)
      );
      const allMissing = results.flatMap((r) => r.missing);
      return {
        met: results.every((r) => r.met),
        missing: [...new Set(allMissing)],
      };
    }

    case "or": {
      const results = req.children!.map((child) =>
        evaluateRequirement(child, completed)
      );
      const met = results.find((r) => r.met);
      if (met) {
        return { met: true, missing: [] };
      }
      // All branches fail — report the branch with fewest missing
      const best = results.reduce((best, r) =>
        r.missing.length < best.missing.length ? r : best
      );
      return { met: false, missing: best.missing };
    }
  }
}

// ── Main entry point ───────────────────────────────────────────────

export function checkPrerequisites(
  course: Course,
  plannedCodes: Set<string>
): PrerequisiteCheck {
  const raw = course.prerequisites;

  // No prerequisites — met by default
  if (!raw || raw === "Not available" || raw.trim().length === 0) {
    return {
      met: true,
      parseable: true,
      missingCodes: [],
      description: "No prerequisites",
    };
  }

  const { parseable, req } = parsePrerequisite(raw);

  if (!parseable || !req) {
    return {
      met: null,
      parseable: false,
      missingCodes: [],
      description: "Unknown prerequisite format",
    };
  }

  // Check the course itself — skip self-reference
  const filteredCompleted = new Set(plannedCodes);
  filteredCompleted.delete(course.code);

  const { met, missing } = evaluateRequirement(req, filteredCompleted);

  return {
    met,
    parseable: true,
    missingCodes: missing,
    description: met ? "✓ Prerequisites met" : "⚠ Missing prerequisites",
  };
}
