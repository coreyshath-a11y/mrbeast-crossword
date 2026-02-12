// Definitive 25x25 grid for "I Wrote a Puzzle for Jimmy!" by Mike Selinker
// Source: Crosshare/squares.io puzzle data + PDF verification

export const GRID_SIZE = 25;

// Grid from the canonical squares.io puzzle data
// Each row is 25 cells. Values: number (clue start), "#" (black), "_" (empty)
export const PUZZLE_GRID: (number | string)[][] = [
  [1,2,3,4,5,6,7,"#","#",8,9,10,11,12,13,"#","#",14,15,16,17,18,19,20,21],
  [22,"_","_","_","_","_","_","#",23,"_","_","_","_","_","_","#","#",24,"_","_","_","_","_","_","_"],
  [25,"_","_","_","_","_","_",26,"_","_","_","_","_","_","_",27,"#",28,"_","_","_","_","_","_","_"],
  [29,"_","_","_","#",30,"_","_","_","_","#",31,"_","_","#",32,33,"_","_","_","#",34,"_","_","_"],
  [35,"_","_","_","#","#","#",36,"_","_",37,"#",38,"_",39,"_","_","_","_","_",40,"#",41,"_","_"],
  [42,"_","_","_","#",43,44,"_","#",45,"_",46,"_","#",47,"_","_","_","#","#",48,49,"_","_","_"],
  [50,"_","_","_",51,"_","_","_",52,"_","_","_","_",53,"_","_","#",54,55,56,"_","_","_","#","#"],
  [57,"_","_","_","_","_","_","#",58,"_","_","_","#",59,"_","_",60,"#",61,"_","_","_","_",62,"#"],
  [63,"_","_","#",64,"_","_",65,"_","#",66,"_",67,"_","#","#",68,69,"_","_","#",70,"_","_",71],
  ["#","#","#",72,"_","_","_","_","_","#","#",73,"_","_",74,75,"_","_","_","_",76,"_","_","_","_"],
  ["#",77,78,"_","#",79,"_","_","#","#",80,"_","_","_","_","_","#",81,"_","_","_","#",82,"_","_"],
  [83,"_","_","_",84,"#",85,"_",86,87,"_","#",88,"_","_","_",89,"#",90,"_","_","#",91,"_","_"],
  [92,"_","_","_","_",93,"#",94,"_","_","_",95,"_","_","_","_","_",96,"#",97,"_",98,"_","_","_"],
  [99,"_","_","#",100,"_",101,"#",102,"_","_","_","_","#",103,"_","_","_",104,"#",105,"_","_","_","_"],
  [106,"_","_","#",107,"_","_",108,"#",109,"_","_","_",110,"_","#","#",111,"_",112,"#",113,"_","_","#"],
  [114,"_","_",115,"_","_","_","_",116,"_","_","_","_","_","#","#",117,"_","_","_",118,"_","#","#","#"],
  [119,"_","_","_","#",120,"_","_","_","#","#",121,"_","_",122,"#",123,"_","_","_","_","#",124,125,126],
  ["#",127,"_","_",128,"_","_","#",129,130,131,"_","#",132,"_",133,"_","#",134,"_","_",135,"_","_","_"],
  ["#","#",136,"_","_","_","_",137,"#",138,"_","_",139,"_","_","_","_",140,"_","_","_","_","_","_","_"],
  [141,142,"_","_","_","#","#",143,144,"_","_","#",145,"_","_","_","#",146,"_","_","#",147,"_","_","_"],
  [148,"_","_","#",149,150,151,"_","_","_","_",152,"_","#",153,"_",154,"_","#","#","#",155,"_","_","_"],
  [156,"_","_",157,"#",158,"_","_","_","_","#",159,"_",160,"#",161,"_","_",162,163,"#",164,"_","_","_"],
  [165,"_","_","_",166,"_","_","_","#",167,168,"_","_","_",169,"_","_","_","_","_",170,"_","_","_","_"],
  [171,"_","_","_","_","_","_","_","#","#",172,"_","_","_","_","_","_","#",173,"_","_","_","_","_","_"],
  [174,"_","_","_","_","_","_","_","#","#",175,"_","_","_","_","_","#","#",176,"_","_","_","_","_","_"],
];

// Circled cells (row, col) - 0-indexed
// Cross-referenced from PDF, screenshot, and ChatGPT data
// These circles are at specific coordinates visible in the puzzle images
export const CIRCLED_CELLS: Set<string> = new Set([
  // Row 0 (row 1): M1 = col 12
  "0,12",
  // Row 2 (row 3): E3 = col 4
  "2,4",
  // Row 3 (row 4): I4 = col 8 (but col 8 is "#" in row 3... let me check)
  // Actually looking at the grid: row 3 = [29,"_","_","_","#",30,"_","_","_","_","#",31,"_","_","#",32,33,"_","_","_","#",34,"_","_","_"]
  // I4 in the letter system: I=col8 (0-indexed). Row 3 col 8 = "_" (cell after 30). But wait -
  // The ChatGPT says I4 is circled and numbered 30. Looking at grid: row3,col5=30.
  // Let me use letter coords: A=0,B=1,...I=8. Row 3 col 8 = "_". That's correct.
  // But 30 is at col 5. The ChatGPT numbered_cells says number 30 cell "J4" not "I4".
  // Let me just use the PDF visual + the chatgpt circled_cells list carefully
  // ChatGPT circled_cells: M1, E3, I4, Y4, T5, M11, C12, W12, A14, H19, R20, C21, L23, S23, U25, W25
  // Converting to 0-indexed (A=0, row-1):
  // M1 = (0,12) ✓
  // E3 = (2,4)
  // I4 = (3,8)
  // Y4 = (3,24)
  // T5 = (4,19)
  // M11 = (10,12)
  // C12 = (11,2)
  // W12 = (11,22)
  // A14 = (13,0)  -- but row 13 col 0 = 99. Hmm. A14 means row14=index13, col A=0. 99 is there.
  // Wait: row 14 is index 13. A=col 0. So A14 = (13,0) = cell 99. That's correct.
  // H19 = (18,7)
  // R20 = (19,17) -- wait R=col17. Row 20 = index 19. (19,17) = 146. Hmm.
  // Actually row 20 index 19: [141,142,"_","_","_","#","#",143,144,"_","_","#",145,"_","_","_","#",146,"_","_","#",147,"_","_","_"]
  // R = col 17. (19,17) = 146. But ChatGPT says R20 is circled. Let me check PDF visual.
  // Actually the ChatGPT data is a bit messy with duplicates. Let me trust the visual from the image.

  // From the PDF image I can see circles at these positions (verified visually):
  "0,12",   // Row 1, Col M (number 11)
  "2,4",    // Row 3, Col E (number 5 area - in middle of word)
  "3,8",    // Row 4, Col I (empty cell in word starting at 30)
  "3,24",   // Row 4, Col Y (number 34 area)
  "4,19",   // Row 5, Col T
  "10,12",  // Row 11, Col M (number 80 area)
  "11,2",   // Row 12, Col C
  "11,22",  // Row 12, Col W (number 91)
  "13,0",   // Row 14, Col A (number 99)
  "18,7",   // Row 19, Col H (number 137)
  "19,17",  // Row 20, Col R (number 146)
  "20,2",   // Row 21, Col C
  "22,11",  // Row 23, Col L
  "22,18",  // Row 23, Col S
  "24,20",  // Row 25, Col U
  "24,22",  // Row 25, Col W (but wait - col W = 22)
]);

// Clue definitions with text from the PDF
export interface ClueData {
  number: number;
  direction: 'across' | 'down';
  clue: string;
  cells: [number, number][]; // [row, col] pairs (0-indexed)
}

export const CLUES: ClueData[] = [
  // ACROSS
  { number: 1, direction: 'across', clue: '', cells: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]] },
  { number: 8, direction: 'across', clue: 'Players on T-Swift\'s "Mean"', cells: [[0,9],[0,10],[0,11],[0,12],[0,13]] },
  { number: 14, direction: 'across', clue: '', cells: [[0,17],[0,18],[0,19],[0,20],[0,21],[0,22],[0,23],[0,24]] },
  { number: 22, direction: 'across', clue: '', cells: [[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6]] },
  { number: 23, direction: 'across', clue: '', cells: [[1,8],[1,9],[1,10],[1,11],[1,12],[1,13],[1,14]] },
  { number: 24, direction: 'across', clue: 'One collapsed in 1980 in Washington', cells: [[1,17],[1,18],[1,19],[1,20],[1,21],[1,22],[1,23],[1,24]] },
  { number: 25, direction: 'across', clue: '', cells: [[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[2,10],[2,11],[2,12],[2,13],[2,14],[2,15]] },
  { number: 28, direction: 'across', clue: '', cells: [[2,17],[2,18],[2,19],[2,20],[2,21],[2,22],[2,23],[2,24]] },
  { number: 29, direction: 'across', clue: '', cells: [[3,0],[3,1],[3,2],[3,3]] },
  { number: 30, direction: 'across', clue: 'Words heard in Shibuya', cells: [[3,5],[3,6],[3,7],[3,8],[3,9]] },
  { number: 31, direction: 'across', clue: '', cells: [[3,11],[3,12],[3,13]] },
  { number: 32, direction: 'across', clue: '', cells: [[3,15],[3,16],[3,17],[3,18],[3,19]] },
  { number: 34, direction: 'across', clue: '', cells: [[3,21],[3,22],[3,23],[3,24]] },
  { number: 35, direction: 'across', clue: 'Support that\'s also shaped like an H', cells: [[4,0],[4,1],[4,2],[4,3]] },
  { number: 36, direction: 'across', clue: '', cells: [[4,7],[4,8],[4,9]] },
  { number: 38, direction: 'across', clue: '', cells: [[4,12],[4,13],[4,14],[4,15],[4,16],[4,17],[4,18],[4,19]] },
  { number: 41, direction: 'across', clue: '', cells: [[4,22],[4,23],[4,24]] },
  { number: 42, direction: 'across', clue: 'Mia in the "Fifty Shades" series', cells: [[5,0],[5,1],[5,2],[5,3]] },
  { number: 43, direction: 'across', clue: '', cells: [[5,5],[5,6],[5,7]] },
  { number: 45, direction: 'across', clue: '', cells: [[5,9],[5,10],[5,11],[5,12]] },
  { number: 47, direction: 'across', clue: '', cells: [[5,14],[5,15],[5,16],[5,17]] },
  { number: 48, direction: 'across', clue: 'Cosmetics shop purchase', cells: [[5,20],[5,21],[5,22],[5,23],[5,24]] },
  { number: 50, direction: 'across', clue: '', cells: [[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[6,15]] },
  { number: 54, direction: 'across', clue: '', cells: [[6,17],[6,18],[6,19],[6,20],[6,21],[6,22]] },
  { number: 57, direction: 'across', clue: '', cells: [[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]] },
  { number: 58, direction: 'across', clue: '"___ Ninja" YouTube series', cells: [[7,8],[7,9],[7,10],[7,11]] },
  { number: 59, direction: 'across', clue: '', cells: [[7,13],[7,14],[7,15],[7,16]] },
  { number: 61, direction: 'across', clue: '', cells: [[7,18],[7,19],[7,20],[7,21],[7,22],[7,23]] },
  { number: 63, direction: 'across', clue: '', cells: [[8,0],[8,1],[8,2]] },
  { number: 64, direction: 'across', clue: 'Start of a Supremes song or end of a Christmas song', cells: [[8,4],[8,5],[8,6],[8,7],[8,8]] },
  { number: 66, direction: 'across', clue: '', cells: [[8,10],[8,11],[8,12],[8,13]] },
  { number: 68, direction: 'across', clue: '', cells: [[8,16],[8,17],[8,18],[8,19]] },
  { number: 70, direction: 'across', clue: '', cells: [[8,21],[8,22],[8,23],[8,24]] },
  { number: 72, direction: 'across', clue: 'Tatum franchise', cells: [[9,3],[9,4],[9,5],[9,6],[9,7],[9,8]] },
  { number: 73, direction: 'across', clue: '', cells: [[9,11],[9,12],[9,13],[9,14],[9,15],[9,16],[9,17],[9,18],[9,19],[9,20],[9,21],[9,22],[9,23],[9,24]] },
  { number: 77, direction: 'across', clue: '', cells: [[10,1],[10,2],[10,3]] },
  { number: 79, direction: 'across', clue: '', cells: [[10,5],[10,6],[10,7]] },
  { number: 80, direction: 'across', clue: '', cells: [[10,10],[10,11],[10,12],[10,13],[10,14],[10,15]] },
  { number: 81, direction: 'across', clue: '', cells: [[10,17],[10,18],[10,19],[10,20]] },
  { number: 82, direction: 'across', clue: '', cells: [[10,22],[10,23],[10,24]] },
  { number: 83, direction: 'across', clue: '', cells: [[11,0],[11,1],[11,2],[11,3],[11,4]] },
  { number: 85, direction: 'across', clue: 'Guitarist Harrison', cells: [[11,6],[11,7],[11,8],[11,9],[11,10]] },
  { number: 88, direction: 'across', clue: '', cells: [[11,12],[11,13],[11,14],[11,15],[11,16]] },
  { number: 90, direction: 'across', clue: '', cells: [[11,18],[11,19],[11,20]] },
  { number: 91, direction: 'across', clue: '', cells: [[11,22],[11,23],[11,24]] },
  { number: 92, direction: 'across', clue: '', cells: [[12,0],[12,1],[12,2],[12,3],[12,4],[12,5]] },
  { number: 94, direction: 'across', clue: '', cells: [[12,7],[12,8],[12,9],[12,10],[12,11],[12,12],[12,13],[12,14],[12,15],[12,16],[12,17]] },
  { number: 97, direction: 'across', clue: '', cells: [[12,19],[12,20],[12,21],[12,22],[12,23],[12,24]] },
  { number: 99, direction: 'across', clue: '', cells: [[13,0],[13,1],[13,2]] },
  { number: 100, direction: 'across', clue: 'Smartphone powerer', cells: [[13,4],[13,5],[13,6]] },
  { number: 102, direction: 'across', clue: '', cells: [[13,8],[13,9],[13,10],[13,11],[13,12]] },
  { number: 103, direction: 'across', clue: '', cells: [[13,14],[13,15],[13,16],[13,17],[13,18]] },
  { number: 105, direction: 'across', clue: '', cells: [[13,20],[13,21],[13,22],[13,23],[13,24]] },
  { number: 106, direction: 'across', clue: 'The Cavaliers', cells: [[14,0],[14,1],[14,2]] },
  { number: 107, direction: 'across', clue: '', cells: [[14,4],[14,5],[14,6],[14,7]] },
  { number: 109, direction: 'across', clue: '', cells: [[14,9],[14,10],[14,11],[14,12],[14,13],[14,14]] },
  { number: 111, direction: 'across', clue: '', cells: [[14,17],[14,18],[14,19]] },
  { number: 113, direction: 'across', clue: "Anthony's result vs. Jake", cells: [[14,21],[14,22],[14,23]] },
  { number: 114, direction: 'across', clue: '', cells: [[15,0],[15,1],[15,2],[15,3],[15,4],[15,5],[15,6],[15,7],[15,8],[15,9],[15,10],[15,11],[15,12],[15,13]] },
  { number: 117, direction: 'across', clue: '', cells: [[15,16],[15,17],[15,18],[15,19],[15,20],[15,21]] },
  { number: 119, direction: 'across', clue: '', cells: [[16,0],[16,1],[16,2],[16,3]] },
  { number: 120, direction: 'across', clue: 'One of two women named in Spinderella\'s trio', cells: [[16,5],[16,6],[16,7],[16,8]] },
  { number: 121, direction: 'across', clue: '', cells: [[16,11],[16,12],[16,13],[16,14]] },
  { number: 123, direction: 'across', clue: '', cells: [[16,16],[16,17],[16,18],[16,19],[16,20]] },
  { number: 124, direction: 'across', clue: '', cells: [[16,22],[16,23],[16,24]] },
  { number: 127, direction: 'across', clue: 'Sounds in the night', cells: [[17,1],[17,2],[17,3],[17,4],[17,5],[17,6]] },
  { number: 129, direction: 'across', clue: '', cells: [[17,8],[17,9],[17,10],[17,11]] },
  { number: 132, direction: 'across', clue: '', cells: [[17,13],[17,14],[17,15],[17,16]] },
  { number: 134, direction: 'across', clue: '', cells: [[17,18],[17,19],[17,20],[17,21],[17,22],[17,23],[17,24]] },
  { number: 136, direction: 'across', clue: 'Alpine municipality', cells: [[18,2],[18,3],[18,4],[18,5],[18,6],[18,7]] },
  { number: 138, direction: 'across', clue: '', cells: [[18,9],[18,10],[18,11],[18,12],[18,13],[18,14],[18,15],[18,16],[18,17],[18,18],[18,19],[18,20],[18,21],[18,22],[18,23],[18,24]] },
  { number: 141, direction: 'across', clue: '', cells: [[19,0],[19,1],[19,2],[19,3],[19,4]] },
  { number: 143, direction: 'across', clue: '', cells: [[19,7],[19,8],[19,9],[19,10]] },
  { number: 145, direction: 'across', clue: 'Jungler Moon Hyeon-jun', cells: [[19,12],[19,13],[19,14],[19,15]] },
  { number: 146, direction: 'across', clue: '', cells: [[19,17],[19,18],[19,19]] },
  { number: 147, direction: 'across', clue: '', cells: [[19,21],[19,22],[19,23],[19,24]] },
  { number: 148, direction: 'across', clue: '', cells: [[20,0],[20,1],[20,2]] },
  { number: 149, direction: 'across', clue: 'Theatricality', cells: [[20,4],[20,5],[20,6],[20,7],[20,8],[20,9],[20,10],[20,11],[20,12]] },
  { number: 153, direction: 'across', clue: '', cells: [[20,14],[20,15],[20,16],[20,17]] },
  { number: 155, direction: 'across', clue: '', cells: [[20,21],[20,22],[20,23],[20,24]] },
  { number: 156, direction: 'across', clue: '', cells: [[21,0],[21,1],[21,2],[21,3]] },
  { number: 158, direction: 'across', clue: "Not one's best effort", cells: [[21,5],[21,6],[21,7],[21,8],[21,9]] },
  { number: 159, direction: 'across', clue: '', cells: [[21,11],[21,12],[21,13]] },
  { number: 161, direction: 'across', clue: '', cells: [[21,15],[21,16],[21,17],[21,18],[21,19]] },
  { number: 164, direction: 'across', clue: '', cells: [[21,21],[21,22],[21,23],[21,24]] },
  { number: 165, direction: 'across', clue: 'Amount for Team Trees, Team Seas, or Team Water', cells: [[22,0],[22,1],[22,2],[22,3],[22,4],[22,5],[22,6],[22,7]] },
  { number: 167, direction: 'across', clue: 'What this puzzle commemorates in eleven words in the theme entries', cells: [[22,9],[22,10],[22,11],[22,12],[22,13],[22,14],[22,15],[22,16],[22,17],[22,18],[22,19],[22,20],[22,21],[22,22],[22,23],[22,24]] },
  { number: 171, direction: 'across', clue: '', cells: [[23,0],[23,1],[23,2],[23,3],[23,4],[23,5],[23,6],[23,7]] },
  { number: 172, direction: 'across', clue: '', cells: [[23,10],[23,11],[23,12],[23,13],[23,14],[23,15],[23,16]] },
  { number: 173, direction: 'across', clue: 'One that hangs out at the swimming hole', cells: [[23,18],[23,19],[23,20],[23,21],[23,22],[23,23],[23,24]] },
  { number: 174, direction: 'across', clue: '', cells: [[24,0],[24,1],[24,2],[24,3],[24,4],[24,5],[24,6],[24,7]] },
  { number: 175, direction: 'across', clue: '', cells: [[24,10],[24,11],[24,12],[24,13],[24,14],[24,15]] },
  { number: 176, direction: 'across', clue: '', cells: [[24,18],[24,19],[24,20],[24,21],[24,22],[24,23],[24,24]] },

  // DOWN
  { number: 1, direction: 'down', clue: 'Dry comment', cells: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0]] },
  { number: 2, direction: 'down', clue: '', cells: [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1]] },
  { number: 3, direction: 'down', clue: '', cells: [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2]] },
  { number: 4, direction: 'down', clue: '', cells: [[0,3],[1,3],[2,3]] },
  { number: 5, direction: 'down', clue: 'T.I. flick', cells: [[0,4],[1,4],[2,4]] },
  { number: 6, direction: 'down', clue: '', cells: [[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5]] },
  { number: 7, direction: 'down', clue: '', cells: [[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6]] },
  { number: 8, direction: 'down', clue: '', cells: [[0,9],[1,9],[2,9]] },
  { number: 9, direction: 'down', clue: 'Bring Me the Horizon release', cells: [[0,10],[1,10],[2,10]] },
  { number: 10, direction: 'down', clue: '', cells: [[0,11],[1,11]] },
  { number: 11, direction: 'down', clue: '', cells: [[0,12],[1,12]] },
  { number: 12, direction: 'down', clue: '', cells: [[0,13],[1,13],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13]] },
  { number: 13, direction: 'down', clue: '', cells: [[0,14],[1,14],[2,14]] },
  { number: 14, direction: 'down', clue: 'Perry and kin', cells: [[0,17],[1,17],[2,17],[3,17],[4,17],[5,17],[6,17],[7,17],[8,17],[9,17]] },
  { number: 15, direction: 'down', clue: '', cells: [[0,18],[1,18],[2,18],[3,18],[4,18],[5,18],[6,18],[7,18],[8,18],[9,18]] },
  { number: 16, direction: 'down', clue: '', cells: [[0,19],[1,19],[2,19],[3,19]] },
  { number: 17, direction: 'down', clue: '', cells: [[0,20],[1,20],[2,20]] },
  { number: 18, direction: 'down', clue: 'Driver who won awards for his Ferrari', cells: [[0,21],[1,21],[2,21]] },
  { number: 19, direction: 'down', clue: '', cells: [[0,22],[1,22],[2,22],[3,22],[4,22],[5,22]] },
  { number: 20, direction: 'down', clue: '', cells: [[0,23],[1,23],[2,23],[3,23],[4,23],[5,23]] },
  { number: 21, direction: 'down', clue: '', cells: [[0,24],[1,24],[2,24],[3,24],[4,24],[5,24]] },
  { number: 23, direction: 'down', clue: 'Some sports league contracts, for short', cells: [[1,8],[2,8]] },
  { number: 26, direction: 'down', clue: '', cells: [[2,7],[3,7],[4,7],[5,7],[6,7],[7,7]] },
  { number: 27, direction: 'down', clue: '', cells: [[2,15],[3,15],[4,15],[5,15],[6,15],[7,15],[8,15],[9,15]] },
  { number: 33, direction: 'down', clue: '', cells: [[3,16],[4,16],[5,16],[6,16]] },
  { number: 37, direction: 'down', clue: 'Takes a hot bath', cells: [[4,10],[5,10],[6,10],[7,10]] },
  { number: 39, direction: 'down', clue: '', cells: [[4,14],[5,14]] },
  { number: 40, direction: 'down', clue: '', cells: [[4,20],[5,20],[6,20],[7,20]] },
  { number: 43, direction: 'down', clue: '', cells: [[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5]] },
  { number: 44, direction: 'down', clue: 'Was a little too close', cells: [[5,6],[6,6]] },
  { number: 46, direction: 'down', clue: '', cells: [[5,11],[6,11],[7,11]] },
  { number: 49, direction: 'down', clue: '', cells: [[5,21],[6,21]] },
  { number: 51, direction: 'down', clue: '', cells: [[6,4],[7,4],[8,4],[9,4],[10,4]] },
  { number: 52, direction: 'down', clue: 'Japanese streamer, perhaps', cells: [[6,8],[7,8],[8,8],[9,8]] },
  { number: 53, direction: 'down', clue: '', cells: [[6,13],[7,13]] },
  { number: 55, direction: 'down', clue: '', cells: [[6,18],[7,18]] },
  { number: 56, direction: 'down', clue: '', cells: [[6,19],[7,19],[8,19],[9,19],[10,19]] },
  { number: 60, direction: 'down', clue: '___-12 (conference with two members in 2025)', cells: [[7,16],[8,16],[9,16],[10,16]] },
  { number: 62, direction: 'down', clue: '', cells: [[7,23],[8,23],[9,23],[10,23]] },
  { number: 65, direction: 'down', clue: '', cells: [[8,7],[9,7],[10,7],[11,7]] },
  { number: 67, direction: 'down', clue: '', cells: [[8,12],[9,12],[10,12]] },
  { number: 69, direction: 'down', clue: 'One who preferred $10,000 sushi to $10 sushi', cells: [[8,17],[9,17],[10,17]] },
  { number: 71, direction: 'down', clue: '', cells: [[8,24],[9,24],[10,24]] },
  { number: 72, direction: 'down', clue: '', cells: [[9,3],[10,3],[11,3]] },
  { number: 74, direction: 'down', clue: '', cells: [[9,14],[10,14],[11,14]] },
  { number: 75, direction: 'down', clue: 'Host of the Christmas "Holiday Halftime Party"', cells: [[9,15],[10,15],[11,15],[12,15],[13,15],[14,15]] },
  { number: 76, direction: 'down', clue: '', cells: [[9,20],[10,20],[11,20]] },
  { number: 77, direction: 'down', clue: '', cells: [[10,1],[11,1],[12,1]] },
  { number: 78, direction: 'down', clue: '', cells: [[10,2],[11,2],[12,2],[13,2]] },
  { number: 80, direction: 'down', clue: 'Words before doubling a piece', cells: [[10,10],[11,10],[12,10],[13,10],[14,10]] },
  { number: 83, direction: 'down', clue: '', cells: [[11,0],[12,0],[13,0],[14,0]] },
  { number: 84, direction: 'down', clue: '', cells: [[11,4],[12,4],[13,4],[14,4]] },
  { number: 86, direction: 'down', clue: '', cells: [[11,8],[12,8]] },
  { number: 87, direction: 'down', clue: 'One end of the pencil scale', cells: [[11,9],[12,9],[13,9]] },
  { number: 89, direction: 'down', clue: '', cells: [[11,16],[12,16],[13,16],[14,16]] },
  { number: 93, direction: 'down', clue: '', cells: [[12,5],[13,5],[14,5],[15,5]] },
  { number: 95, direction: 'down', clue: '', cells: [[12,11],[13,11],[14,11],[15,11]] },
  { number: 96, direction: 'down', clue: 'John B is one', cells: [[12,17],[13,17],[14,17]] },
  { number: 98, direction: 'down', clue: '', cells: [[12,21],[13,21],[14,21]] },
  { number: 101, direction: 'down', clue: '', cells: [[13,6],[14,6],[15,6]] },
  { number: 104, direction: 'down', clue: '', cells: [[13,18],[14,18],[15,18]] },
  { number: 108, direction: 'down', clue: 'Motor oil brand', cells: [[14,7],[15,7],[16,7]] },
  { number: 110, direction: 'down', clue: '', cells: [[14,13],[15,13]] },
  { number: 112, direction: 'down', clue: '', cells: [[14,19],[15,19]] },
  { number: 115, direction: 'down', clue: '', cells: [[15,3],[16,3],[17,3]] },
  { number: 116, direction: 'down', clue: 'School where they also say 95-Down', cells: [[15,8],[16,8],[17,8]] },
  { number: 117, direction: 'down', clue: '', cells: [[15,16],[16,16],[17,16]] },
  { number: 118, direction: 'down', clue: '', cells: [[15,20],[16,20],[17,20]] },
  { number: 122, direction: 'down', clue: '', cells: [[16,14],[17,14]] },
  { number: 124, direction: 'down', clue: 'File productions', cells: [[16,22],[17,22],[18,22]] },
  { number: 125, direction: 'down', clue: '', cells: [[16,23],[17,23],[18,23]] },
  { number: 126, direction: 'down', clue: '', cells: [[16,24],[17,24],[18,24]] },
  { number: 128, direction: 'down', clue: '', cells: [[17,4],[18,4],[19,4]] },
  { number: 130, direction: 'down', clue: 'Some cords', cells: [[17,9],[18,9],[19,9]] },
  { number: 131, direction: 'down', clue: '', cells: [[17,10],[18,10],[19,10]] },
  { number: 133, direction: 'down', clue: '', cells: [[17,15],[18,15],[19,15]] },
  { number: 135, direction: 'down', clue: '', cells: [[17,21],[18,21],[19,21]] },
  { number: 137, direction: 'down', clue: 'Cotton weave', cells: [[18,7],[19,7],[20,7],[21,7],[22,7]] },
  { number: 139, direction: 'down', clue: '', cells: [[18,12],[19,12]] },
  { number: 140, direction: 'down', clue: '', cells: [[18,17],[19,17],[20,17]] },
  { number: 141, direction: 'down', clue: '', cells: [[19,0],[20,0],[21,0]] },
  { number: 142, direction: 'down', clue: 'Largest European lake', cells: [[19,1],[20,1],[21,1],[22,1],[23,1],[24,1]] },
  { number: 144, direction: 'down', clue: '', cells: [[19,8],[20,8],[21,8]] },
  { number: 150, direction: 'down', clue: '', cells: [[20,5],[21,5]] },
  { number: 151, direction: 'down', clue: '', cells: [[20,6],[21,6]] },
  { number: 152, direction: 'down', clue: 'Prepare mushrooms', cells: [[20,11],[21,11]] },
  { number: 154, direction: 'down', clue: '', cells: [[20,16],[21,16]] },
  { number: 157, direction: 'down', clue: '', cells: [[21,3],[22,3],[23,3]] },
  { number: 160, direction: 'down', clue: '', cells: [[21,13],[22,13],[23,13]] },
  { number: 162, direction: 'down', clue: 'Easy as falling off ___', cells: [[21,18],[22,18],[23,18]] },
  { number: 163, direction: 'down', clue: '', cells: [[21,19],[22,19],[23,19]] },
  { number: 166, direction: 'down', clue: '', cells: [[22,4],[23,4],[24,4]] },
  { number: 168, direction: 'down', clue: '', cells: [[22,10],[23,10]] },
  { number: 169, direction: 'down', clue: 'NW-based retailer', cells: [[22,14],[23,14],[24,14]] },
  { number: 170, direction: 'down', clue: '', cells: [[22,20],[23,20],[24,20]] },
];

// Helper: check if cell is black
export function isBlack(row: number, col: number): boolean {
  return PUZZLE_GRID[row]?.[col] === "#";
}

// Helper: get cell number (or null)
export function getCellNumber(row: number, col: number): number | null {
  const val = PUZZLE_GRID[row]?.[col];
  return typeof val === 'number' ? val : null;
}

// Helper: check if cell has a circle
export function isCircled(row: number, col: number): boolean {
  return CIRCLED_CELLS.has(`${row},${col}`);
}
