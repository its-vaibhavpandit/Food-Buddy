/**
 * Lightweight QR Code Generator using Canvas API
 * Generates UPI payment QR codes without external dependencies
 *
 * Based on the QR Code specification (ISO/IEC 18004)
 * Simplified for Mode Byte (numeric/alphanumeric/byte) with error correction level L
 */

// Galois Field GF(256) for Reed-Solomon error correction
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[(GF256_LOG[a] + GF256_LOG[b]) % 255];
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen: number[] = [1];
  for (let i = 0; i < ecLen; i++) {
    const ng: number[] = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      ng[j] ^= gen[j];
      ng[j + 1] ^= gfMul(gen[j], GF256_EXP[i]);
    }
    gen.length = 0;
    gen.push(...ng);
  }

  const remainder = new Array(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let i = 0; i < ecLen; i++) {
      remainder[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return remainder;
}

// Version capacity table [version][ecLevel] = data codewords
const DATA_CODEWORDS: Record<number, Record<string, number>> = {
  1: { L: 19, M: 16, Q: 13, H: 9 },
  2: { L: 34, M: 28, Q: 22, H: 16 },
  3: { L: 55, M: 44, Q: 34, H: 26 },
  4: { L: 80, M: 64, Q: 48, H: 36 },
  5: { L: 108, M: 86, Q: 62, H: 46 },
  6: { L: 136, M: 108, Q: 76, H: 60 },
  7: { L: 156, M: 124, Q: 88, H: 66 },
  8: { L: 194, M: 154, Q: 110, H: 86 },
  9: { L: 232, M: 182, Q: 132, H: 100 },
  10: { L: 274, M: 216, Q: 154, H: 122 },
};

const EC_CODEWORDS_PER_BLOCK: Record<number, Record<string, number>> = {
  1: { L: 7, M: 10, Q: 13, H: 17 },
  2: { L: 10, M: 16, Q: 22, H: 28 },
  3: { L: 15, M: 26, Q: 18, H: 22 },
  4: { L: 20, M: 18, Q: 26, H: 16 },
  5: { L: 26, M: 24, Q: 18, H: 22 },
  6: { L: 18, M: 16, Q: 24, H: 28 },
  7: { L: 20, M: 18, Q: 18, H: 26 },
  8: { L: 24, M: 22, Q: 22, H: 26 },
  9: { L: 30, M: 22, Q: 20, H: 24 },
  10: { L: 18, M: 26, Q: 24, H: 28 },
};

const NUM_BLOCKS: Record<number, Record<string, number>> = {
  1: { L: 1, M: 1, Q: 1, H: 1 },
  2: { L: 1, M: 1, Q: 1, H: 1 },
  3: { L: 1, M: 1, Q: 2, H: 2 },
  4: { L: 1, M: 2, Q: 2, H: 4 },
  5: { L: 1, M: 2, Q: 2, H: 2 },
  6: { L: 2, M: 4, Q: 4, H: 4 },
  7: { L: 2, M: 4, Q: 2, H: 4 },
  8: { L: 2, M: 2, Q: 4, H: 4 },
  9: { L: 2, M: 3, Q: 4, H: 4 },
  10: { L: 2, M: 4, Q: 6, H: 6 },
};

function getVersion(dataLen: number, ecLevel: string): number {
  for (let v = 1; v <= 10; v++) {
    const capacity = DATA_CODEWORDS[v][ecLevel];
    if (dataLen <= capacity) return v;
  }
  throw new Error('Data too long for QR code (max version 10)');
}

function encodeData(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else if (code < 2048) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

function createDataCodewords(text: string, ecLevel: string): { version: number; codewords: number[] } {
  const dataBytes = encodeData(text);
  const version = getVersion(dataBytes.length + 3, ecLevel); // +3 for mode indicator + length
  const totalDataCW = DATA_CODEWORDS[version][ecLevel];

  // Build bit stream
  const bits: number[] = [];

  // Mode indicator: byte mode = 0100
  bits.push(0, 1, 0, 0);

  // Character count (8 bits for version 1-9, 16 for 10+)
  const countBits = version <= 9 ? 8 : 16;
  for (let i = countBits - 1; i >= 0; i--) {
    bits.push((dataBytes.length >> i) & 1);
  }

  // Data
  for (const byte of dataBytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Terminator
  const termLen = Math.min(4, totalDataCW * 8 - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Convert to bytes
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    codewords.push(byte);
  }

  // Pad codewords
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (codewords.length < totalDataCW) {
    codewords.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  return { version, codewords };
}

function createFinalMessage(codewords: number[], version: number, ecLevel: string): number[] {
  const numBlocks = NUM_BLOCKS[version][ecLevel];
  const ecPerBlock = EC_CODEWORDS_PER_BLOCK[version][ecLevel];
  const totalDataCW = codewords.length;
  const shortBlockLen = Math.floor(totalDataCW / numBlocks);

  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;

  for (let b = 0; b < numBlocks; b++) {
    const isLong = b >= numBlocks - (totalDataCW % numBlocks);
    const blockLen = shortBlockLen + (isLong ? 1 : 0);
    const block = codewords.slice(offset, offset + blockLen);
    offset += blockLen;
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  // Interleave
  const result: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  return result;
}

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 52],
};

function createMatrix(version: number): { matrix: number[][]; reserved: boolean[][] } {
  const size = 17 + version * 4;
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  // Finder patterns
  const placeFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r, tc = col + c;
        if (tr < 0 || tr >= size || tc < 0 || tc >= size) continue;
        reserved[tr][tc] = true;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[tr][tc] = (isEdge || isInner) ? 1 : 0;
        }
      }
    }
  };

  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // Alignment patterns
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version];
    for (const r of positions) {
      for (const c of positions) {
        if (reserved[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const tr = r + dr, tc = c + dc;
            reserved[tr][tc] = true;
            const isEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            matrix[tr][tc] = (isEdge || isCenter) ? 1 : 0;
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) {
      reserved[6][i] = true;
      matrix[6][i] = i % 2 === 0 ? 1 : 0;
    }
    if (!reserved[i][6]) {
      reserved[i][6] = true;
      matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }
  }

  // Dark module
  reserved[size - 8][8] = true;
  matrix[size - 8][8] = 1;

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    reserved[8][i] = true;
    reserved[8][size - 1 - i] = true;
    reserved[i][8] = true;
    reserved[size - 1 - i][8] = true;
  }
  reserved[8][8] = true;

  return { matrix, reserved };
}

function placeData(matrix: number[][], reserved: boolean[][], message: number[]): void {
  const size = matrix.length;
  let bitIdx = 0;

  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // Skip timing column

    for (let row = 0; row < size; row++) {
      for (const dc of [0, -1]) {
        const c = col + dc;
        const actualRow = ((Math.floor((size - 1 - col) / 2)) % 2 === 0) ? (size - 1 - row) : row;
        if (reserved[actualRow][c]) continue;

        if (bitIdx < message.length * 8) {
          const byteIdx = Math.floor(bitIdx / 8);
          const bitPos = 7 - (bitIdx % 8);
          matrix[actualRow][c] = (message[byteIdx] >> bitPos) & 1;
          bitIdx++;
        }
      }
    }
  }
}

const FORMAT_INFO: Record<number, number> = {
  0: 0x77c4, 1: 0x72f3, 2: 0x7daa, 3: 0x789d,
  4: 0x662f, 5: 0x6318, 6: 0x6c41, 7: 0x6976,
};

function applyMaskAndFormat(matrix: number[][], reserved: boolean[][]): void {
  const size = matrix.length;

  // Apply mask 0 (checkerboard) and format info
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        matrix[r][c] ^= 1;
      }
    }
  }

  // Place format info (mask 0, EC level L = 01)
  const formatBits = FORMAT_INFO[0]; // mask 0, L
  const positions = [
    // Around top-left finder
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  const positions2 = [
    // Around bottom-left and top-right finders
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
    [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];

  for (let i = 0; i < 15; i++) {
    const bit = (formatBits >> (14 - i)) & 1;
    if (i < positions.length) {
      matrix[positions[i][0]][positions[i][1]] = bit;
    }
    if (i < positions2.length) {
      matrix[positions2[i][0]][positions2[i][1]] = bit;
    }
  }
}

/**
 * Generate a QR code as a 2D boolean matrix
 */
export function generateQRMatrix(text: string): boolean[][] {
  const ecLevel = 'L';
  const { version, codewords } = createDataCodewords(text, ecLevel);
  const message = createFinalMessage(codewords, version, ecLevel);
  const { matrix, reserved } = createMatrix(version);

  placeData(matrix, reserved, message);
  applyMaskAndFormat(matrix, reserved);

  return matrix.map(row => row.map(cell => cell === 1));
}

/**
 * Render QR code to a canvas element
 */
export function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: { size?: number; darkColor?: string; lightColor?: string; margin?: number } = {}
): void {
  const { size = 256, darkColor = '#000000', lightColor = '#ffffff', margin = 4 } = options;
  const qrMatrix = generateQRMatrix(text);
  const moduleCount = qrMatrix.length;
  const totalModules = moduleCount + margin * 2;
  const moduleSize = size / totalModules;

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = darkColor;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qrMatrix[row][col]) {
        ctx.fillRect(
          (col + margin) * moduleSize,
          (row + margin) * moduleSize,
          moduleSize + 0.5,
          moduleSize + 0.5
        );
      }
    }
  }
}

/**
 * Generate a UPI payment deep link
 */
export function generateUPILink(options: {
  pa: string;
  pn: string;
  am: number;
  cu?: string;
  tn?: string;
}): string {
  const { pa, pn, am, cu = 'INR', tn = 'Fast Food Buddy Order' } = options;
  const params = new URLSearchParams({
    pa,
    pn,
    am: am.toFixed(2),
    cu,
    tn,
  });
  return `upi://pay?${params.toString()}`;
}
