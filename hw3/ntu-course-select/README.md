## NTU Course Selection (Front-end Only)

Requirements
- React + TypeScript (Vite)
- TailwindCSS (v4) + minimal shadcn-compatible utilities
- CSV parsing with Papa Parse

Getting Started
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Place the NTU course CSV at `public/data/courses.csv`.

CSV Source
- Download the NTU COOL CSV and place as `public/data/courses.csv`. Example drive link: `https://drive.google.com/file/d/1GHvhxMGN3xKkg-CNPk7ovJ7sAmKE299K/view?usp=drive_link`.

Structure
```
src/
  components/       # UI components
  context/          # React Context for selection/submission
  hooks/            # CSV parsing hook
  pages/            # Browse, Selection, Submitted
  types/            # Course types
public/data/
  courses.csv       # NTU courses
```

Notes
- Hot reload picks up CSV changes because it’s served from `public/`.
- Large CSVs are parsed in chunks using Papa Parse worker mode.
