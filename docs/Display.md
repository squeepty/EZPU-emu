# src/display/Display.ts

## Responsibility

`src/display/Display.ts` converts the machine video memory into a human-readable screen.

## Display model

- The display is a fixed 4×4 grid.
- Pixel data is stored in `Memory.VIDEO_BANK` (`0xF`).
- Address mapping is row-major:
  - `0` → `(0,0)`
  - `1` → `(1,0)`
  - `4` → `(0,1)`
  - `15` → `(3,3)`

## `render(memory)`

- Reads the video bank from `Memory`.
- Builds each row by reading addresses 0..15.
- Converts a nibble value of `1` to `#`, anything else to `.`.
- Returns a newline-separated string representing the screen.

## Notes

- The display is intentionally simple and decoupled from the CPU.
- It does not maintain its own state. It renders directly from memory.
