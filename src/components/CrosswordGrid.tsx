'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GRID_SIZE, CIRCLED_CELLS, CLUES, isBlack, getCellNumber } from '@/lib/puzzleData';
import { getSupabase, CellEntry, ClueEntry } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const CELL_SIZE = 28;
const NUMBER_FONT = 8;
const PUZZLE_PASSWORD = 'ThreeMusketeers';

interface CellState {
  value: string;
  updatedBy: string;
}

interface ClueState {
  text: string;
  updatedBy: string;
}

interface RemoteUser {
  userId: string;
  name: string;
  color: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
}

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#82E0AA', '#F8C471', '#AED6F1', '#D7BDE2',
];

function getRandomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
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
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('#4ECDC4');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const [activeClue, setActiveClue] = useState<{ number: number; direction: 'across' | 'down' } | null>(null);
  const [filterDirection, setFilterDirection] = useState<'across' | 'down'>('across');
  const [remoteUsers, setRemoteUsers] = useState<Record<string, RemoteUser>>({});
  const [onlineCount, setOnlineCount] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef('anonymous');
  const userNameRef = useRef('');
  const userColorRef = useRef('#4ECDC4');

  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('crossword-auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  // Initialize user (only after auth)
  useEffect(() => {
    if (!authenticated) return;
    const id = getUserId();
    const color = getUserColor();
    userIdRef.current = id;
    userColorRef.current = color;
    setUserColor(color);
    const name = getUserName();
    if (!name) {
      setShowNamePrompt(true);
    } else {
      setUserName(name);
      userNameRef.current = name;
    }
  }, [authenticated]);

  // Load initial data from DB
  useEffect(() => {
    if (!authenticated) return;
    const supabase = getSupabase();
    if (!supabase) {
      setConnectionStatus('offline');
      return;
    }

    const loadCells = async () => {
      const { data, error } = await supabase.from('cells').select('*');
      if (error) { console.error('Failed to load cells:', error); return; }
      if (data) {
        const newCells: Record<string, CellState> = {};
        data.forEach((cell: CellEntry) => {
          newCells[`${cell.row},${cell.col}`] = { value: cell.value, updatedBy: cell.updated_by };
        });
        setCells(newCells);
      }
    };

    const loadClues = async () => {
      const { data, error } = await supabase.from('clues').select('*');
      if (error) { console.error('Failed to load clues:', error); return; }
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
  }, [authenticated]);

  // Channel 1: postgres_changes — reliable DB sync (backbone)
  useEffect(() => {
    if (!authenticated) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const dbChannel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cells' }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'row' in payload.new) {
          const cell = payload.new as CellEntry;
          setCells((prev) => ({
            ...prev,
            [`${cell.row},${cell.col}`]: { value: cell.value, updatedBy: cell.updated_by },
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clues' }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'number' in payload.new) {
          const clue = payload.new as ClueEntry;
          setClueTexts((prev) => ({
            ...prev,
            [`${clue.number}-${clue.direction}`]: { text: clue.clue_text, updatedBy: clue.updated_by },
          }));
        }
      })
      .subscribe((status, err) => {
        console.log('DB channel status:', status, err);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('live');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('DB channel error:', err);
        }
      });

    return () => {
      supabase.removeChannel(dbChannel);
    };
  }, [authenticated]);

  // Channel 2: Broadcast — instant peer-to-peer cell/clue updates
  useEffect(() => {
    if (!authenticated || !userName) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const bChannel = supabase.channel('puzzle-broadcast');

    bChannel
      .on('broadcast', { event: 'cell' }, ({ payload }) => {
        if (payload.senderId === userIdRef.current) return; // skip own echoes
        setCells((prev) => ({
          ...prev,
          [`${payload.row},${payload.col}`]: { value: payload.value, updatedBy: payload.updatedBy },
        }));
      })
      .on('broadcast', { event: 'clue' }, ({ payload }) => {
        if (payload.senderId === userIdRef.current) return;
        setClueTexts((prev) => ({
          ...prev,
          [`${payload.number}-${payload.dir}`]: { text: payload.text, updatedBy: payload.updatedBy },
        }));
      })
      .subscribe((status, err) => {
        console.log('Broadcast channel status:', status, err);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('live');
        }
      });

    broadcastChannelRef.current = bChannel;

    return () => {
      supabase.removeChannel(bChannel);
      broadcastChannelRef.current = null;
    };
  }, [authenticated, userName]);

  // Channel 3: Presence — live cursor tracking
  useEffect(() => {
    if (!authenticated || !userName) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const pChannel = supabase.channel('puzzle-presence', {
      config: { presence: { key: userIdRef.current } },
    });

    pChannel
      .on('presence', { event: 'sync' }, () => {
        const state = pChannel.presenceState();
        const users: Record<string, RemoteUser> = {};
        let count = 0;
        Object.entries(state).forEach(([key, presences]) => {
          count++;
          if (key === userIdRef.current) return;
          const arr = presences as unknown as RemoteUser[];
          if (arr[0]) users[key] = arr[0];
        });
        setRemoteUsers(users);
        setOnlineCount(count);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key === userIdRef.current) return;
        const arr = newPresences as unknown as RemoteUser[];
        if (arr[0]) setRemoteUsers((prev) => ({ ...prev, [key]: arr[0] }));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setRemoteUsers((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      })
      .subscribe(async (status, err) => {
        console.log('Presence channel status:', status, err);
        if (status === 'SUBSCRIBED') {
          await pChannel.track({
            userId: userIdRef.current,
            name: userNameRef.current,
            color: userColorRef.current,
            row: -1,
            col: -1,
            direction: 'across' as const,
          });
        }
      });

    presenceChannelRef.current = pChannel;

    return () => {
      supabase.removeChannel(pChannel);
      presenceChannelRef.current = null;
    };
  }, [authenticated, userName]);

  // Broadcast cursor position when it changes
  useEffect(() => {
    if (!presenceChannelRef.current || !selectedCell) return;
    presenceChannelRef.current.track({
      userId: userIdRef.current,
      name: userNameRef.current,
      color: userColorRef.current,
      row: selectedCell[0],
      col: selectedCell[1],
      direction,
    });
  }, [selectedCell, direction]);

  // Save cell: broadcast instantly + persist to DB
  const saveCell = useCallback((row: number, col: number, value: string) => {
    const displayName = userNameRef.current || userIdRef.current;
    const upperVal = value.toUpperCase();

    // Broadcast instantly to all peers
    broadcastChannelRef.current?.send({
      type: 'broadcast',
      event: 'cell',
      payload: { row, col, value: upperVal, updatedBy: displayName, senderId: userIdRef.current },
    });

    // Persist to DB (triggers postgres_changes for anyone not on broadcast)
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('cells').upsert(
        { row, col, value: upperVal, updated_by: displayName, updated_at: new Date().toISOString() },
        { onConflict: 'row,col' }
      ).then(({ error }) => {
        if (error) console.error('Cell save error:', error);
      });
    }
  }, []);

  // Save clue: broadcast + persist
  const saveClue = useCallback((number: number, dir: 'across' | 'down', text: string) => {
    const displayName = userNameRef.current || userIdRef.current;

    broadcastChannelRef.current?.send({
      type: 'broadcast',
      event: 'clue',
      payload: { number, dir, text, updatedBy: displayName, senderId: userIdRef.current },
    });

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('clues').upsert(
        { number, direction: dir, clue_text: text, updated_by: displayName, updated_at: new Date().toISOString() },
        { onConflict: 'number,direction' }
      ).then(({ error }) => {
        if (error) console.error('Clue save error:', error);
      });
    }
  }, []);

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

  const remoteCursorMap = useCallback((): Record<string, RemoteUser> => {
    const map: Record<string, RemoteUser> = {};
    Object.values(remoteUsers).forEach((u) => {
      if (u.row >= 0 && u.col >= 0) {
        map[`${u.row},${u.col}`] = u;
      }
    });
    return map;
  }, [remoteUsers]);

  const handleCellClick = (row: number, col: number) => {
    if (isBlack(row, col)) return;
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell([row, col]);
    }
  };

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
      const displayName = userNameRef.current || userIdRef.current;
      setCells((prev) => ({ ...prev, [cellKey]: { value: '', updatedBy: displayName } }));
      saveCell(row, col, '');
      moveToPrevCell(row, col);
      return;
    }
    if (key === 'TAB') { e.preventDefault(); setDirection((d) => (d === 'across' ? 'down' : 'across')); return; }
    if (key === 'ARROWUP') { e.preventDefault(); moveToCell(row - 1, col, 'up'); return; }
    if (key === 'ARROWDOWN') { e.preventDefault(); moveToCell(row + 1, col, 'down'); return; }
    if (key === 'ARROWLEFT') { e.preventDefault(); moveToCell(row, col - 1, 'left'); return; }
    if (key === 'ARROWRIGHT') { e.preventDefault(); moveToCell(row, col + 1, 'right'); return; }
    if (key === ' ') { e.preventDefault(); setDirection((d) => (d === 'across' ? 'down' : 'across')); return; }
    if (/^[A-Z]$/.test(key)) {
      e.preventDefault();
      const cellKey = `${row},${col}`;
      const displayName = userNameRef.current || userIdRef.current;
      setCells((prev) => ({ ...prev, [cellKey]: { value: key, updatedBy: displayName } }));
      saveCell(row, col, key);
      moveToNextCell(row, col);
    }
  }, [direction, saveCell, moveToNextCell, moveToPrevCell, moveToCell]);

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
  const cursors = remoteCursorMap();

  const handleClueEdit = (number: number, dir: 'across' | 'down', text: string) => {
    const k = `${number}-${dir}`;
    const displayName = userNameRef.current || userIdRef.current;
    setClueTexts((prev) => ({ ...prev, [k]: { text, updatedBy: displayName } }));
    saveClue(number, dir, text);
  };

  const handleNameSubmit = (name: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('crossword-user-name', name);
    setUserName(name);
    userNameRef.current = name;
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

  // --- Render gates ---

  if (!authenticated) {
    return (
      <PasswordPrompt onSuccess={() => {
        if (typeof window !== 'undefined') localStorage.setItem('crossword-auth', 'true');
        setAuthenticated(true);
      }} />
    );
  }

  if (showNamePrompt) {
    return <NamePrompt onSubmit={handleNameSubmit} />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4 max-w-[1400px] mx-auto">
      <div className="w-full lg:hidden">
        <Header connectionStatus={connectionStatus} userName={userName} userColor={userColor} onlineCount={onlineCount} remoteUsers={Object.values(remoteUsers)} />
      </div>

      <div className="flex flex-col items-center flex-shrink-0">
        <div className="hidden lg:block w-full mb-3">
          <Header connectionStatus={connectionStatus} userName={userName} userColor={userColor} onlineCount={onlineCount} remoteUsers={Object.values(remoteUsers)} />
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
                const remoteCursor = cursors[cellKey];

                if (black) {
                  return (
                    <div key={cellKey} className="bg-black border border-gray-800" style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                  );
                }

                return (
                  <div
                    key={cellKey}
                    ref={(el) => { cellRefs.current[cellKey] = el; }}
                    className={`relative border flex items-center justify-center cursor-pointer outline-none
                      ${isSelected ? 'bg-yellow-300 z-10' : ''}
                      ${isHighlighted && !isSelected ? 'bg-blue-100' : ''}
                      ${!isSelected && !isHighlighted ? 'bg-white' : ''}
                      ${!remoteCursor && !isSelected ? 'border-gray-300' : ''}
                    `}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      ...(remoteCursor && !isSelected ? {
                        boxShadow: `inset 0 0 0 2px ${remoteCursor.color}`,
                        borderColor: remoteCursor.color,
                      } : {}),
                      ...(isSelected ? {
                        boxShadow: 'inset 0 0 0 2px #3b82f6',
                        borderColor: '#3b82f6',
                      } : {}),
                    }}
                    onClick={() => handleCellClick(row, col)}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, row, col)}
                  >
                    {remoteCursor && !isSelected && (
                      <div
                        className="absolute -top-4 left-0 text-white text-[8px] font-bold px-1 rounded-t whitespace-nowrap z-20 pointer-events-none"
                        style={{ backgroundColor: remoteCursor.color }}
                      >
                        {remoteCursor.name}
                      </div>
                    )}

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
            Across
          </button>
          <button
            className={`px-3 py-1 rounded font-medium transition-colors ${direction === 'down' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setDirection('down')}
          >
            Down
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

// --- Sub-components ---

function Header({ connectionStatus, userName, userColor, onlineCount, remoteUsers }: {
  connectionStatus: 'connecting' | 'live' | 'offline'; userName: string; userColor: string; onlineCount: number; remoteUsers: RemoteUser[];
}) {
  const statusColor = connectionStatus === 'live' ? '#22c55e' : connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444';
  const statusText = connectionStatus === 'live' ? `${onlineCount} online` : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline';

  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <div>
        <h1 className="text-lg font-bold text-gray-900">I Wrote a Puzzle for Jimmy!</h1>
        <p className="text-xs text-gray-500">by Mike Selinker &mdash; 25x25 Collaborative Crossword</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: statusColor }}
            title={statusText}
          />
          <span className="text-xs text-gray-500">{statusText}</span>
        </div>
        <div className="flex -space-x-1.5">
          {remoteUsers.slice(0, 5).map((u) => (
            <div
              key={u.userId}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
              style={{ backgroundColor: u.color }}
              title={u.name}
            >
              {u.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {remoteUsers.length > 5 && (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 text-[10px] font-bold bg-gray-200 border-2 border-white">
              +{remoteUsers.length - 5}
            </div>
          )}
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white"
          style={{ backgroundColor: userColor }}
          title={`${userName} (you)`}
        >
          {userName ? userName.charAt(0).toUpperCase() : '?'}
        </div>
      </div>
    </div>
  );
}

function PasswordPrompt({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (password === PUZZLE_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold mb-1 text-gray-900">Crossword Access</h2>
        <p className="text-gray-600 text-sm mb-4">Enter the password to join the puzzle.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Password..."
          className={`w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 text-gray-900 ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-2">Wrong password. Try again.</p>}
        <button
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={handleSubmit}
          disabled={!password}
        >
          Enter
        </button>
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
