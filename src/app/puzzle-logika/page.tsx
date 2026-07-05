"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LOGIC_PUZZLES,
  PUZZLE_LEVELS,
  getPuzzlesByLevel,
  type PuzzleLevel,
} from "@/content/logicPuzzles";

const CATEGORY_LABELS: Record<string, string> = {
  deduksi: "Deduksi",
  pola: "Pola",
  silogisme: "Silogisme",
  probabilitas: "Probabilitas",
  paradoks: "Paradoks",
};

const LEVEL_LABELS: Record<PuzzleLevel, string> = {
  1: "Level 1 — Deduksi Dasar",
  2: "Level 2 — Pola & Silogisme",
  3: "Level 3 — Multi-langkah",
  4: "Level 4 — Penalaran Kompleks",
  5: "Level 5 — Paradoks & Lanjut",
};

export default function PuzzleLogikaPage() {
  const [selectedLevel, setSelectedLevel] = useState<PuzzleLevel>(1);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [sessionResults, setSessionResults] = useState<Record<string, boolean>>({});

  const puzzles = getPuzzlesByLevel(selectedLevel);
  const current = puzzles[puzzleIndex];
  const revealed = chosen !== null;
  const isCorrect = chosen === current?.correctId;

  const totalSolved = Object.keys(sessionResults).length;
  const totalCorrect = Object.values(sessionResults).filter(Boolean).length;

  function selectLevel(level: PuzzleLevel) {
    setSelectedLevel(level);
    setPuzzleIndex(0);
    setChosen(null);
  }

  function handleChoose(optionId: string) {
    if (revealed) return;
    setChosen(optionId);
    setSessionResults((prev) => ({ ...prev, [current.id]: optionId === current.correctId }));
  }

  function nextPuzzle() {
    if (puzzleIndex < puzzles.length - 1) {
      setPuzzleIndex((i) => i + 1);
      setChosen(null);
    } else {
      // cycle to next level or back to 1
      const nextLevel = selectedLevel < 5 ? ((selectedLevel + 1) as PuzzleLevel) : 1;
      selectLevel(nextLevel);
    }
  }

  const allPuzzleCount = LOGIC_PUZZLES.length;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #5</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Puzzle Logika</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            15 puzzle logika bertahap — dari deduksi dasar hingga paradoks klasik.
          </p>
        </div>

        {/* Stats bar */}
        {totalSolved > 0 && (
          <div className="flex gap-4 text-xs text-[var(--strophe-text-muted)]">
            <span>Dicoba: <span className="text-[var(--strophe-text)]">{totalSolved}</span>/{allPuzzleCount}</span>
            <span>Benar: <span className="text-[var(--strophe-success)]">{totalCorrect}</span></span>
            <span>Salah: <span className="text-red-400">{totalSolved - totalCorrect}</span></span>
          </div>
        )}

        {/* Level selector */}
        <div className="flex flex-wrap gap-2">
          {PUZZLE_LEVELS.map((lvl) => {
            const lvlPuzzles = getPuzzlesByLevel(lvl);
            const solved = lvlPuzzles.filter((p) => sessionResults[p.id] !== undefined).length;
            return (
              <button
                key={lvl}
                onClick={() => selectLevel(lvl)}
                className={[
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  selectedLevel === lvl
                    ? "bg-[var(--strophe-gold)]/15 border-[var(--strophe-gold)] text-[var(--strophe-gold-bright)]"
                    : "border-[var(--strophe-border)] text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]",
                ].join(" ")}
              >
                L{lvl} {solved > 0 && <span className="opacity-60">({solved}/{lvlPuzzles.length})</span>}
              </button>
            );
          })}
        </div>

        {/* Current puzzle */}
        {current && (
          <Card className="card-elevated animate-in stagger-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[var(--strophe-text-muted)]">
                {LEVEL_LABELS[selectedLevel]} · {puzzleIndex + 1}/{puzzles.length}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--strophe-border)] text-[var(--strophe-text-faint)]">
                {CATEGORY_LABELS[current.category]}
              </span>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-line mb-5">{current.question}</p>

            <div className="space-y-2">
              {current.options.map((opt) => {
                let cls =
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ";
                if (!revealed) {
                  cls += "border-[var(--strophe-border)] hover:border-[var(--strophe-gold)]/60";
                } else if (opt.id === current.correctId) {
                  cls += "border-[var(--strophe-success)] bg-[var(--strophe-success)]/10 text-[var(--strophe-success)]";
                } else if (opt.id === chosen) {
                  cls += "border-red-500/60 bg-red-500/10 text-red-400";
                } else {
                  cls += "border-[var(--strophe-border)] opacity-50";
                }
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleChoose(opt.id)}
                    disabled={revealed}
                    className={cls}
                  >
                    <span className="font-medium uppercase mr-2 text-[var(--strophe-gold)]">{opt.id}.</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="animate-in mt-5 pt-4 border-t border-[var(--strophe-border)] space-y-3">
                <p className={`text-sm font-semibold ${isCorrect ? "text-[var(--strophe-success)]" : "text-red-400"}`}>
                  {isCorrect ? "Benar!" : "Kurang tepat."}
                </p>
                <p className="text-sm text-[var(--strophe-text-muted)] leading-relaxed">
                  {current.explanation}
                </p>
                <Button onClick={nextPuzzle}>
                  {puzzleIndex < puzzles.length - 1
                    ? "Puzzle Berikutnya"
                    : selectedLevel < 5
                    ? `Lanjut ke Level ${selectedLevel + 1}`
                    : "Mulai Ulang dari Level 1"}
                </Button>
              </div>
            )}
          </Card>
        )}

        <p className="text-xs text-[var(--strophe-text-faint)]">
          Progress tidak disimpan ke server — sesi baru dimulai dari awal setiap kali halaman dimuat.
        </p>
      </div>
    </AppShell>
  );
}
