"use client";

import { useState, useEffect, useCallback } from "react";
import {
  STUDENT_YEAR_KEY,
  STUDENT_MAJOR_KEY,
  COMPLETED_COURSES_KEY,
  ASSUMED_COURSES_KEY
} from "@/lib/storageKeys";
import {
  getAssumedCourses,
  getAssumedReason,
  YEAR_LABELS,
  MAJOR_LABELS
} from "@/lib/studentProfile";
import type { StudentYear, StudentMajor } from "@/lib/studentProfile";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : []);
  } catch { return new Set(); }
}

function writeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

interface StudentProfilePanelProps {
  onChanged?: () => void;
}

export function StudentProfilePanel({ onChanged }: StudentProfilePanelProps) {
  const [year, setYear] = useState<StudentYear>("first");
  const [major, setMajor] = useState<StudentMajor>("undecided");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [assumed, setAssumed] = useState<Set<string>>(new Set());
  const [addInput, setAddInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedYear = (localStorage.getItem(STUDENT_YEAR_KEY) as StudentYear) || "first";
    const storedMajor = (localStorage.getItem(STUDENT_MAJOR_KEY) as StudentMajor) || "undecided";
    setYear(storedYear);
    setMajor(storedMajor);
    setCompleted(readSet(COMPLETED_COURSES_KEY));
    setAssumed(readSet(ASSUMED_COURSES_KEY));
    setLoaded(true);
  }, []);

  const regenerateAssumed = useCallback(
    (newYear: StudentYear, newMajor: StudentMajor, currentCompleted: Set<string>) => {
      const profileAssumed = getAssumedCourses(newYear, newMajor);
      const newAssumed = new Set(profileAssumed);
      currentCompleted.forEach((c) => newAssumed.delete(c));
      setAssumed(newAssumed);
      writeSet(ASSUMED_COURSES_KEY, newAssumed);
    },
    []
  );

  const updateYear = useCallback(
    (newYear: StudentYear) => {
      setYear(newYear);
      localStorage.setItem(STUDENT_YEAR_KEY, newYear);
      regenerateAssumed(newYear, major, completed);
      onChanged?.();
    },
    [major, completed, regenerateAssumed, onChanged]
  );

  const updateMajor = useCallback(
    (newMajor: StudentMajor) => {
      setMajor(newMajor);
      localStorage.setItem(STUDENT_MAJOR_KEY, newMajor);
      regenerateAssumed(year, newMajor, completed);
      onChanged?.();
    },
    [year, completed, regenerateAssumed, onChanged]
  );

  const confirmCourse = useCallback(
    (code: string) => {
      const n = new Set(completed); n.add(code);
      setCompleted(n); writeSet(COMPLETED_COURSES_KEY, n);
      const a = new Set(assumed); a.delete(code);
      setAssumed(a); writeSet(ASSUMED_COURSES_KEY, a);
      onChanged?.();
    },
    [completed, assumed, onChanged]
  );

  const removeAssumed = useCallback(
    (code: string) => {
      const a = new Set(assumed); a.delete(code);
      setAssumed(a); writeSet(ASSUMED_COURSES_KEY, a);
      onChanged?.();
    },
    [assumed, onChanged]
  );

  const removeCompleted = useCallback(
    (code: string) => {
      const n = new Set(completed); n.delete(code);
      setCompleted(n); writeSet(COMPLETED_COURSES_KEY, n);
      // Re-add to assumed if it was originally from profile
      const profileAssumed = getAssumedCourses(year, major);
      if (profileAssumed.includes(code)) {
        const a = new Set(assumed); a.add(code);
        setAssumed(a); writeSet(ASSUMED_COURSES_KEY, a);
      }
      onChanged?.();
    },
    [completed, assumed, year, major, onChanged]
  );

  const addCompleted = useCallback(() => {
    const code = addInput.trim().toUpperCase().replace(/\s+/g, " ");
    if (!code || !/^[A-Z]{2,10}\s\d{3}[A-Z]*$/.test(code)) return;
    const n = new Set(completed); n.add(code); setCompleted(n);
    writeSet(COMPLETED_COURSES_KEY, n);
    const a = new Set(assumed); a.delete(code); setAssumed(a);
    writeSet(ASSUMED_COURSES_KEY, a);
    setAddInput("");
    onChanged?.();
  }, [addInput, completed, assumed, onChanged]);

  if (!loaded) {
    return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">Loading profile...</div>;
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold text-ink">Student Profile</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-600">Year</label>
          <select value={year} onChange={(e) => updateYear(e.target.value as StudentYear)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100">
            {(Object.entries(YEAR_LABELS) as [StudentYear, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Major</label>
          <select value={major} onChange={(e) => updateMajor(e.target.value as StudentMajor)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100">
            {(Object.entries(MAJOR_LABELS) as [StudentMajor, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Assumed courses are generated from your year + major. Confirm each when completed.
      </p>

      {/* Completed */}
      <div>
        <h3 className="text-sm font-bold text-emerald-700">✓ Completed Courses ({completed.size})</h3>
        {completed.size > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {[...completed].sort().map((code) => (
              <span key={code} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                {code}
                <button type="button" onClick={() => removeCompleted(code)} className="ml-1 text-emerald-400 hover:text-rose-600" title="Remove">×</button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-400">No completed courses recorded.</p>
        )}
        <div className="mt-3 flex gap-2">
          <input value={addInput} onChange={(e) => setAddInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCompleted()}
            placeholder="e.g. ACCTG 102"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none transition focus:border-fern" />
          <button type="button" onClick={addCompleted}
            className="rounded-lg bg-fern px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Add</button>
        </div>
      </div>

      {/* Assumed */}
      <div>
        <h3 className="text-sm font-bold text-amber-700">⚠ Assumed Completed ({assumed.size})</h3>
        <p className="text-xs text-slate-500">
          Based on {YEAR_LABELS[year]} + {MAJOR_LABELS[major]}. Confirm or remove each.
        </p>
        {assumed.size > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {[...assumed].sort().map((code) => (
              <span key={code} title={getAssumedReason(code, year, major)}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                {code}
                <button type="button" onClick={() => confirmCourse(code)} className="ml-1 text-emerald-500 hover:text-emerald-700" title="Confirm">✓</button>
                <button type="button" onClick={() => removeAssumed(code)} className="text-amber-400 hover:text-rose-600" title="Remove">×</button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-400">No assumed courses for {YEAR_LABELS[year]} {MAJOR_LABELS[major]}.</p>
        )}
      </div>
    </section>
  );
}
