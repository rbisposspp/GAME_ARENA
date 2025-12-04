# English Challenge Arena

## Project Overview
**English Challenge Arena** is a turn-based, interactive web application designed for ESL (English as a Second Language) learning. It functions as a competitive game where two teams compete to solve various English language exercises, including vocabulary, grammar, and matching challenges.

## Tech Stack
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+)
*   **Styling:** Custom CSS (`style.css`) combined with Tailwind CSS (via CDN).
*   **Fonts:** Google Fonts (Inter).
*   **Build System:** None (Static site).

## Project Structure
*   **`index.html`**: The main entry point containing the game's HTML structure, including setup screens, the game interface, and overlays.
*   **`script.js`**: Contains the core game logic, including:
    *   State management (teams, scores, timer, turns).
    *   DOM manipulation for rendering exercises.
    *   Event handling (clicks, drag-and-drop, inputs).
    *   Exercise validation logic.
*   **`exerciseData.js`**: A JavaScript file exporting a global `exerciseData` array. This contains the content for all game exercises (questions, answers, types, images).
*   **`style.css`**: Custom styles for the game, including themes (colors, typography), specific component styles (cards, inputs), and animations.
*   **`images/`**: Directory storing static assets for Picture Dictionary and other visual exercises.

## Running the Project
Since this is a static web application, no build process or package manager is required.

1.  **Open `index.html`** directly in any modern web browser.
2.  **Start Game:** Use the on-screen setup to configure team names, player counts, and round duration.

## Game Configuration (`exerciseData.js`)
The game content is data-driven. To modify questions or add new exercises, edit `exerciseData.js`.

**Structure:**
The data is an array of "Sets". Team 1 uses Set 1, and Team 2 uses Set 2 (alternating).

```javascript
const exerciseData = [
  {
    set: 1,
    exercises: [
      {
        id: '1A', // Unique ID
        type: 'wordScramble', // Exercise Logic Type
        title: 'Vocabulary: Word Scramble',
        words: [ ... ]
      },
      // ... more exercises
    ]
  },
  // ... Set 2
];
```

### Supported Exercise Types
*   `wordScramble`: Unscramble letters to form words.
*   `tableFill`: Complete tables (e.g., singular/plural, possessives).
*   `matching`: Match questions to answers.
*   `fillIn`: Fill in the blanks (supports sentences and suffixes).
*   `pictureDictionary`: Identify objects from images.
*   `oppositesMatching`: Match words with their opposites.
*   `dragDropCategorize`: Drag words into correct categories.

## Development Conventions
*   **State Management:** Global variables in `script.js` manage the game state (e.g., `currentTeam`, `team1Score`, `isPaused`).
*   **DOM Access:** Heavy reliance on `document.getElementById` and dynamic element creation (`document.createElement`).
*   **Styling:** Use CSS variables in `style.css` for theming (e.g., `var(--primary-color)`).
*   **Error Handling:** Basic error logging to the console and user-facing messages via `showMessage()`.