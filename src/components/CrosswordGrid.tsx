'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PUZZLE_GRID, GRID_SIZE, CIRCLED_CELLS, CLUES, isBlack, getCellNumber } from '@/lib/puzzleData';
import { getSupabase, CellEntry, ClueEntry } from '@/lib/supabase';

const CELL_SIZE = 28;
const NUMBER_FONT = 8;

interface CellState {
  value: string;
  updatedBy: string;
}

interface ClueState {
  text: string;
  updatedBy: string;
}

function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  let id = localStorage.getItem('crossword-user-id');
  if (!id) {
    id = 'user-' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('crossword-user-id', id);
  }
  return id;
}

function getUserName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('crossword-user-name') || '';
}

function getUserColor(): string {
  if (typeof window === 'undefined') return '#4ECDC4';
  let color = localStorage.getItem('crossword-user-color');
  if (!color) {
    color = getRandomColor();
    localStorage.setItem('crossword-user-color', color);
  }
  return color;
}

export default function CrosswordGrid() {
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [clueTexts, setClueTexts] = useState<Record<string, ClueState>>({});
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [userId, setUserId] = useState('anonymous');
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('#4ECDC4');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeClue, setActiveClue] = useState<{ number: number; direction: 'across' | 'down' } | null>(null);
  const [filterDirection, setFilterDirection] = useState<'across' | 'down'>('across');
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialize user
  useEffect(() => {
    setUserId(getUserId());
    setUserColor(getUserColor());
    const name = getUserName();
    if (!name) {
      setShowNamePrompt(true);
    } else {
      setUserName(name);
    }
  }, []);

  // Load initial data and subscribe to realtime
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const loadCells = async () => {
      const { data } = await supabase.from('cells').select('*');
      if (data) {
        const newCells: Record<string, CellState> = {};
        data.forEach((cell: CellEntry) => {
          newCells[`${cell.row},${cell.col}`] = { value: cell.value, updatedBy: cell.updated_by };
        });
        setCells(newCells);
      }
    };

    const loadClues = async () => {
      const { data } = await supabase.from('clues').select('*');
      if (data) {
        const newClues: Record<string, ClueState> = {};
        data.forEach((clue: ClueEntry) => {
          newClues[`${clue.number}-${clue.direction}`] = { text: clue.clue_text, updatedBy: clue.updated_by };
        });
        setClueTexts(newClues);
      }
    };

    loadCells();
    loadClues();

    const cellChannel = supabase
      .channel('cells-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cells' }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'row' in payload.new) {
          const cell = payload.new as CellEntry;
          setCells((prev) => ({
            ...prev,
            [`${cell.row},${cell.col}`]: { value: cell.value, updatedBy: cell.updated_by },
          }));
        }
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    const clueChannel = supabase
      .channel('clues-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clues' }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'number' in payload.new) {
          const clue = payload.new as ClueEntry;
          setClueTexts((prev) => ({
            ...prev,
            [`${clue.number}-${clue.direction}`]: { text: clue.clue_text, updatedBy: clue.updated_by },
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(cellChannel);
      supabase.removeChannel(clueChannel);
    };
  }, []);

  const saveCell = useCallback(async (row: number, col: number, value: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const displayName = userName || userId;
    await supabase.from('cells').upsert(
      { row, col, value: value.toUpperCase(), updated_by: displayName, updated_at: new Date().toISOString() },
      { onConflict: 'row,col' }
    );
  }, [userId, userName]);

  const saveClue = useCallback(async (number: number, dir: 'across' | 'down', text: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const displayName = userName || userId;
    await supabase.from('clues').upsert(
      { number, direction: dir, clue_text: text, updated_by: displayName, updated_at: new Date().toISOString() },
      { onConflict: 'number,direction' }
    );
  }, [userId, userName]);

  const findClueForCell = useCallback((row: number, col: number, dir: 'across' | 'down') => {
    return CLUES.find(
      (c) => c.direction === dir && c.cells.some(([r, c2]) => r === row && c2 === col)
    );
  }, []);

  const getHighlightedCells = useCallback((): Set<string> => {
    if (!selectedCell) return new Set();
    const clue = findClueForCell(selectedCell[0], selectedCell[1], direction);
    if (!clue) return new Set();
    return new Set(clue.cells.map(([r, c]) => `${r},${c}`));
  }, [selectedCell, direction, findClueForCell]);

  const handleCellClick = (row: number, col: number) => {
    if (isBlack(row, col)) return;
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell([row, col]);
    }
  };

  // Focus the cell div when selected
  useEffect(() => {
    if (selectedCell) {
      const key = `${selectedCell[0]},${selectedCell[1]}`;
      cellRefs.current[key]?.focus();
    }
  }, [selectedCell]);

  const moveToNextCell = useCallback((row: number, col: number) => {
    if (direction === 'across') {
      for (let c = col + 1; c < GRID_SIZE; c++) {
        if (!isBlack(row, c)) { setSelectedCell([row, c]); return; }
      }
    } else {
      for (let r = row + 1; r < GRID_SIZE; r++) {
        if (!isBlack(r, col)) { setSelectedCell([r, col]); return; }
      }
    }
  }, [direction]);

  const moveToPrevCell = useCallback((row: number, col: number) => {
    if (direction === 'across') {
      for (let c = col - 1; c >= 0; c--) {
        if (!isBlack(row, c)) { setSelectedCell([row, c]); return; }
      }
    } else {
      for (let r = row - 1; r >= 0; r--) {
        if (!isBlack(r, col)) { setSelectedCell([r, col]); return; }
      }
    }
  }, [direction]);

  const moveToCell = useCallback((row: number, col: number, dir: string) => {
    let r = row, c = col;
    while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      if (!isBlack(r, c)) { setSelectedCell([r, c]); return; }
      if (dir === 'up') r--;
      else if (dir === 'down') r++;
      else if (dir === 'left') c--;
      else if (dir === 'right') c++;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    if (isBlack(row, col)) return;
    const key = e.key.toUpperCase();

    if (key === 'BACKSPACE' || key === 'DELETE') {
      e.preventDefault();
      const cellKey = `${row},${col}`;
      setCells((prev) => ({ ...prev, [cellKey]: { value: '', updatedBy: userName || userId } }));
      saveCell(row, col, '');
      moveToPrevCell(row, col);
      return;
    }
    if (key === 'TAB') {
      e.preventDefault();
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
      return;
    }
    if (key === 'ARROWUP') { e.preventDefault(); moveToCell(row - 1, col, 'up'); return; }
    if (key === 'ARROWDOWN') { e.preventDefault(); moveToCell(row + 1, col, 'down'); return; }
    if (key === 'ARROWLEFT') { e.preventDefault(); moveToCell(row, col - 1, 'left'); return; }
    if (key === 'ARROWRIGHT') { e.preventDefault(); moveToCell(row, col + 1, 'right'); return; }
    if (key === ' ') {
      e.preventDefault();
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
      return;
    }
    if (/^[A-Z]$/.test(key)) {
      e.preventDefault();
      const cellKey = `${row},${col}`;
      setCells((prev) => ({ ...prev, [cellKey]: { value: key, updatedBy: userName || userId } }));
      saveCell(row, col, key);
      moveToNextCell(row, col);
    }
  }, [direction, userName, userId, saveCell, moveToNextCell, moveToPrevCell, moveToCell]);

  // Update active clue when selection changes
  useEffect(() => {
    if (selectedCell) {
      const clue = findClueForCell(selectedCell[0], selectedCell[1], direction);
      if (clue) {
        setActiveClue({ number: clue.number, direction: clue.direction });
        setFilterDirection(clue.direction);
      }
    }
  }, [selectedCell, direction, findClueForCell]);

  const highlightedCells = getHighlightedCells();

  const handleClueEdit = (number: number, dir: 'across' | 'down', text: string) => {
    const k = `${number}-${dir}`;
    setClueTexts((prev) => ({ ...prev, [k]: { text, updatedBy: userName || userId } }));
    saveClue(number, dir, text);
  };

  const handleNameSubmit = (name: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('crossword-user-name', name);
    setUserName(name);
    setShowNamePrompt(false);
  };

  const getClueText = (number: number, dir: 'across' | 'down'): string => {
    const k = `${number}-${dir}`;
    if (clueTexts[k]?.text) return clueTexts[k].text;
    const clue = CLUES.find((c) => c.number === number && c.direction === dir);
    return clue?.clue || '';
  };

  const getCluesForDirection = (dir: 'across' | 'down') => {
    return CLUES.filter((c) => c.direction === dir).sort((a, b) => a.number - b.number);
  };

  const handleClueClick = (clue: typeof CLUES[0]) => {
    if (clue.cells.length > 0) {
      const [r, c] = clue.cells[0];
      setSelectedCell([r, c]);
      setDirection(clue.direction);
      setActiveClue({ number: clue.number, direction: clue.direction });
    }
  };

  if (showNamePrompt) {
    return <NamePrompt onSubmit={handleNameSubmit} />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4 max-w-[1400px] mx-auto">
      <div className="w-full lg:hidden">
        <Header connected={connected} userName={userName} userColor={userColor} />
      </div>

      <div className="flex flex-col items-center flex-shrink-0">
        <div className="hidden lg:block w-full mb-3">
          <Header connected={connected} userName={userName} userColor={userColor} />
        </div>

        {activeClue && (
          <div className="w-full mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-sm max-w-[700px]">
            <span className="font-bold text-blue-800">
              {activeClue.number}{activeClue.direction === 'across' ? 'A' : 'D'}:
            </span>{' '}
            <span className="text-gray-700">
              {getClueText(activeClue.number, activeClue.direction) || '(no clue yet — edit in the clue panel)'}
            </span>
          </div>
        )}

        <div ref={gridRef} className="border-2 border-black inline-block select-none" style={{ overflow: 'auto', maxWidth: '95vw' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          }}>
            {Array.from({ length: GRID_SIZE }, (_, row) =>
              Array.from({ length: GRID_SIZE }, (_, col) => {
                const cellKey = `${row},${col}`;
                const black = isBlack(row, col);
                const number = getCellNumber(row, col);
                const circled = CIRCLED_CELLS.has(cellKey);
                const cellValue = cells[cellKey]?.value || '';
                const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
                const isHighlighted = highlightedCells.has(cellKey);

                if (black) {
                  return (
                    <div key={cellKey} className="bg-black border border-gray-800" style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                  );
                }

                return (
                  <div
                    key={cellKey}
                    ref={(el) => { cellRefs.current[cellKey] = el; }}
                    className={`relative border border-gray-300 flex items-center justify-center cursor-pointer outline-none
                      ${isSelected ? 'bg-yellow-300 ring-2 ring-blue-500 ring-inset' : ''}
                      ${isHighlighted && !isSelected ? 'bg-blue-100' : ''}
                      ${!isSelected && !isHighlighted ? 'bg-white' : ''}
                    `}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    onClick={() => handleCellClick(row, col)}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, row, col)}
                  >
                    {circled && (
                      <div className="absolute inset-0 pointer-events-none" style={{ margin: '1px' }}>
                        <svg viewBox="0 0 26 26" className="w-full h-full">
                          <circle cx="13" cy="13" r="11.5" fill="none" stroke="#555" strokeWidth="1.5" />
                        </svg>
                      </div>
                    )}

                    {number !== null && (
                      <span
                        className="absolute top-0 left-0.5 text-black font-semibold leading-none pointer-events-none"
                        style={{ fontSize: `${NUMBER_FONT}px` }}
                      >
                        {number}
                      </span>
                    )}

                    <span
                      className="text-black font-bold pointer-events-none select-none"
                      style={{ fontSize: '14px', marginTop: number !== null ? '3px' : '0' }}
                    >
                      {cellValue}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-2 flex gap-2 text-sm items-center">
          <button
            className={`px-3 py-1 rounded font-medium transition-colors ${direction === 'across' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setDirection('across')}
          >
            Across →
          </button>
          <button
            className={`px-3 py-1 rounded font-medium transition-colors ${direction === 'down' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setDirection('down')}
          >
            Down ↓
          </button>
          <span className="text-gray-400 text-xs ml-2">Tab/Space to toggle</span>
        </div>
      </div>

      <div className="flex-1 min-w-[280px] max-h-[90vh] overflow-y-auto border rounded-lg bg-white shadow-sm">
        <div className="flex border-b sticky top-0 bg-white z-10">
          <button
            className={`flex-1 py-2.5 text-center font-bold text-sm transition-colors ${filterDirection === 'across' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setFilterDirection('across')}
          >
            ACROSS
          </button>
          <button
            className={`flex-1 py-2.5 text-center font-bold text-sm transition-colors ${filterDirection === 'down' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setFilterDirection('down')}
          >
            DOWN
          </button>
        </div>

        <div className="p-2 space-y-0.5">
          {getCluesForDirection(filterDirection).map((clue) => {
            const k = `${clue.number}-${clue.direction}`;
            const isActive = activeClue?.number === clue.number && activeClue?.direction === clue.direction;
            const displayText = getClueText(clue.number, clue.direction);

            return (
              <div
                key={k}
                id={`clue-${k}`}
                className={`flex items-start gap-2 p-1.5 rounded cursor-pointer text-sm transition-colors ${
                  isActive ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleClueClick(clue)}
              >
                <span className="font-bold text-gray-800 min-w-[32px] text-right flex-shrink-0">
                  {clue.number}
                </span>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={clueTexts[k]?.text ?? clue.clue}
                    onChange={(e) => handleClueEdit(clue.number, clue.direction, e.target.value)}
                    placeholder="(click to add clue)"
                    className={`w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 text-sm ${
                      displayText ? 'text-gray-800' : 'text-gray-400 italic'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {clueTexts[k]?.updatedBy && clueTexts[k]?.updatedBy !== 'puzzle' && (
                    <span className="text-[10px] text-gray-400 ml-1 block truncate">
                      edited by {clueTexts[k].updatedBy}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Header({ connected, userName, userColor }: { connected: boolean; userName: string; userColor: string }) {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <div>
        <h1 className="text-lg font-bold text-gray-900">I Wrote a Puzzle for Jimmy!</h1>
        <p className="text-xs text-gray-500">by Mike Selinker &mdash; 25x25 Collaborative Crossword</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: connected ? '#22c55e' : '#ef4444' }}
            title={connected ? 'Connected — real-time sync active' : 'Offline — changes saved locally'}
          />
          <span className="text-xs text-gray-500">{connected ? 'Live' : 'Local'}</span>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
          style={{ backgroundColor: userColor }}
          title={userName}
        >
          {userName ? userName.charAt(0).toUpperCase() : '?'}
        </div>
      </div>
    </div>
  );
}

function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold mb-1 text-gray-900">Welcome to the Crossword!</h2>
        <p className="text-sm text-gray-500 mb-1">I Wrote a Puzzle for Jimmy! by Mike Selinker</p>
        <p className="text-gray-600 text-sm mb-4">
          Enter your name so others can see who&apos;s editing.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()); }}
          placeholder="Your name..."
          className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          autoFocus
        />
        <button
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
        >
          Join Puzzle
        </button>
      </div>
    </div>
  );
}
