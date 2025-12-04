// ========================================
//          DOM Element References
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Setup Screen Elements
    const gameSetupOverlay = document.getElementById('game-setup');
    const setupBox = document.getElementById('setup-box');
    const team1NameInput = document.getElementById('team1-name-input');
    const team2NameInput = document.getElementById('team2-name-input');
    const startNewGameBtn = document.getElementById('start-new-game-btn');
    const customImageInput = document.getElementById('custom-image-input');
    const customItemsArea = document.getElementById('custom-items-area');
    const customFileUploadLabel = document.querySelector('label[for="custom-image-input"]');
    const clearCustomItemsBtn = document.getElementById('clear-custom-items-btn');
    const initialCustomAreaText = '<p style="font-size: 0.9em; color: var(--medium-text-dark); text-align: center;">Selected image previews and answer fields will appear here...</p>';

    // Main Game Interface Elements
    const mainGameInterface = document.getElementById('main-game-interface');
    const gameHeader = document.getElementById('game-header');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const globalTimerDisplay = document.getElementById('global-timer-display');
    const turnIndicator = document.getElementById('turn-indicator');
    const team1ScoreDisplay = document.getElementById('team1-score');
    const team2ScoreDisplay = document.getElementById('team2-score');
    const scoreboardTeam1Header = document.getElementById('scoreboard-th-t1');
    const scoreboardTeam2Header = document.getElementById('scoreboard-th-t2');
    const exercisesContainer = document.getElementById('exercises-container');
    const globalNextTurnArea = document.getElementById('global-next-turn-area');
    const messageBox = document.getElementById('message-box');
    // Players per team controls
    const playersPerTeamSelect = document.getElementById('players-per-team-select');
    const team1PlayersContainer = document.getElementById('team1-players-container');
    const team2PlayersContainer = document.getElementById('team2-players-container');
    // Round duration control
    const roundDurationInput = document.getElementById('round-duration-input');

    // Teacher Mode removed: no elements
    const teacherControls = null;
    const teacherModeBtn = null;
    const teacherExerciseSelect = null;
    const teacherSwapSetBtn = null;

    // Overlays
    const pauseOverlay = document.getElementById('pause-overlay');
    const endGameOverlay = document.getElementById('end-game-overlay');
    const endGameBox = document.getElementById('end-game-box');
    const endGameTitle = document.getElementById('end-game-title');
    const endGameReason = document.getElementById('end-game-reason');
    const endGameScore = document.getElementById('end-game-score');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Game State Variables
    let team1Name = "Team 1"; let team2Name = "Team 2"; let team1Score = 0; let team2Score = 0;
    let currentTeam = 1; let gameTimerInterval = null; let totalSeconds = 15 * 60; // 15 minutes
    let secondsRemaining = totalSeconds; let isPaused = false; let isGameOver = false;
    let messageTimeout = null; let currentExerciseId = null; let currentExerciseData = null;
    let exerciseOrder = []; let addedSentences = []; let uploadedPictureItems = [];
    let isTeacherMode = false; // teacher mode disabled
    let draggedItemId = null; // For drag/drop
    // Players per team state
    let playersPerTeam = 1;
    let team1Players = [];
    let team2Players = [];
    let team1PlayerIndex = -1; // start at -1 so first advance sets to 0
    let team2PlayerIndex = -1;

    // Check critical elements
    if (!startNewGameBtn || !mainGameInterface || !exercisesContainer || !gameSetupOverlay || !pauseResumeBtn || !globalTimerDisplay || !turnIndicator || !team1ScoreDisplay || !team2ScoreDisplay || !pauseOverlay || !endGameOverlay || !customImageInput || !customItemsArea) {
        console.error("One or more critical UI elements are missing! Check IDs.");
        document.body.innerHTML = '<p style="color:red;font-size:1.2em;text-align:center;margin-top:2rem;">Error: Critical UI elements missing.</p>';
        return; // Stop execution if critical elements are missing
    }

    // ========================================
    //          Event Listeners Setup
    // ========================================
    // Setup screen listeners
    if (customImageInput) customImageInput.addEventListener('change', handleFileSelection);
    if (clearCustomItemsBtn) clearCustomItemsBtn.addEventListener('click', clearCustomItems);
    if (customFileUploadLabel && customImageInput) {
        // Make label keyboard accessible
        customFileUploadLabel.addEventListener('click', (e) => { customImageInput.click(); });
        customFileUploadLabel.setAttribute('role', 'button');
        customFileUploadLabel.setAttribute('tabindex', '0');
        customFileUploadLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                customImageInput.click();
            }
        });
    }
    // Main game listeners
    if (startNewGameBtn) startNewGameBtn.addEventListener('click', initiateNewGame);
    if (pauseResumeBtn) pauseResumeBtn.addEventListener('click', togglePause);
    if (playAgainBtn) playAgainBtn.addEventListener('click', playAgain);
    // Teacher Mode removed: no listeners
    if (playersPerTeamSelect) playersPerTeamSelect.addEventListener('change', handlePlayersPerTeamChange);

    // ========================================
    //          Custom Image Upload Functions
    // ========================================
    function handleFileSelection(event) {
        if (!customItemsArea) return;
        const files = event.target.files;
        if (!files || files.length === 0) return;

        customItemsArea.innerHTML = ''; // Clear previous previews
        uploadedPictureItems = []; // Reset array
        let validFilesFound = false;

        const readPromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                if (!file.type.startsWith('image/')) {
                    // Not an image file, resolve null to skip
                    resolve(null);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'custom-item-preview';

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `Preview of ${file.name}`;

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Enter correct answer...';
                    input.dataset.imageDataUrl = e.target.result; // Store Data URL if needed later
                    input.setAttribute('aria-label', `Correct answer for ${file.name}`);

                    itemDiv.append(img, input);
                    customItemsArea.appendChild(itemDiv);
                    validFilesFound = true;
                    resolve(true); // Resolve successfully
                };
                reader.onerror = reject; // Reject promise on error
                reader.readAsDataURL(file);
            });
        });

        // Wait for all files to be processed
        Promise.all(readPromises).then(() => {
            if (validFilesFound && clearCustomItemsBtn) {
                clearCustomItemsBtn.style.display = 'inline-block'; // Show clear button
            } else if (!validFilesFound) {
                 // If no valid images were found, reset area
                customItemsArea.innerHTML = initialCustomAreaText;
                if (clearCustomItemsBtn) clearCustomItemsBtn.style.display = 'none';
            }
        }).catch(error => {
            console.error("Error processing selected files:", error);
            showMessage("An error occurred while processing images.", "error");
            clearCustomItems(); // Clear everything on error
        });
    }

    function clearCustomItems() {
        if (customItemsArea) customItemsArea.innerHTML = initialCustomAreaText;
        if (customImageInput) customImageInput.value = ''; // Reset file input
        if (clearCustomItemsBtn) clearCustomItemsBtn.style.display = 'none';
        uploadedPictureItems = []; // Clear the data array
        console.log("Custom items cleared.");
    }

    // ========================================
    //          Players Per Team (Setup UI)
    // ========================================
    function handlePlayersPerTeamChange() {
        const val = parseInt(playersPerTeamSelect.value, 10);
        playersPerTeam = (isNaN(val) ? 1 : Math.max(1, Math.min(4, val)));
        renderPlayerInputs();
    }

    function renderPlayerInputs() {
        if (!team1PlayersContainer || !team2PlayersContainer) return;
        team1PlayersContainer.innerHTML = '<label>Team 1 Players:</label>';
        team2PlayersContainer.innerHTML = '<label>Team 2 Players:</label>';

        for (let i = 0; i < playersPerTeam; i++) {
            const t1 = document.createElement('input');
            t1.type = 'text';
            t1.id = `team1-player-${i+1}`;
            t1.placeholder = `Team 1 - Player ${i+1} Name`;
            t1.autocomplete = 'off';
            t1.style.marginTop = '0.3rem';

            const t2 = document.createElement('input');
            t2.type = 'text';
            t2.id = `team2-player-${i+1}`;
            t2.placeholder = `Team 2 - Player ${i+1} Name`;
            t2.autocomplete = 'off';
            t2.style.marginTop = '0.3rem';

            team1PlayersContainer.appendChild(t1);
            team2PlayersContainer.appendChild(t2);
        }
    }

    // ========================================
    //          Game Setup & Initialization Functions
    // ========================================
    function populateExerciseOrder() {
        exerciseOrder = [];
        try {
            const referenceSetIndex = 0; // Use Set 1 to define the order
            if (!exerciseData || !exerciseData[referenceSetIndex] || !exerciseData[referenceSetIndex].exercises) {
                throw new Error(`Reference Set ${referenceSetIndex + 1} data is missing or invalid.`);
            }
            // Get IDs from the reference set
            exerciseOrder = exerciseData[referenceSetIndex].exercises
                                .map(ex => ex?.id)
                                .filter(id => id); // Filter out any undefined/null IDs

            if (exerciseOrder.length === 0) {
                 throw new Error(`No valid exercise IDs found in reference Set ${referenceSetIndex + 1}.`);
            }
            console.log(`Exercise order determined:`, exerciseOrder);

            // Robustness check: ensure Set 2 has matching IDs (so alternating turns load correctly)
            try {
                if (exerciseData.length > 1 && exerciseData[1]?.exercises) {
                    const set1Ids = new Set(exerciseOrder);
                    const set2Ids = new Set(
                        exerciseData[1].exercises.map(ex => ex?.id).filter(Boolean)
                    );
                    const missingInSet2 = exerciseOrder.filter(id => !set2Ids.has(id));
                    const extraInSet2 = [...set2Ids].filter(id => !set1Ids.has(id));

                    if (missingInSet2.length || extraInSet2.length) {
                        console.warn("Exercise ID parity mismatch between Set 1 and Set 2.", {
                            missingInSet2,
                            extraInSet2
                        });
                        const parts = [];
                        if (missingInSet2.length) parts.push(`missing in Set 2: ${missingInSet2.length}`);
                        if (extraInSet2.length) parts.push(`extra in Set 2: ${extraInSet2.length}`);
                        const summary = parts.join(', ');
                        // Inform the user non-blockingly; game will skip missing items for the affected team
                        showMessage(`Heads-up: Set mismatch (${summary}). Skipped items will be allowed.`, 'info', 7000);
                    }
                }
            } catch (parityErr) {
                console.warn('Parity check failed:', parityErr);
            }
        } catch (error) {
            console.error(`Error populating exercise order: ${error.message}`);
            showMessage("Error determining exercise order. Cannot start game.", "error", 10000);
            endGame('load_error'); // End game if order cannot be determined
        }
    }

    function initiateNewGame() {
        console.log("Initiating new game...");
        // Process custom uploaded images if any
        uploadedPictureItems = [];
        if (customItemsArea) {
            const itemPreviews = customItemsArea.querySelectorAll('.custom-item-preview');
            itemPreviews.forEach(itemDiv => {
                const img = itemDiv.querySelector('img');
                const input = itemDiv.querySelector('input');
                if (img && input) {
                    const answer = input.value.trim();
                    // Only add if there's an answer and the image src seems valid (Data URL)
                    if (answer && img.src && img.src.startsWith('data:image/')) {
                         uploadedPictureItems.push({
                             imageDataUrl: img.src, // Using Data URL from preview
                             answer: answer
                         });
                    }
                }
            });
             if (uploadedPictureItems.length > 0) {
                showMessage(`Using ${uploadedPictureItems.length} custom images for Picture Dictionary.`, 'info', 4000);
            }
        }

        // Validate exerciseData existence (needs at least 2 sets for turn-based)
        if (!exerciseData || exerciseData.length < 2) {
             showMessage("Error: Game requires at least 2 sets of exercise data.", "error", 10000);
             return;
        }

        // Read round duration and reset Game State
        const durationMinutes = Math.max(1, Math.min(60, parseInt(roundDurationInput?.value || '15', 10) || 15));
        totalSeconds = durationMinutes * 60;
        isGameOver = false;
        isPaused = false;
        team1Score = 0;
        team2Score = 0;
        currentExerciseId = null; // Reset current exercise
        secondsRemaining = totalSeconds;
        team1Name = team1NameInput.value.trim() || "Team 1";
        team2Name = team2NameInput.value.trim() || "Team 2";

        // Read players per team and names
        const val = parseInt(playersPerTeamSelect?.value || '1', 10);
        playersPerTeam = (isNaN(val) ? 1 : Math.max(1, Math.min(4, val)));
        team1Players = [];
        team2Players = [];
        for (let i = 0; i < playersPerTeam; i++) {
            const t1 = document.getElementById(`team1-player-${i+1}`);
            const t2 = document.getElementById(`team2-player-${i+1}`);
            team1Players.push((t1?.value || '').trim() || `${team1Name} P${i+1}`);
            team2Players.push((t2?.value || '').trim() || `${team2Name} P${i+1}`);
        }
        // Reset rotation indices for players
        team1PlayerIndex = -1;
        team2PlayerIndex = -1;

        // Update team names in scoreboard header
        if(scoreboardTeam1Header) scoreboardTeam1Header.textContent = team1Name;
        if(scoreboardTeam2Header) scoreboardTeam2Header.textContent = team2Name;

        populateExerciseOrder(); // Determine the sequence of exercises
        if (isGameOver) return; // Don't proceed if populateExerciseOrder failed

        // Switch UI
        if(gameSetupOverlay) gameSetupOverlay.style.display = 'none';
        if(mainGameInterface) mainGameInterface.style.display = 'block';
        if(pauseOverlay) pauseOverlay.style.display = 'none';
        if(endGameOverlay) endGameOverlay.style.display = 'none';
        if(exercisesContainer) exercisesContainer.innerHTML = ''; // Clear previous exercises
        if (globalNextTurnArea) { globalNextTurnArea.innerHTML = ''; globalNextTurnArea.style.display = 'none'; }

        // Reset Controls
        if(pauseResumeBtn) {
            pauseResumeBtn.textContent = 'PAUSE';
            pauseResumeBtn.classList.remove('paused');
            pauseResumeBtn.disabled = false;
        }

        // Initialize displays and timer
        updateScoreboardDisplay();
        updateTimerDisplay();
        startTimer();

        // Start the first turn
        currentTeam = 1; // Team 1 starts
        switchTurn(true); // Pass true for initial turn
        showMessage(`Game started! ${team1Name}'s turn.`, 'success');
    }

    function updateScoreboardDisplay() {
        if (team1ScoreDisplay) team1ScoreDisplay.textContent = team1Score;
        if (team2ScoreDisplay) team2ScoreDisplay.textContent = team2Score;

        // Highlight only the active team's score cell
        const t1Active = currentTeam === 1 && !isGameOver && !isPaused;
        const t2Active = currentTeam === 2 && !isGameOver && !isPaused;
        if (team1ScoreDisplay) team1ScoreDisplay.classList.toggle('active', t1Active);
        if (team2ScoreDisplay) team2ScoreDisplay.classList.toggle('active', t2Active);
    }

    // ========================================
    //          Core Features Functions (Timer, Pause, End Game)
    // ========================================
    function startTimer() {
        if (gameTimerInterval) { clearInterval(gameTimerInterval); } // Clear existing interval
        if (!globalTimerDisplay || isGameOver) return; // Don't start if display missing or game over

        gameTimerInterval = setInterval(() => {
            if (!isPaused && !isGameOver) {
                secondsRemaining--;
                updateTimerDisplay();
                if (secondsRemaining <= 0) {
                    secondsRemaining = 0;
                    updateTimerDisplay();
                    endGame('time'); // End game when time runs out
                }
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        if (globalTimerDisplay) {
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            globalTimerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    function togglePause() {
         if (isGameOver) return; // Cannot pause/resume if game is over
         if (!pauseOverlay || !pauseResumeBtn) return; // Ensure elements exist

         isPaused = !isPaused;
         console.log(`Game Paused: ${isPaused}`);

         if (isPaused) {
             if (gameTimerInterval) { clearInterval(gameTimerInterval); } // Stop timer
             pauseOverlay.style.display = 'flex';
             pauseResumeBtn.textContent = 'RESUME';
             pauseResumeBtn.classList.add('paused');
             if (currentExerciseId) { disableExerciseInputs(currentExerciseId, true); } // Disable inputs
             showMessage("Game Paused", "info", 5000);
         } else {
             pauseOverlay.style.display = 'none';
             startTimer(); // Restart timer
             pauseResumeBtn.textContent = 'PAUSE';
             pauseResumeBtn.classList.remove('paused');
             if (currentExerciseId) { disableExerciseInputs(currentExerciseId, false); } // Enable inputs
             showMessage("Game Resumed", "info");
         }
         updateScoreboardDisplay(); // Update scoreboard highlight
     };

    function endGame(reason) {
        if (isGameOver) return; // Prevent multiple calls
        if (!endGameOverlay || !endGameTitle || !endGameReason || !endGameScore) {
             // Fallback if overlay elements are missing
            alert(`Game Over! Reason: ${reason}. Final Score: ${team1Name} - ${team1Score}, ${team2Name} - ${team2Score}`);
            return;
        }

        isGameOver = true;
        isPaused = false; // Ensure not paused
        if (gameTimerInterval) { clearInterval(gameTimerInterval); } // Stop timer

        // Determine reason text
        let reasonText = "";
        switch(reason) {
            case 'time': reasonText = "Time's up!"; break;
            case 'load_error': reasonText = "A critical error occurred."; break;
            case 'exercises_completed': reasonText = "All exercises completed!"; break;
            default: reasonText = "The game has ended."; break;
        }

        // Determine winner and score text
        let scoreText = `Final Score: ${team1Name} - ${team1Score} | ${team2Name} - ${team2Score}`;
        let titleText = "Game Over!";
        if (team1Score > team2Score) {
            titleText = `${team1Name} Wins! 🎉`;
        } else if (team2Score > team1Score) {
            titleText = `${team2Name} Wins! 🎉`;
        } else {
            titleText = "It's a Tie!";
        }
        // Replace placeholder markers with a proper trophy emoji
        try { titleText = titleText.replace('??', '🏆'); } catch (e) {}

        // Update overlay content
        endGameTitle.textContent = titleText;
        endGameReason.textContent = reasonText;
        endGameScore.textContent = scoreText;

        // Show overlay, hide game interface
        endGameOverlay.style.display = 'flex';
        if (mainGameInterface) mainGameInterface.style.display = 'none';
        if (pauseOverlay) pauseOverlay.style.display = 'none';
        if (pauseResumeBtn) pauseResumeBtn.disabled = true; // Disable pause button

        updateScoreboardDisplay(); // Update final score highlight (or remove)
        if(turnIndicator) turnIndicator.innerHTML = "Game Over!"; // Update turn indicator
    }

    function playAgain() {
        // Reset state and UI to show setup screen again
        if (!endGameOverlay || !gameSetupOverlay) return;

        endGameOverlay.style.display = 'none';
        gameSetupOverlay.style.display = 'flex';

        // Reset game state variables (scores reset in initiateNewGame)
        isGameOver = false;
        isPaused = false;
        currentExerciseId = null;
        secondsRemaining = totalSeconds;

        // Reset UI elements
        updateTimerDisplay();
        if (turnIndicator) turnIndicator.textContent = 'Waiting to start game...';
        if (globalNextTurnArea) { globalNextTurnArea.innerHTML = ''; globalNextTurnArea.style.display = 'none'; }
        if (exercisesContainer) exercisesContainer.innerHTML = '';
        if (mainGameInterface) mainGameInterface.style.display = 'none';
        if (pauseResumeBtn) pauseResumeBtn.disabled = false;
        if(messageBox) messageBox.classList.remove('show'); // Hide any lingering messages

        // Reset team scores and clear custom items for the new setup
        team1Score = 0;
        team2Score = 0;
        clearCustomItems(); // Clear any custom images from previous game
    };

    // ========================================
    //          Game Flow & Exercise Handling Functions
    // ========================================
     function updateTurnIndicator() {
         if (!turnIndicator) return;
         if (isGameOver) {
             turnIndicator.innerHTML = "Game Over!";
             return;
         }
          if (isTeacherMode && currentExerciseData) { // Specific Teacher Mode display
             const setNum = (currentExerciseData.set === 1) ? 1 : 2; // Get set from exercise data if available
             const exTitle = currentExerciseData.title?.replace(/^Set \d+:?\s*/, '') || "Challenge";
              turnIndicator.innerHTML = `Teacher Mode - Viewing Set ${setNum} - Ex: <span class="exercise-name">${exTitle}</span>`;
             return;
          }
          if (isTeacherMode && !currentExerciseData) {
              turnIndicator.innerHTML = `Teacher Mode - Select Exercise`;
              return;
          }
         if (!currentExerciseData || isPaused) {
             turnIndicator.innerHTML = isPaused ? "Game Paused" : "Waiting...";
             return;
         }

        // Regular game turn indicator (with player rotation)
        const teamName = (currentTeam === 1) ? team1Name : team2Name;
        const exerciseTitle = currentExerciseData.title?.replace(/^Set \d+:?\s*/, '') || "Challenge"; // Remove "Set X:" prefix
        const setNumber = currentTeam === 1 ? 1 : 2; // Set depends on the current team
        const playerName = (currentTeam === 1)
            ? (team1Players[Math.max(0, team1PlayerIndex)] || `${team1Name} P${Math.max(1, team1PlayerIndex+1)}`)
            : (team2Players[Math.max(0, team2PlayerIndex)] || `${team2Name} P${Math.max(1, team2PlayerIndex+1)}`);
        turnIndicator.innerHTML = `Turn: <span class="active-team">${teamName}</span> (Set ${setNumber})<br>` +
            `Player: <span class="exercise-name">${playerName}</span><br>` +
            `Exercise: <span class=\"exercise-name\">${exerciseTitle}</span>`;
     }

     function switchTurn(isInitialTurn = false) {
         if (isPaused || isGameOver) return; // Don't switch if paused or over

         let nextExerciseIndex;
         let nextTeam;
         const currentExerciseIndex = currentExerciseId !== null ? exerciseOrder.indexOf(currentExerciseId) : -1;

         if (isInitialTurn) {
             nextTeam = 1; // Team 1 starts
             nextExerciseIndex = 0; // First exercise
         } else {
             // Determine next team and exercise index
             nextTeam = (currentTeam === 1) ? 2 : 1; // Switch team

             if (nextTeam === 1) {
                 // If switching back to Team 1, move to the next exercise in the order
                 nextExerciseIndex = currentExerciseIndex + 1;
                 if (nextExerciseIndex >= exerciseOrder.length) {
                     // All exercises completed by both teams
                     endGame('exercises_completed');
                     return;
                 }
             } else {
                 // If switching to Team 2, stay on the same exercise index
                 if (currentExerciseIndex === -1) {
                     console.error("Cannot determine current exercise index to switch turn.");
                     endGame('load_error'); // Error if index is invalid
                     return;
                 }
                 nextExerciseIndex = currentExerciseIndex;
             }
         }

         // Validate the next index
          if (nextExerciseIndex < 0 || nextExerciseIndex >= exerciseOrder.length) {
             console.error(`Invalid next exercise index: ${nextExerciseIndex}`);
             endGame('load_error');
             return;
          }

        // Update state
        currentTeam = nextTeam;
        // Advance player rotation for the team taking the turn
        if (currentTeam === 1) {
            team1PlayerIndex = (team1PlayerIndex + 1 + playersPerTeam) % playersPerTeam;
        } else {
            team2PlayerIndex = (team2PlayerIndex + 1 + playersPerTeam) % playersPerTeam;
        }
        currentExerciseId = exerciseOrder[nextExerciseIndex];

         // Load the exercise for the new turn
         loadExercise();
         updateTurnIndicator();
         updateScoreboardDisplay();

         // Clear the "Next Turn" button area
         if (globalNextTurnArea) { globalNextTurnArea.innerHTML = ''; globalNextTurnArea.style.display = 'none'; }

         // Show message for the new turn (unless it's the very first turn)
         if (!isInitialTurn) {
             const nextTeamName = (currentTeam === 1) ? team1Name : team2Name;
             showMessage(`${nextTeamName}'s turn!`, 'info');
         }
     }

     function loadExercise() {
         if (isPaused || isGameOver || !exercisesContainer || currentExerciseId === null) return;

         const pictureDictionaryId = '4A'; // Standard ID for picture dictionary

         // --- Priority 1: Check for Custom Uploaded Images ---
         // If the current exercise IS the picture dictionary AND custom images were uploaded, use them.
         if (currentExerciseId === pictureDictionaryId && uploadedPictureItems.length > 0) {
             console.log(`Loading CUSTOM picture dictionary (Exercise ID ${currentExerciseId})`);
             const customExerciseData = {
                 id: currentExerciseId, // Use the same ID for consistency
                 type: 'customPictureDictionary', // Special type for custom handling
                 title: `Vocabulary: Custom Picture Dictionary`,
                 instructions: 'Identify the objects in your uploaded images.',
                 pointsPerCorrect: 3, // Or make this configurable?
                 items: uploadedPictureItems, // Use the processed uploaded items
                 set: currentTeam // Assign current team/set to custom data for consistency
             };
             currentExerciseData = customExerciseData; // Set current exercise data
             exercisesContainer.innerHTML = ''; // Clear previous exercise
             renderCustomPictureDictionary(currentExerciseData); // Render custom version
             updateTurnIndicator();
             disableExerciseInputs(currentExerciseId, isPaused); // Set initial disabled state based on pause
             return; // Stop further processing, custom version loaded
         }

         // --- Priority 2: Load Predefined Exercise Data ---
         // Determine which Set to use based on the current team
         const setIndex = currentTeam === 1 ? 0 : 1; // 0 for Team 1 (Set 1), 1 for Team 2 (Set 2)
         console.log(`Loading Exercise ID: ${currentExerciseId}, Team: ${currentTeam}, Set Index: ${setIndex}`);

         exercisesContainer.innerHTML = ''; // Clear previous exercise
         currentExerciseData = null; // Reset current data
         addedSentences = []; // Reset sentences for sentenceBuilder (though not used for 3D now)

         try {
             // Find the correct set
             if (!exerciseData || !exerciseData[setIndex] || !exerciseData[setIndex].exercises) {
                 throw new Error(`Exercise data missing for Set ${setIndex + 1}.`);
             }
             const currentSet = exerciseData[setIndex];

             // Find the exercise within the set by ID
             const foundExercise = currentSet.exercises.find(ex => ex?.id === currentExerciseId);

             if (!foundExercise) {
                 throw new Error(`Exercise ID "${currentExerciseId}" not found in Set ${setIndex + 1}.`);
             }
             if (!foundExercise.type) {
                  throw new Error(`Exercise ID "${currentExerciseId}" in Set ${setIndex + 1} is missing the 'type' property.`);
             }

             // Assign found exercise data to currentExerciseData, adding the set number for context
             currentExerciseData = { ...foundExercise, set: currentSet.set };

             // Render the exercise based on its type
             switch (currentExerciseData.type) {
                 case 'wordScramble': renderWordScramble(currentExerciseData); break;
                 case 'tableFill': renderTableFill(currentExerciseData); break;
                 case 'matching': renderMatching(currentExerciseData); break;
                 case 'sentenceBuilder': renderSentenceBuilder(currentExerciseData); break; // Still here, but won't be called if 3D is fillIn
                 case 'fillIn': renderFillIn(currentExerciseData); break; // *** WILL BE CALLED FOR 3D NOW ***
                 case 'pictureDictionary': renderPictureDictionary(currentExerciseData); break;
                 case 'oppositesMatching': renderOppositesMatching(currentExerciseData); break;
                 case 'dragDropCategorize': renderDragDropCategorize(currentExerciseData); break;
                 case 'customPictureDictionary': renderCustomPictureDictionary(currentExerciseData); break;
                 default:
                     console.error(`Unknown exercise type: ${currentExerciseData.type}`);
                     exercisesContainer.innerHTML = `<div class="exercise"><h2>Unsupported Exercise</h2><p>The exercise type "${currentExerciseData.type}" is not implemented yet.</p></div>`;
                     showNextTurnButton(true); // Allow skipping unimplemented exercises
                     break;
             }

             // Set initial enabled/disabled state based on pause status
             disableExerciseInputs(currentExerciseId, isPaused);
             if (isPaused && pauseOverlay) pauseOverlay.style.display = 'flex'; // Ensure pause overlay is visible if paused

             updateTurnIndicator(); // Update display

         } catch (error) {
             console.error(`Error loading Exercise ${currentExerciseId} (Set ${setIndex + 1}):`, error);
             exercisesContainer.innerHTML = `<div class="exercise"><h2>Error Loading Exercise</h2><p>${error.message}</p></div>`;
             showMessage(`Error loading exercise ${currentExerciseId || ''}. Skipping.`, 'error', 6000);
             showNextTurnButton(true); // Allow skipping the problematic exercise
             currentExerciseData = null; // Ensure no data is held for the failed exercise
         }
     }

    function disableExerciseInputs(exerciseId, shouldBeDisabled) {
        if (!exerciseId) return;
        const exerciseDiv = document.getElementById(`exercise-${exerciseId}`);
        if (!exerciseDiv) {
             // console.warn(`Cannot find exercise container #exercise-${exerciseId} to disable/enable inputs.`);
            return;
        }
        const isSubmitted = exerciseDiv.dataset && exerciseDiv.dataset.submitted === 'true';
        const enforceDisable = shouldBeDisabled || isSubmitted;

        // Select all potentially interactive elements within the specific exercise div
        const interactiveElements = exerciseDiv.querySelectorAll(
            'input, button, select, textarea, [tabindex="0"], .hint, .word-item, .draggable-word'
        );

        interactiveElements.forEach((el) => {
            // Skip elements in the main header or the global next turn button
            if (el.closest('#game-header') || el.classList.contains('next-turn-btn')) {
                return;
            }

            // Handle standard form elements
            if (el.tagName === 'INPUT' || el.tagName === 'BUTTON' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                if (enforceDisable) {
                    el.setAttribute('disabled', '');
                } else {
                    // Only re-enable if it wasn't disabled by a submit click
                    if (!el.hasAttribute('data-submit-clicked')) {
                         el.removeAttribute('disabled');
                    }
                }
            }
            // Handle elements made interactive via tabindex (like hints, clickable words)
            else if (el.hasAttribute('tabindex') || el.classList.contains('word-item')) {
                if (enforceDisable) {
                    el.setAttribute('tabindex', '-1'); // Remove from tab order
                    el.style.pointerEvents = 'none'; // Prevent mouse interaction
                    el.style.opacity = '0.6'; // Visual cue
                } else {
                     // Only re-enable if not permanently disabled (e.g., matched word)
                     if(!el.classList.contains('matched')) {
                        el.setAttribute('tabindex', '0'); // Restore tab order
                        el.style.pointerEvents = 'auto'; // Restore mouse interaction
                        el.style.opacity = '1'; // Restore visual
                     }
                }
            }
            // Handle draggable words
            else if (el.classList.contains('draggable-word')) {
                 if (enforceDisable) {
                     el.draggable = false;
                     el.style.cursor = 'not-allowed';
                     el.style.opacity = '0.6';
                 } else {
                     // Only re-enable if it hasn't been successfully placed
                      if (!el.classList.contains('placed')) {
                         el.draggable = true;
                         el.style.cursor = 'grab';
                         el.style.opacity = '1';
                      }
                 }
            }
        });

        // Add/remove a class on the main exercise container for potential global styling
        if (enforceDisable) {
            exerciseDiv.classList.add('exercise-disabled');
        } else {
            exerciseDiv.classList.remove('exercise-disabled');
        }
    }

    function shuffleArray(array) {
        // Fisher-Yates (Knuth) Shuffle Algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    // ========================================
    //      Exercise Rendering & Checking Functions
    // ========================================

    // --- Word Scramble ---
    function renderWordScramble(exercise) {
        console.log("Rendering Word Scramble:", exercise.id);
        if (!exercisesContainer || !exercise?.words) {
             console.error("Word Scramble render failed: Missing container or words data.");
            showNextTurnButton(true); return;
        }
        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        div.classList.add('exercise');

        const title = document.createElement('h2');
        title.textContent = exercise.title?.replace(/^Set \d+:?\s*/, '') || "Word Scramble";
        div.appendChild(title);

        if (exercise.instructions) {
            const p = document.createElement('p');
            p.innerHTML = exercise.instructions.replace(/\n/g, '<br>'); // Support newlines in instructions
            p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
            div.appendChild(p);
        }

        const list = document.createElement('ol');
        list.style.cssText = 'list-style-position: inside; padding-left: 0; display: flex; flex-direction: column; gap: 0.75rem;';
        div.appendChild(list);

        exercise.words.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;';

            const span = document.createElement('span');
            span.textContent = item.scrambled;
            span.style.cssText = 'min-width: 100px; text-align: right; font-style: italic;'; // Style scrambled word

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `ws-input-${exercise.id}-${index}`;
            input.dataset.index = index;
            input.setAttribute('aria-label', `Answer for scrambled word ${item.scrambled}`);
            input.autocomplete = "off";
            input.style.cssText = 'flex-grow: 1; min-width: 120px;';

            li.append(span, input);

            if (item.hint) {
                const hint = document.createElement('span');
                hint.textContent = 'Hint';
                hint.className = 'hint';
                hint.setAttribute('role', 'button');
                hint.tabIndex = 0; // Make focusable
                hint.addEventListener('click', () => showHint(item.hint));
                hint.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showHint(item.hint); } });
                li.appendChild(hint);
            }
            list.appendChild(li);
        });

        const btn = document.createElement('button');
        btn.textContent = 'Submit Answers';
        btn.style.marginTop = '1.5rem';
        btn.addEventListener('click', (e) => {
            e.target.disabled = true; // Disable button after click
            e.target.dataset.submitClicked = 'true'; // Mark as submitted
            // Mark entire exercise as submitted to prevent re-enabling on resume
            try { div.dataset.submitted = 'true'; } catch (err) {}
            disableExerciseInputs(exercise.id, true); // Disable all inputs
            checkWordScrambleAnswers(exercise);
        });
        div.appendChild(btn);
        exercisesContainer.appendChild(div);
    }
    function checkWordScrambleAnswers(exercise) {
        console.log("Checking Word Scramble:", exercise.id);
        const div = exercisesContainer.querySelector(`#exercise-${exercise.id}`);
        if (!div || !exercise?.words) return; // Safety check

        const inputs = div.querySelectorAll('input[type="text"]');
        let correctCount = 0;
        const totalWords = exercise.words.length;

        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            if (isNaN(index) || !exercise.words[index]) {
                input.classList.add('incorrect'); // Mark as incorrect if data is mismatched
                console.warn(`Mismatched input index ${index} for exercise ${exercise.id}`);
                return;
            }
            const correctAnswer = exercise.words[index].answer;
            const userAnswer = input.value;

            input.classList.remove('correct', 'incorrect'); // Reset feedback classes

            if (normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)) {
                input.classList.add('correct');
                correctCount++;
            } else {
                input.classList.add('incorrect');
            }
        });

        const pointsEarned = correctCount * (exercise.pointsPerCorrect || 1);
        updateScore(currentTeam, pointsEarned);
        showMessage(`You got ${correctCount} out of ${totalWords} correct! (+${pointsEarned} points)`,
            correctCount === totalWords ? 'success' : (correctCount > 0 ? 'info' : 'error'));
        showNextTurnButton(); // Show button to proceed
    }

    // --- Table Fill ---
    function renderTableFill(exercise) {
        console.log("Rendering Table Fill:", exercise.id);
         if (!exercisesContainer || !exercise?.items?.length) {
             console.error("Table Fill render failed: Missing container or items data.");
            showNextTurnButton(true); return;
         }
        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        div.classList.add('exercise');

        const title = document.createElement('h2');
        title.textContent = exercise.title?.replace(/^Set \d+:?\s*/, '') || "Complete the Table";
        div.appendChild(title);

        if (exercise.instructions) {
            const p = document.createElement('p');
            p.innerHTML = exercise.instructions.replace(/\n/g, '<br>');
            p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
            div.appendChild(p);
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        table.append(thead, tbody);
        div.appendChild(table);

        // Determine headers from the first item's keys (excluding 'answer')
        const headers = Object.keys(exercise.items[0]).filter(key => key !== 'answer');
        const headerRow = document.createElement('tr');
        headers.forEach(headerKey => {
            const th = document.createElement('th');
            th.textContent = headerKey.charAt(0).toUpperCase() + headerKey.slice(1); // Capitalize header
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Populate table body
        exercise.items.forEach((item, index) => {
            const row = document.createElement('tr');
            let inputIdForRow = null; // To potentially link input to row for feedback

            headers.forEach(key => {
                const td = document.createElement('td');
                if (item[key] !== null && typeof item[key] !== 'undefined') {
                    // If value exists, display it
                    td.textContent = item[key];
                } else {
                    // If value is null/undefined, create an input field
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `tablefill-input-${exercise.id}-${index}-${key}`; // Unique ID
                    input.dataset.index = index; // Store row index
                    input.dataset.key = key; // Store column key (though 'answer' property is primary)
                    input.setAttribute('aria-label', `Missing ${key} for row ${index + 1}`);
                    input.autocomplete = "off";
                    td.appendChild(input);
                    // If this item has an 'answer' property, assume this input is the one to check
                    if (item.hasOwnProperty('answer')) {
                         inputIdForRow = input.id;
                    }
                }
                row.appendChild(td);
            });
            // If an input was created for this row, store its ID on the row for easier access
             if (inputIdForRow) { row.dataset.inputId = inputIdForRow; }
            tbody.appendChild(row);
        });

        const btn = document.createElement('button');
        btn.textContent = 'Submit Table';
        btn.style.marginTop = '1.5rem';
        btn.addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.dataset.submitClicked = 'true';
            try { div.dataset.submitted = 'true'; } catch (err) {}
            disableExerciseInputs(exercise.id, true);
            checkTableFillAnswers(exercise);
        });
        div.appendChild(btn);
        exercisesContainer.appendChild(div);
    }
    function checkTableFillAnswers(exercise) {
        console.log("Checking Table Fill:", exercise.id);
        const div = exercisesContainer.querySelector(`#exercise-${exercise.id}`);
        if (!div || !exercise?.items) return;

        const inputs = div.querySelectorAll('tbody input[type="text"]');
        let correctCount = 0;
        let totalInputsToCheck = 0; // Count inputs corresponding to items with an 'answer'

        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
             // Check if the corresponding item in the data has an 'answer' property
            if (isNaN(index) || !exercise.items[index]?.hasOwnProperty('answer')) {
                // Don't check inputs for rows without an answer defined
                // Could optionally add neutral styling here if needed
                 // console.log(`Skipping input check for index ${index} - no answer defined.`);
                return;
            }

            totalInputsToCheck++; // Increment count of inputs we are checking
            const correctAnswer = exercise.items[index].answer;
            const userAnswer = input.value;

            input.classList.remove('correct', 'incorrect'); // Reset feedback

            // Use updated check logic for potential multiple answers
            let isMatch = false;
            const normalizedUserAnswer = normalizeAnswer(userAnswer, true);

            if (typeof correctAnswer === 'string' && correctAnswer.includes(' / ')) {
                const possibleAnswers = correctAnswer.split(' / ');
                const normalizedPossibleAnswers = possibleAnswers.map(ans => normalizeAnswer(ans, true));
                if (normalizedPossibleAnswers.includes(normalizedUserAnswer)) {
                    isMatch = true;
                }
            } else {
                const normalizedCorrectAnswer = normalizeAnswer(correctAnswer, true);
                if (normalizedUserAnswer === normalizedCorrectAnswer) {
                    isMatch = true;
                }
            }

            if (isMatch) {
                input.classList.add('correct');
                correctCount++;
            } else {
                input.classList.add('incorrect');
            }
        });

        const pointsEarned = correctCount * (exercise.pointsPerCorrect || 1);
        updateScore(currentTeam, pointsEarned);

        if (totalInputsToCheck > 0) {
             showMessage(`You filled ${correctCount} out of ${totalInputsToCheck} correctly! (+${pointsEarned} points)`,
                 correctCount === totalInputsToCheck ? 'success' : (correctCount > 0 ? 'info' : 'error'));
        } else {
             showMessage(`Table submitted.`, 'info'); // Message if no inputs were checked
        }
        showNextTurnButton();
    }

    // --- Matching ---
    function renderMatching(exercise) {
        console.log("Rendering Matching:", exercise.id);
        if (!exercisesContainer || !exercise?.questions?.length || !exercise?.answerOptions?.length) {
            console.error("Matching render failed: Missing container, questions, or options data.");
            showNextTurnButton(true); return;
        }
        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        div.classList.add('exercise');

        const title = document.createElement('h2');
        title.textContent = exercise.title?.replace(/^Set \d+:?\s*/, '') || "Match the Items";
        div.appendChild(title);

        if (exercise.instructions) {
            const p = document.createElement('p');
            p.innerHTML = exercise.instructions.replace(/\n/g, '<br>');
            p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
            div.appendChild(p);
        }

        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';
        div.appendChild(listContainer);

        // Add hint if available
        if(exercise.hint) {
            const hintP = document.createElement('p');
            hintP.innerHTML = `<i>Hint: ${exercise.hint}</i>`;
            hintP.style.cssText = 'font-size: 0.85em; color: var(--medium-text-dark); margin-bottom: 1rem;';
            // Insert hint before the list container
            div.insertBefore(hintP, listContainer);
        }

        // Create matching rows
        exercise.questions.forEach((questionItem, index) => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--dark-bg-tertiary); flex-wrap: wrap;'; // Added wrap

            const questionSpan = document.createElement('span');
            questionSpan.textContent = `${index + 1}. ${questionItem.questionText}`;
            questionSpan.style.cssText = 'flex-basis: 40%; min-width: 150px; text-align: right;'; // Ensure minimum width

            const select = document.createElement('select');
            select.id = `matching-select-${exercise.id}-${index}`;
            select.dataset.index = index; // Store question index
             // Correct answerMatch stored for checking (optional, checking logic might not need it here)
             select.dataset.correctAnswer = questionItem.answerMatch;
            select.setAttribute('aria-label', `Select answer for question ${index + 1}`);
            select.style.cssText = 'flex-grow: 1; margin: 0; min-width: 200px;'; // Ensure minimum width

            // Default option
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Select an answer...";
            select.appendChild(defaultOption);

            // Populate options (shuffle for better exercise?)
            // const shuffledOptions = shuffleArray([...exercise.answerOptions]); // Optional shuffle
            exercise.answerOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.id; // Use the answer ID as the value
                option.textContent = `${opt.id}) ${opt.text}`; // Display ID and text
                select.appendChild(option);
            });

            row.append(questionSpan, select);
            listContainer.appendChild(row);
        });
        // Remove border from last item
        if(listContainer.lastChild) listContainer.lastChild.style.borderBottom = 'none';

        const btn = document.createElement('button');
        btn.textContent = 'Submit Matches';
        btn.style.marginTop = '1.5rem';
        btn.addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.dataset.submitClicked = 'true';
            disableExerciseInputs(exercise.id, true);
            checkMatchingAnswers(exercise); // Use the simplified agreement check
        });
        div.appendChild(btn);
        exercisesContainer.appendChild(div);
    }
    function checkMatchingAnswers(exercise) {
         // Simplified Check: Focuses on correct pairing based on answerMatch property
         console.log("Checking Matching (Direct Pair):", exercise.id);
         const div = exercisesContainer.querySelector(`#exercise-${exercise.id}`);
         if (!div || !exercise?.questions) return;

         const selects = Array.from(div.querySelectorAll('select'));
         let correctCount = 0;
         const totalQuestions = exercise.questions.length;
         const usedAnswers = new Set(); // To check for duplicate selections
         let duplicatesFound = false;

         // First pass: check for duplicates
         selects.forEach(select => {
            const selectedValue = select.value;
            if (selectedValue !== "") {
                if (usedAnswers.has(selectedValue)) {
                    duplicatesFound = true;
                }
                usedAnswers.add(selectedValue);
            }
         });

         if (duplicatesFound) {
             showMessage("Error: The same answer was selected more than once. Please select unique answers.", "error", 5000);
         }

         // Second pass: check correctness
         selects.forEach(select => {
             const index = parseInt(select.dataset.index);
             const selectedValue = select.value; // This is the ID of the selected answerOption

             select.classList.remove('correct', 'incorrect'); // Reset feedback

             if (isNaN(index) || !exercise.questions[index]) {
                 select.classList.add('incorrect'); // Invalid index
                 return;
             }

             const correctAnswerId = exercise.questions[index].answerMatch; // The ID this question should match

             if (selectedValue === "") {
                 select.classList.add('incorrect'); // Not answered
             } else if (duplicatesFound && usedAnswers.has(selectedValue)) {
                 // Mark duplicates as incorrect if duplicates were found
                 const selectedCount = Array.from(selects).filter(s => s.value === selectedValue).length;
                 if (selectedCount > 1) {
                     select.classList.add('incorrect');
                 } else if (selectedValue === correctAnswerId) {
                     // This specific one might be correct IF it wasn't a duplicate, but the overall submission is flawed
                     // For simplicity, maybe still mark as correct visually but don't count points if duplicates exist?
                     // Let's mark duplicates as incorrect for clarity.
                     select.classList.add('incorrect');
                 } else {
                     select.classList.add('incorrect');
                 }

             } else if (selectedValue === correctAnswerId) {
                 select.classList.add('correct');
                 // Only count correct if no duplicates were found overall
                 if (!duplicatesFound) {
                    correctCount++;
                 }
             } else {
                 select.classList.add('incorrect');
             }
         });

         const pointsEarned = duplicatesFound ? 0 : correctCount * (exercise.pointsPerCorrect || 1);
         if (!duplicatesFound) {
             updateScore(currentTeam, pointsEarned);
             showMessage(`You matched ${correctCount} out of ${totalQuestions} correctly! (+${pointsEarned} points)`,
                 correctCount === totalQuestions ? 'success' : (correctCount > 0 ? 'info' : 'error'));
         } else {
              showMessage(`Matches submitted, but duplicates were found. 0 points awarded.`, 'error', 6000);
         }

         showNextTurnButton();
     }

    // --- Fill In (UPDATED to handle optional image and list formatting) ---
    function renderFillIn(exercise) {
        console.log("Rendering Fill In:", exercise.id);
        if (!exercisesContainer || !exercise?.items) {
            console.error("Fill In render failed: Missing container or items data.");
            showNextTurnButton(true); return;
        }
        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        div.classList.add('exercise');

        const title = document.createElement('h2');
        title.textContent = exercise.title?.replace(/^Set \d+:?\s*/, '') || "Fill in the Blanks";
        div.appendChild(title);

        if (exercise.instructions) {
            const p = document.createElement('p');
            p.innerHTML = exercise.instructions.replace(/\n/g, '<br>');
            p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
            div.appendChild(p);
        }

        // *** NOVO: Bloco para exibir imagem se imageUrl existir ***
        if (exercise.imageUrl) {
            const imageContainer = document.createElement('div');
            imageContainer.style.textAlign = 'center'; // Centralizar a imagem
            imageContainer.style.marginBottom = '1.5rem'; // Espaço abaixo da imagem

            const img = document.createElement('img');
            img.src = exercise.imageUrl;
            img.alt = exercise.title || "Exercise Image";
            img.className = 'fill-in-image'; // Adiciona classe para estilização CSS
             // Tratamento de erro básico para a imagem
             img.onerror = function() {
                console.error(`Failed to load image for Fill In: ${exercise.imageUrl}`);
                this.alt = `Error loading image: ${exercise.imageUrl}`;
                this.style.border = '2px solid var(--accent-red)';
                // Opcional: mostrar uma mensagem de erro no lugar da imagem
                // imageContainer.innerHTML = `<p style="color: var(--accent-red);">Image not found.</p>`;
            };
            imageContainer.appendChild(img);
            div.appendChild(imageContainer); // Adiciona a imagem ao div principal do exercício
        }
        // *** FIM do bloco da imagem ***

        const list = document.createElement('ol');
        // Ajuste para começar a numeração correta baseada no set e ID do exercício
        const startNumber = (exercise.set === 2 && exercise.id === '3D') ? 3 : 1; // Começa em 3 para o Set 2 do exercício 3D
        list.start = startNumber;
        list.style.cssText = 'list-style-position: inside; padding-left: 0; display: flex; flex-direction: column; gap: 0.5rem;'; // Reduzido gap
        div.appendChild(list);

        // Mantém o controle do número da questão principal (1, 2, 3 ou 4)
        let currentQuestionNumber = 0;
        let firstItemOfQuestion = true;

        exercise.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.cssText = 'line-height: 1.8; margin-left: 20px;'; // Adiciona indentação para sub-itens

            // Extrai o número da questão principal, se houver (ex: "1.", "2.")
            const questionNumberMatch = item.questionText.match(/^(\d+)\.\s*/);
            let textWithoutNumber = item.questionText.trim(); // Remove espaços iniciais/finais

            if (questionNumberMatch) {
                const num = parseInt(questionNumberMatch[1]);
                if (num !== currentQuestionNumber) {
                    currentQuestionNumber = num;
                    textWithoutNumber = item.questionText.substring(questionNumberMatch[0].length).trim();
                    li.style.marginLeft = '0px'; // Sem indentação para o primeiro item de uma nova questão
                    li.style.marginTop = '0.5rem'; // Espaço antes de uma nova questão principal
                    li.style.listStyleType = 'decimal'; // Garante que o número seja mostrado pelo OL
                    firstItemOfQuestion = true;
                     // Define o valor explícito para o LI para garantir a numeração correta
                    li.value = currentQuestionNumber;
                } else {
                     textWithoutNumber = item.questionText.substring(questionNumberMatch[0].length).trim(); // Remove número se for continuação
                     li.style.listStyleType = 'none'; // Continuação não tem número
                     firstItemOfQuestion = false;
                }
            } else {
                // Se não começar com número (ex: "She is..."), trata como continuação
                textWithoutNumber = item.questionText.trim();
                 li.style.listStyleType = 'none';
                 firstItemOfQuestion = false;
            }

            // Split text by the placeholder '...'
            const parts = textWithoutNumber.split('...');

            // Add the text before the blank
            if (parts[0]) {
                li.appendChild(document.createTextNode(parts[0]));
            }

            // Add the input field
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `fillin-input-${exercise.id}-${index}`;
            input.dataset.index = index;
            // Aria-label mais descritivo
            input.setAttribute('aria-label', `Fill in blank for question ${currentQuestionNumber}, item ${index + 1}`);
            input.autocomplete = "off";
            input.style.cssText = `
                min-width: ${item.isSuffix ? '30px' : '80px'};
                max-width: ${item.isSuffix ? '50px' : '150px'};
                margin: 0 4px;
                padding: 4px 8px;
                vertical-align: baseline;
                height: auto;
                min-height: auto;
            `;
             if (item.isSuffix) {
                 input.style.textAlign = 'center';
             }
            li.appendChild(input);

            // Add the text after the blank (if any)
            if (parts.length > 1 && parts[1]) {
                li.appendChild(document.createTextNode(parts[1]));
            }

             // Add hint only once per exercise, if available and it's the first actual list item being added
             if (exercise.hint && index === 0) {
                 const hintSpan = document.createElement('span');
                 hintSpan.textContent = 'Hint';
                 hintSpan.className = 'hint';
                 hintSpan.style.marginLeft = '10px';
                 hintSpan.setAttribute('role', 'button');
                 hintSpan.tabIndex = 0;
                 hintSpan.addEventListener('click', () => showHint(exercise.hint));
                 hintSpan.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showHint(exercise.hint); } });
                 // Adiciona o hint após o conteúdo da linha
                 li.appendChild(hintSpan);
             }

            list.appendChild(li);
        });

        const btn = document.createElement('button');
        btn.textContent = 'Submit Blanks';
        btn.style.marginTop = '1.5rem';
        btn.addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.dataset.submitClicked = 'true';
            try { div.dataset.submitted = 'true'; } catch (err) {}
            disableExerciseInputs(exercise.id, true);
            checkFillInAnswer(exercise); // *** Chama a função atualizada ***
        });
        div.appendChild(btn);
        exercisesContainer.appendChild(div);
    }

    // --- Check Fill In (UPDATED to handle multiple answers) ---
    function checkFillInAnswer(exercise) {
        console.log("Checking Fill In:", exercise.id);
        const div = exercisesContainer.querySelector(`#exercise-${exercise.id}`);
        if (!div || !exercise?.items) return;

        const inputs = div.querySelectorAll('input[type="text"]');
        let correctCount = 0;
        const totalBlanks = exercise.items.length;

        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            if (isNaN(index) || !exercise.items[index]) {
                input.classList.add('incorrect');
                 console.warn(`Mismatched fill-in index ${index} for exercise ${exercise.id}`);
                return;
            }

            const correctAnswerData = exercise.items[index].answer; // Pode ser string ou string com "/"
            const userAnswer = input.value;
            const normalizedUserAnswer = normalizeAnswer(userAnswer, true); // Normaliza resposta do usuário, preservando 's

            input.classList.remove('correct', 'incorrect'); // Reseta feedback

            let isMatch = false;

            // Verifica se a resposta correta tem múltiplas opções (contém " / ")
            if (typeof correctAnswerData === 'string' && correctAnswerData.includes(' / ')) {
                const possibleAnswers = correctAnswerData.split(' / '); // Cria array de opções
                // Normaliza cada opção e verifica se a resposta do usuário está entre elas
                const normalizedPossibleAnswers = possibleAnswers.map(ans => normalizeAnswer(ans, true));
                if (normalizedPossibleAnswers.includes(normalizedUserAnswer)) {
                    isMatch = true;
                }
            } else {
                // Se for uma única resposta, compara diretamente
                const normalizedCorrectAnswer = normalizeAnswer(correctAnswerData, true);
                if (normalizedUserAnswer === normalizedCorrectAnswer) {
                    isMatch = true;
                }
            }

            // Aplica feedback e conta pontos
            if (isMatch) {
                input.classList.add('correct');
                correctCount++;
            } else {
                input.classList.add('incorrect');
            }
        });

        const pointsEarned = correctCount * (exercise.pointsPerCorrect || 1);
        updateScore(currentTeam, pointsEarned);
        showMessage(`You filled ${correctCount} out of ${totalBlanks} blanks correctly! (+${pointsEarned} points)`,
            correctCount === totalBlanks ? 'success' : (correctCount > 0 ? 'info' : 'error'));
        showNextTurnButton();
    }


    // --- Picture Dictionary (NEW - Handles imageUrl) ---
    function renderPictureDictionary(exercise) {
        console.log(`Rendering Picture Dictionary (imageUrl based): ${exercise.id}`);
        if (!exercisesContainer || !exercise?.items?.length) {
            console.error("Picture Dictionary render failed: Missing container or items data.");
            showNextTurnButton(true); return;
        }

        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        div.classList.add('exercise');

        const title = document.createElement('h2');
        title.textContent = exercise.title?.replace(/^Set \d+:?\s*/, '') || "Picture Dictionary";
        div.appendChild(title);

        if (exercise.instructions) {
            const p = document.createElement('p');
            p.innerHTML = exercise.instructions.replace(/\n/g, '<br>');
            p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
            div.appendChild(p);
        }

        // Use the grid container class from style.css
        const gridContainer = document.createElement('div');
        gridContainer.className = 'picture-dictionary-grid'; // Class defined in CSS
        div.appendChild(gridContainer);

        exercise.items.forEach((item, index) => {
            // Use the item container class from style.css
            const itemContainer = document.createElement('div');
            itemContainer.className = 'picture-item-container'; // Class defined in CSS

            const img = document.createElement('img');
            img.src = item.imageUrl; // Use imageUrl from exerciseData.js
            img.alt = `Image for item ${item.placeholder || index + 1}`;
            // Add error handling for broken image links
            img.onerror = function() {
                console.error(`Failed to load image: ${item.imageUrl}`);
                this.alt = `Error loading image: ${item.imageUrl}`;
                // Optionally display placeholder or error message
                this.style.border = '2px solid var(--accent-red)';
                 const errorText = document.createElement('p');
                 errorText.textContent = 'Image not found';
                 errorText.style.fontSize = '0.8em';
                 errorText.style.color = 'var(--accent-red)';
                 // Insert error before input if input exists
                 const inputField = itemContainer.querySelector('input');
                 if (inputField) itemContainer.insertBefore(errorText, inputField);
                 else itemContainer.appendChild(errorText); // Append if input not found (shouldn't happen here)
            };

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `picdict-input-${exercise.id}-${index}`;
            input.dataset.index = index;
            input.placeholder = item.placeholder || `Answer ${index + 1}...`;
            input.setAttribute('aria-label', `Answer for image ${index + 1}`);
            input.autocomplete = "off";
            // Styling for input is primarily handled by CSS via .picture-item-container input

            itemContainer.append(img, input);
            gridContainer.appendChild(itemContainer);
        });

         // Add hint if available
         if(exercise.hint) {
            const hintP = document.createElement('p');
            hintP.innerHTML = `<i>Hint: ${exercise.hint}</i>`;
            hintP.style.cssText = 'font-size: 0.85em; color: var(--medium-text-dark); margin-top: 1rem;'; // Added margin-top
             // Insert hint after the grid, before the button
            div.appendChild(hintP);
        }


        const btn = document.createElement('button');
        btn.textContent = 'Submit Identifications';
        btn.style.marginTop = '1.5rem';
        btn.addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.dataset.submitClicked = 'true';
            try { div.dataset.submitted = 'true'; } catch (err) {}
            disableExerciseInputs(exercise.id, true);
            checkPictureDictionaryAnswers(exercise); // Call the corresponding check function
        });
        div.appendChild(btn); // Append button after hint if hint exists

        exercisesContainer.appendChild(div);
    }
    // --- Check Picture Dictionary (NEW - Handles imageUrl based exercise) ---
    function checkPictureDictionaryAnswers(exercise) {
        console.log("Checking Picture Dictionary (imageUrl based):", exercise.id);
        const div = exercisesContainer.querySelector(`#exercise-${exercise.id}`);
         if (!div || !exercise?.items) {
             console.error("Cannot check picture dictionary - missing container or items.");
             showNextTurnButton(); // Allow skipping if checking fails
             return;
         }

        const inputs = div.querySelectorAll('input[type="text"]');
        let correctCount = 0;
        const totalItems = exercise.items.length;

        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
             const itemContainer = input.closest('.picture-item-container'); // Get the parent container

            if (isNaN(index) || !exercise.items[index] || !itemContainer) {
                 if(input) input.classList.add('incorrect');
                 if(itemContainer) itemContainer.classList.add('incorrect'); // Add feedback to container too
                 console.warn(`Mismatched picture dictionary index ${index} or missing container for exercise ${exercise.id}`);
                return;
            }

            const correctAnswer = exercise.items[index].answer;
            const userAnswer = input.value;

            // Reset feedback classes on both input and container
            input.classList.remove('correct', 'incorrect');
            itemContainer.classList.remove('correct', 'incorrect');

            if (normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)) {
                input.classList.add('correct');
                itemContainer.classList.add('correct'); // Add success feedback to container
                correctCount++;
            } else {
                input.classList.add('incorrect');
                itemContainer.classList.add('incorrect'); // Add error feedback to container
            }
        });

        const pointsEarned = correctCount * (exercise.pointsPerCorrect || 3); // Default points = 3?
        updateScore(currentTeam, pointsEarned);
        showMessage(`You identified ${correctCount} out of ${totalItems} items correctly! (+${pointsEarned} points)`,
            correctCount === totalItems ? 'success' : (correctCount > 0 ? 'info' : 'error'));
        showNextTurnButton();
    }

    // --- Custom Picture Dictionary (Handles Data URLs from upload) ---
    function renderCustomPictureDictionary(exercise) {
        console.log("Rendering CUSTOM Picture Dictionary:", exercise.id);
         if (!exercisesContainer || !exercise?.items?.length) {
            console.error("Custom Picture Dictionary render failed: Missing container or items data.");
            showNextTurnButton(true); return;
         }
        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        // Add specific class for custom version if needed for styling/selection
        div.classList.add('exercise', 'exercise-custom-picture-dict');

        const title = document.createElement('h2');
        title.textContent = exercise.title || "Identify Your Pictures";
        div.appendChild(title);

        if (exercise.instructions) {
            const p = document.createElement('p');
            p.innerHTML = exercise.instructions.replace(/\n/g, '<br>');
            p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
            div.appendChild(p);
        }

        // Use the same grid container class for consistency
        const gridContainer = document.createElement('div');
        gridContainer.className = 'picture-dictionary-grid';
        div.appendChild(gridContainer);

        exercise.items.forEach((item, index) => {
            // Use the same item container class
            const itemContainer = document.createElement('div');
            itemContainer.className = 'picture-item-container';

            const img = document.createElement('img');
            img.src = item.imageDataUrl; // Use the Data URL stored during upload
            img.alt = `Custom image ${index + 1}`;
             img.onerror = function() {
                console.error(`Failed to load custom image data URL (index ${index}).`);
                this.alt = `Error loading custom image ${index + 1}`;
                this.style.border = '2px solid var(--accent-red)';
                 const errorText = document.createElement('p');
                 errorText.textContent = 'Image error';
                 errorText.style.fontSize = '0.8em';
                 errorText.style.color = 'var(--accent-red)';
                 const inputField = itemContainer.querySelector('input');
                 if (inputField) itemContainer.insertBefore(errorText, inputField);
                 else itemContainer.appendChild(errorText);
            };


            const input = document.createElement('input');
            input.type = 'text';
            input.id = `custom-pic-input-${exercise.id}-${index}`;
            input.dataset.index = index;
            input.placeholder = `Answer ${index + 1}...`;
            input.setAttribute('aria-label', `Answer for custom image ${index + 1}`);
            input.autocomplete = "off";

            itemContainer.append(img, input);
            gridContainer.appendChild(itemContainer);
        });

        const btn = document.createElement('button');
        btn.textContent = 'Submit Identifications';
        btn.style.marginTop = '1.5rem';
        div.appendChild(btn); // Append button after grid

        btn.addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.dataset.submitClicked = 'true';
            try {
                const container = document.getElementById(`exercise-${exercise.id}`);
                if (container) container.dataset.submitted = 'true';
            } catch (err) {}
            disableExerciseInputs(exercise.id, true);
            checkCustomPictureDictionary(exercise); // Call the specific check function
        });

        exercisesContainer.appendChild(div);
    }
    function checkCustomPictureDictionary(exercise) {
        console.log("Checking CUSTOM Picture Dictionary:", exercise.id);
        const div = exercisesContainer.querySelector(`#exercise-${exercise.id}`);
        if (!div || !exercise?.items) return;

        const inputs = div.querySelectorAll('input[type="text"]');
        let correctCount = 0;
        const totalItems = exercise.items.length;

        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const itemContainer = input.closest('.picture-item-container');

            if (isNaN(index) || !exercise.items[index] || !itemContainer) {
                 if(input) input.classList.add('incorrect');
                 if(itemContainer) itemContainer.classList.add('incorrect');
                return;
            }
            const correctAnswer = exercise.items[index].answer;
            const userAnswer = input.value;

            input.classList.remove('correct', 'incorrect');
            itemContainer.classList.remove('correct', 'incorrect');

            if (normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)) {
                input.classList.add('correct');
                itemContainer.classList.add('correct');
                correctCount++;
            } else {
                input.classList.add('incorrect');
                itemContainer.classList.add('incorrect');
            }
        });

        const pointsEarned = correctCount * (exercise.pointsPerCorrect || 3); // Use points from data
        updateScore(currentTeam, pointsEarned);
        showMessage(`You identified ${correctCount} out of ${totalItems} custom items correctly! (+${pointsEarned} points)`,
            correctCount === totalItems ? 'success' : (correctCount > 0 ? 'info' : 'error'));
        showNextTurnButton();
    }

    // --- Opposites Matching ---
    function renderOppositesMatching(exercise) {
        console.log("Rendering Opposites Matching:", exercise.id);
        if (!exercisesContainer || typeof exercise?.pairs !== 'object' || Object.keys(exercise.pairs).length === 0) {
             console.error("Opposites Matching render failed: Missing container or valid pairs data.");
            showNextTurnButton(true); return;
        }
        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        div.classList.add('exercise');

        const title = document.createElement('h2');
        title.textContent = exercise.title?.replace(/^Set \d+:?\s*/, '') || "Match the Opposites";
        div.appendChild(title);

        if (exercise.instructions) {
            const p = document.createElement('p');
            p.innerHTML = exercise.instructions.replace(/\n/g, '<br>');
            p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
            div.appendChild(p);
        }

        // State variables for matching logic, scoped to this render function
        let selectedCol1 = { element: null, word: null };
        let matchedPairCount = 0;
        const totalPairs = Object.keys(exercise.pairs).length;

        // Prepare words for columns
        const column1Words = shuffleArray(Object.keys(exercise.pairs)); // Shuffle column 1
        const column2Words = shuffleArray(Object.values(exercise.pairs)); // Shuffle column 2

        const columnsContainer = document.createElement('div');
        columnsContainer.className = 'opposites-matching-container'; // Use class from CSS
        div.appendChild(columnsContainer);

        const column1Div = document.createElement('div');
        column1Div.className = 'opposites-column'; // Use class from CSS
        const column2Div = document.createElement('div');
        column2Div.className = 'opposites-column'; // Use class from CSS
        columnsContainer.append(column1Div, column2Div);

        // Helper to create word divs
        function createWordDiv(word, columnClass, clickHandler) {
            const wordDiv = document.createElement('div');
            wordDiv.className = `word-item ${columnClass}`; // Use class from CSS
            wordDiv.textContent = word;
            wordDiv.dataset.word = word; // Store the word itself
            wordDiv.tabIndex = 0; // Make focusable
            wordDiv.setAttribute('role', 'button');
            wordDiv.addEventListener('click', clickHandler);
            wordDiv.addEventListener('keydown', (e) => {
                if(e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Prevent page scroll on space
                    clickHandler(e);
                }
            });
            return wordDiv;
        }

        // Populate columns
        column1Words.forEach(word => column1Div.appendChild(createWordDiv(word, 'column-1-item', handleCol1Click)));
        column2Words.forEach(word => column2Div.appendChild(createWordDiv(word, 'column-2-item', handleCol2Click)));

         // Add hint if available
         if(exercise.hint) {
            const hintP = document.createElement('p');
            hintP.innerHTML = `<i>Hint: ${exercise.hint}</i>`;
            hintP.style.cssText = 'font-size: 0.85em; color: var(--medium-text-dark); margin-top: 1.5rem; text-align: center;';
            div.appendChild(hintP); // Append hint after the columns
        }

        exercisesContainer.appendChild(div);

        // Click handler for column 1 items
        function handleCol1Click(event) {
            const clickedElement = event.target;
            if (clickedElement.classList.contains('matched')) return; // Ignore already matched

            // Deselect previous selection in column 1
            if (selectedCol1.element && selectedCol1.element !== clickedElement) {
                selectedCol1.element.classList.remove('selected');
            }
            // Select the new element
            clickedElement.classList.add('selected');
            selectedCol1 = { element: clickedElement, word: clickedElement.dataset.word };
        }

        // Click handler for column 2 items
        function handleCol2Click(event) {
            const clickedElement = event.target;
            if (clickedElement.classList.contains('matched') || !selectedCol1.element) {
                // If no word selected in col 1, show message and return
                if (!selectedCol1.element) {
                     showMessage("Please select a word from the first column first.", "error", 2000);
                }
                return; // Ignore if already matched or no selection in col 1
            }

            const selectedCol2Word = clickedElement.dataset.word;
            const correctOppositeForCol1 = exercise.pairs[selectedCol1.word]; // Find the correct opposite

            if (correctOppositeForCol1 === selectedCol2Word) {
                // --- Correct Match ---
                selectedCol1.element.classList.remove('selected');
                selectedCol1.element.classList.add('matched'); // Mark as matched
                clickedElement.classList.add('matched'); // Mark as matched

                // Make matched items non-interactive
                selectedCol1.element.style.pointerEvents = 'none';
                selectedCol1.element.tabIndex = -1;
                clickedElement.style.pointerEvents = 'none';
                clickedElement.tabIndex = -1;

                matchedPairCount++;
                const pointsPerPair = exercise.pointsPerCorrect || 1; // Points per correct pair
                updateScore(currentTeam, pointsPerPair);
                showMessage(`Correct match! (+${pointsPerPair} points)`, 'success', 1500);

                // Check if all pairs are matched
                if (matchedPairCount === totalPairs) {
                    // Use timeout to allow the last success message to be seen
                    setTimeout(() => showNextTurnButton(), 1600);
                }
            } else {
                // --- Incorrect Match ---
                showMessage(`'${selectedCol1.word}' and '${selectedCol2Word}' are not opposites. Try again.`, 'error', 2500);
                // Flash effect for incorrect attempt
                selectedCol1.element.classList.add('incorrect-flash');
                clickedElement.classList.add('incorrect-flash');
                // Store element reference as selectedCol1 will be reset
                const col1ElementToFlash = selectedCol1.element;
                // Remove flash and selection after a short delay
                setTimeout(() => {
                    col1ElementToFlash.classList.remove('selected', 'incorrect-flash');
                    clickedElement.classList.remove('incorrect-flash');
                }, 500); // Duration should match CSS animation
            }

            // Reset selection in column 1 after any attempt (correct or incorrect)
            selectedCol1 = { element: null, word: null };
        }
    } // --- End renderOppositesMatching ---


     // --- Drag & Drop Categorize ---
     function renderDragDropCategorize(exercise) {
         console.log("Rendering Drag & Drop Categorize:", exercise.id);
         if (!exercisesContainer || !exercise?.itemsToDrag?.length || !exercise?.categories?.length) {
             console.error("Drag & Drop render failed: Missing container, items, or categories data.");
             showNextTurnButton(true); return;
         }
         const div = document.createElement('div');
         div.id = `exercise-${exercise.id}`;
         div.classList.add('exercise');

         const title = document.createElement('h2');
         title.textContent = exercise.title?.replace(/^Set \d+:?\s*/, '') || "Categorize Items";
         div.appendChild(title);

         if (exercise.instructions) {
             const p = document.createElement('p');
             p.innerHTML = exercise.instructions.replace(/\n/g, '<br>');
             p.style.cssText = 'font-size: 0.9em; color: var(--light-text-secondary); margin-bottom: 1rem;';
             div.appendChild(p);
         }

         // Main container for drag-drop elements
         const dragDropContainer = document.createElement('div');
         dragDropContainer.className = 'drag-drop-container'; // Use class from CSS
         div.appendChild(dragDropContainer);

         // Word Bank (Source of draggable items)
         const wordBank = document.createElement('div');
         wordBank.className = 'word-bank'; // Use class from CSS
         wordBank.id = `word-bank-${exercise.id}`;
         const bankTitle = document.createElement('h4');
         bankTitle.textContent = 'Words to Categorize:';
         wordBank.appendChild(bankTitle);
         dragDropContainer.appendChild(wordBank);

         // Create draggable word elements
         shuffleArray(exercise.itemsToDrag).forEach((word, index) => { // Shuffle items in bank
             const wordDiv = document.createElement('div');
             wordDiv.id = `drag-word-${exercise.id}-${index}`; // Unique ID
             wordDiv.className = 'draggable-word'; // Use class from CSS
             wordDiv.textContent = word;
             wordDiv.draggable = true;
             wordDiv.dataset.word = word; // Store the word data

             // Add drag event listeners
             wordDiv.addEventListener('dragstart', handleDragStart);
             wordDiv.addEventListener('dragend', handleDragEnd);
             wordBank.appendChild(wordDiv);
         });

         // Category Drop Zones Container
         const categoryZonesContainer = document.createElement('div');
         categoryZonesContainer.className = 'category-zones-container'; // Use class from CSS
         dragDropContainer.appendChild(categoryZonesContainer);

         // State variable for tracking placed items
         let placedItemCount = 0;
         const totalItemsToPlace = exercise.itemsToDrag.length;

         // Create category drop zone elements
         exercise.categories.forEach(category => {
             const zoneDiv = document.createElement('div');
             zoneDiv.className = 'category-drop-zone'; // Use class from CSS
             zoneDiv.dataset.categoryId = category.id; // Store category ID

             const categoryTitle = document.createElement('h4');
             categoryTitle.textContent = category.name;
             zoneDiv.appendChild(categoryTitle);

             // Container within the zone to hold dropped items
             const droppedItemsList = document.createElement('div');
             droppedItemsList.className = 'dropped-items-list'; // Use class from CSS
             zoneDiv.appendChild(droppedItemsList);

             // Add drop event listeners to the zone
             zoneDiv.addEventListener('dragover', handleDragOver);
             zoneDiv.addEventListener('dragenter', handleDragEnter);
             zoneDiv.addEventListener('dragleave', handleDragLeave);
             zoneDiv.addEventListener('drop', handleDrop);

             categoryZonesContainer.appendChild(zoneDiv);
         });

          // Add hint if available
          if(exercise.hint) {
             const hintP = document.createElement('p');
             hintP.innerHTML = `<i>Hint: ${exercise.hint}</i>`;
             hintP.style.cssText = 'font-size: 0.85em; color: var(--medium-text-dark); margin-top: 1.5rem; text-align: center;';
             // Append hint after category zones
             dragDropContainer.appendChild(hintP);
         }

         exercisesContainer.appendChild(div);

         // --- Drag and Drop Event Handlers ---
         function handleDragStart(event) {
             draggedItemId = event.target.id; // Store ID of dragged item
             // Use word data for transfer (more robust than relying on textContent)
             event.dataTransfer.setData('text/plain', event.target.dataset.word);
             event.dataTransfer.effectAllowed = 'move';
             // Add visual feedback slightly delayed
             setTimeout(() => event.target.classList.add('dragging'), 0);
         }

         function handleDragEnd(event) {
             // Remove dragging class regardless of drop result
             event.target.classList.remove('dragging');
             draggedItemId = null; // Clear dragged item ID
             // Clean up any lingering drag-over styles
             document.querySelectorAll('.category-drop-zone.drag-over').forEach(zone => zone.classList.remove('drag-over'));
         }

         function handleDragOver(event) {
             event.preventDefault(); // Necessary to allow dropping
             event.dataTransfer.dropEffect = 'move';
         }

         function handleDragEnter(event) {
             // Add visual feedback when dragging over a valid drop zone
             if (event.target.classList.contains('category-drop-zone')) {
                 event.target.classList.add('drag-over');
             }
         }

         function handleDragLeave(event) {
             // Remove visual feedback when leaving a drop zone
             if (event.target.classList.contains('category-drop-zone')) {
                 event.target.classList.remove('drag-over');
             }
         }

         function handleDrop(event) {
             event.preventDefault(); // Prevent default browser handling
             const dropZone = event.currentTarget; // The .category-drop-zone div
             dropZone.classList.remove('drag-over'); // Remove visual feedback

             if (!draggedItemId) return; // Exit if no item was being dragged

             const draggedWord = event.dataTransfer.getData('text/plain');
             const targetCategoryId = dropZone.dataset.categoryId;
             const draggedElement = document.getElementById(draggedItemId); // Get the original element

             if (!draggedElement || !draggedWord || !targetCategoryId) {
                  console.error("Drop failed: Missing data (element, word, or category ID).");
                  return;
             }

             // Find the category data object
             const targetCategory = exercise.categories.find(cat => cat.id === targetCategoryId);
             if (!targetCategory) {
                  console.error(`Drop failed: Could not find category data for ID ${targetCategoryId}.`);
                  return;
             }

             // Check if the dropped word belongs to the target category
             if (targetCategory.correctItems.includes(draggedWord)) {
                 // --- Correct Drop ---
                 const droppedListContainer = dropZone.querySelector('.dropped-items-list');
                 if (droppedListContainer) {
                     draggedElement.classList.remove('dragging');
                     draggedElement.classList.add('placed'); // Style as placed
                     draggedElement.draggable = false; // Make non-draggable
                      // Move element visually - append to target list
                     droppedListContainer.appendChild(draggedElement);

                     placedItemCount++;
                     const pointsPerItem = exercise.pointsPerCorrect || 1;
                     updateScore(currentTeam, pointsPerItem);
                     showMessage(`'${draggedWord}' placed correctly! (+${pointsPerItem} points)`, 'success', 1500);

                     // Check if all items are placed
                     if (placedItemCount === totalItemsToPlace) {
                         setTimeout(() => showNextTurnButton(), 1600); // Show next turn button after short delay
                     }
                 }
             } else {
                 // --- Incorrect Drop ---
                 showMessage(`'${draggedWord}' does not belong in the '${targetCategory.name}' category.`, 'error', 2000);
                 // Add shake animation/feedback to the drop zone
                 dropZone.classList.add('drop-incorrect'); // Trigger CSS animation/style
                 // Remove the feedback class after animation ends
                 setTimeout(() => dropZone.classList.remove('drop-incorrect'), 300); // Match CSS animation duration
                 // The dragged element remains in the word bank (or wherever it was dragged from)
             }
             // Clear dragged item ID after processing the drop
             draggedItemId = null;
         } // --- End handleDrop ---

     } // --- End renderDragDropCategorize ---

    // --- Sentence Builder (Still present, but exercise 3D is now 'fillIn') ---
    function renderSentenceBuilder(exercise) {
        // This function will now only be called if you manually change
        // an exercise type back to 'sentenceBuilder' in exerciseData.js
        console.log(`Rendering Sentence Builder (ID: ${exercise.id}) - Note: This type might not be used currently.`);
        if (!exercisesContainer || !exercise?.people1Options || !exercise?.people2Options || !exercise?.relationshipOptions || !exercise?.treeId) {
            console.error("Sentence Builder render failed: Missing container or required data (options, treeId).");
            exercisesContainer.innerHTML = `<div id="exercise-${exercise.id}" class="exercise"><h2>${exercise.title?.replace(/^Set \\d+:?\\s*/, '') || 'Sentence Builder'} (Error)</h2><p style="color: var(--accent-red); margin: 1rem 0;">Error loading data for this exercise.</p></div>`;
            showNextTurnButton(true);
            return;
        }
        const div = document.createElement('div');
        div.id = `exercise-${exercise.id}`;
        div.classList.add('exercise');
        const title = document.createElement('h2');
        title.textContent = exercise.title?.replace(/^Set \\d+:?\\s*/, '') || "Sentence Builder";
        div.appendChild(title);
        if (exercise.instructions) { /* ... (rest of the rendering logic) ... */ }
        // ... (rest of the original renderSentenceBuilder code from previous steps) ...
         // Add placeholder message if SVG logic or other parts fail inside
         div.innerHTML += `<p>Sentence builder content should appear here.</p>`;
        exercisesContainer.appendChild(div);
         // Always show skip for this as it's effectively deprecated by the fillIn change for 3D
         showNextTurnButton(true);
    }
    // Helper function to add constructed sentence to the list (Still present)
    function addSentenceToList(exerciseId) { /* ... (original code) ... */ }
    // Check Sentence Builder (Still present)
    function checkSentenceBuilderAnswer(exercise) { /* ... (original code) ... */ }


    // ========================================
    //          Utility: Message Box & Helpers
    // ========================================
    function showHint(hintText) {
        if (!hintText) return;
        showMessage(`Hint: ${hintText}`, 'info', 5000); // Show hint as an info message
    }

    function showNextTurnButton(isErrorOrSkip = false) {
        console.log(`showNextTurnButton called. isErrorOrSkip = ${isErrorOrSkip}`);
        if (!globalNextTurnArea) {
            console.error("Cannot show next turn button: globalNextTurnArea element not found.");
            return;
        }
        globalNextTurnArea.innerHTML = ''; // Clear previous button

        const btn = document.createElement('button');
        btn.textContent = isErrorOrSkip ? 'Continue / Skip' : 'Next Turn';
        btn.classList.add('next-turn-btn');
        btn.id = 'global-next-turn-button';

        // Add event listener to switch turn when clicked
        btn.addEventListener('click', () => {
             console.log("Next Turn Button Clicked!");
             btn.disabled = true;
             btn.textContent = 'Loading...';
            switchTurn();
        });

        globalNextTurnArea.append(btn);
        globalNextTurnArea.style.display = 'block';
        console.log("Next Turn Button added to DOM.");
        try {
             btn.focus();
             console.log("Focus set on Next Turn Button.");
        } catch(e) {
            console.warn("Could not set focus on next turn button:", e);
        }
    }

    function updateScore(teamIndex, pointsToAdd) {
        if (pointsToAdd === 0) return; // No change needed

        if (teamIndex === 1) {
            team1Score += pointsToAdd;
        } else if (teamIndex === 2) {
            team2Score += pointsToAdd;
        } else {
             console.warn(`Invalid team index ${teamIndex} for score update.`);
            return; // Invalid team index
        }
        updateScoreboardDisplay(); // Update the visual scoreboard
    }

    function showMessage(text, type = 'info', duration = 3000) {
        if (!messageBox) return; // Exit if message box element doesn't exist

        // Clear existing timeout if a message is already showing
        if (messageTimeout) { clearTimeout(messageTimeout); }

        messageBox.textContent = text;
        // Reset classes and add the new type + 'show'. Base styles come from #message-box in CSS.
        messageBox.className = '';
        messageBox.classList.add(type, 'show');

        // Set timeout to hide the message after duration
        messageTimeout = setTimeout(() => {
            messageBox.classList.remove('show');
            messageTimeout = null; // Clear timeout ID
        }, duration);
    }

    function normalizeAnswer(str, preserveApostropheS = false) {
        // Converts to string, trims whitespace, converts to lowercase
        // Handles null/undefined inputs gracefully.
        if (typeof str !== 'string') return '';
        let normalized = str.trim().toLowerCase();
        // Special handling for possessive 's if requested
        if (preserveApostropheS) {
            // Example: " James's " -> "james's"
            // Example: " james 's " -> "james's"
             // Makes sure there's no space before 's
            normalized = normalized.replace(/\s*'\s*s$/, "'s");
        }
        return normalized;
    }


    // ========================================
    //          Teacher Mode (Basic Functionality)
    // ========================================
    function toggleTeacherMode() {
        isTeacherMode = !isTeacherMode;
        console.log(`Teacher Mode toggled: ${isTeacherMode}`);

        if(teacherModeBtn) teacherModeBtn.classList.toggle('active', isTeacherMode);
        if(teacherExerciseSelect) teacherExerciseSelect.style.display = isTeacherMode ? 'inline-block' : 'none';
        if(teacherSwapSetBtn) teacherSwapSetBtn.style.display = isTeacherMode ? 'inline-block' : 'none';

        if (isTeacherMode) {
             // Entering Teacher Mode
            populateTeacherExerciseSelect(); // Fill dropdown
            if (!isPaused) togglePause(); // Pause the game timer
             if(turnIndicator) turnIndicator.classList.add('teacher-mode');
             updateTurnIndicator(); // Show Teacher Mode status
             if (currentExerciseData) disableExerciseInputs(currentExerciseData.id, true); // Disable currently viewed exercise if any
             else if (currentExerciseId) disableExerciseInputs(currentExerciseId, true); // Disable game exercise if no teacher view yet
             if(exercisesContainer) exercisesContainer.innerHTML = '<p style="text-align:center; margin-top: 2rem; color: var(--medium-text-dark);">Select an exercise from the dropdown above.</p>'; // Clear game area
             if (globalNextTurnArea) { globalNextTurnArea.innerHTML = ''; globalNextTurnArea.style.display = 'none'; }
        } else {
             // Exiting Teacher Mode
             if(turnIndicator) turnIndicator.classList.remove('teacher-mode');
             // Load the exercise corresponding to the actual game state
             loadExercise(); // This will load based on currentTeam and currentExerciseId
             if(isPaused) togglePause(); // Resume the game if it was paused only for teacher mode
             updateTurnIndicator(); // Update indicator to reflect game state
             // loadExercise will handle enabling/disabling inputs based on restored pause state
        }
        showMessage(`Teacher Mode ${isTeacherMode ? 'Enabled' : 'Disabled'}`, 'info');
    }

    function populateTeacherExerciseSelect() {
        if (!teacherExerciseSelect || !exerciseData) return;
        teacherExerciseSelect.innerHTML = '<option value="">Select Exercise to View...</option>'; // Default option

        exerciseData.forEach((set, setIndex) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `Set ${setIndex + 1}`; // Label for the set

            if (set.exercises && set.exercises.length > 0) {
                set.exercises.forEach(exercise => {
                    if (exercise?.id) {
                        const option = document.createElement('option');
                        // Value combines set index and exercise ID
                        option.value = `${setIndex}|${exercise.id}`;
                        // Text shows ID and title (cleaned)
                         const displayTitle = exercise.title?.replace(/^Set \d+:?\s*/, '') || 'Untitled Exercise';
                        option.textContent = `${exercise.id}: ${displayTitle}`;
                        optgroup.appendChild(option);
                    }
                });
            }
            teacherExerciseSelect.appendChild(optgroup);
        });
    }

    function loadSelectedTeacherExercise() {
         if (!isTeacherMode || !teacherExerciseSelect) return;
         const selectedValue = teacherExerciseSelect.value;
         if (!selectedValue) { // Handle the default "Select..." option
             if(exercisesContainer) exercisesContainer.innerHTML = '<p style="text-align:center; margin-top: 2rem; color: var(--medium-text-dark);">Select an exercise from the dropdown above.</p>';
             currentExerciseData = null; // No exercise data loaded
             updateTurnIndicator();
             return;
         };

         const [setIndexStr, exerciseId] = selectedValue.split('|');
         const setIndex = parseInt(setIndexStr);

         if (isNaN(setIndex) || !exerciseId) {
             console.error("Invalid value selected in teacher exercise dropdown:", selectedValue);
             return;
         }

         // --- Load exercise data directly without changing game state ---
         try {
             if (!exerciseData || !exerciseData[setIndex] || !exerciseData[setIndex].exercises) {
                 throw new Error(`Exercise data missing for Set ${setIndex + 1}.`);
             }
             const currentSet = exerciseData[setIndex];
             const foundExercise = currentSet.exercises.find(ex => ex?.id === exerciseId);
             if (!foundExercise) {
                 throw new Error(`Exercise ID "${exerciseId}" not found in Set ${setIndex + 1}.`);
             }
             if (!foundExercise.type) {
                  throw new Error(`Exercise ID "${exerciseId}" in Set ${setIndex + 1} is missing the 'type' property.`);
             }
             // Assign to currentExerciseData for rendering, include set info
             currentExerciseData = { ...foundExercise, set: currentSet.set };
             if(exercisesContainer) exercisesContainer.innerHTML = ''; // Clear container
             addedSentences = []; // Reset sentences if applicable

             // Render based on type
              switch (currentExerciseData.type) {
                 case 'wordScramble': renderWordScramble(currentExerciseData); break;
                 case 'tableFill': renderTableFill(currentExerciseData); break;
                 case 'matching': renderMatching(currentExerciseData); break;
                 case 'sentenceBuilder': renderSentenceBuilder(currentExerciseData); break; // Still handles rendering if type is SB
                 case 'fillIn': renderFillIn(currentExerciseData); break; // Handles rendering for type FI
                 case 'pictureDictionary': renderPictureDictionary(currentExerciseData); break;
                 case 'oppositesMatching': renderOppositesMatching(currentExerciseData); break;
                 case 'dragDropCategorize': renderDragDropCategorize(currentExerciseData); break;
                 case 'customPictureDictionary':
                     console.warn("Teacher mode viewing Custom Picture Dictionary - may not represent actual game state if custom images change.");
                      const customData = {
                         id: currentExerciseData.id,
                         type: 'customPictureDictionary',
                         title: currentExerciseData.title || 'Custom Picture Dictionary',
                         instructions: currentExerciseData.instructions || 'Identify items.',
                         items: uploadedPictureItems.length > 0 ? uploadedPictureItems : [{ imageDataUrl: '', answer: 'No custom items loaded' }], // Provide placeholder if none loaded
                         set: currentExerciseData.set
                     };
                     renderCustomPictureDictionary(customData);
                     break;
                 default:
                     console.error(`Unknown exercise type: ${currentExerciseData.type}`);
                     if(exercisesContainer) exercisesContainer.innerHTML = `<div class="exercise"><h2>Unsupported Exercise</h2><p>The exercise type "${currentExerciseData.type}" is not implemented yet.</p></div>`;
                     break;
             }
              // Immediately disable inputs after loading in teacher mode
              disableExerciseInputs(currentExerciseData.id, true);

              // Ensure the game remains paused visually and functionally
              if (!isPaused) togglePause(); // Should already be paused, but double-check
               updateTurnIndicator(); // Update indicator based on the *viewed* exercise data

              // Teacher mode doesn't use the "Next Turn" button
              if (globalNextTurnArea) { globalNextTurnArea.innerHTML = ''; globalNextTurnArea.style.display = 'none'; }

         } catch (error) {
              console.error(`Teacher Mode Error loading Exercise ${exerciseId} (Set ${setIndex + 1}):`, error);
              if(exercisesContainer) exercisesContainer.innerHTML = `<div class="exercise"><h2>Error Loading Exercise</h2><p>${error.message}</p></div>`;
              showMessage(`Error loading exercise ${exerciseId || ''}.`, 'error', 6000);
              currentExerciseData = null; // Clear data on error
              updateTurnIndicator();
         }
     }

    function swapTeacherSet() {
         if (!isTeacherMode || !currentExerciseData) {
            showMessage("Select an exercise first to swap its set.", "error");
            return;
        }
        const currentViewedExerciseId = currentExerciseData.id;
        const currentViewedSet = currentExerciseData.set; // Get current set from loaded data
         const currentViewedSetIndex = currentViewedSet === 1 ? 0 : 1;
         const targetSetIndex = currentViewedSetIndex === 0 ? 1 : 0; // Swap index

         console.log(`Teacher Mode: Swapping view from Set ${currentViewedSetIndex + 1} to Set ${targetSetIndex + 1} for Exercise ID ${currentViewedExerciseId}`);

          // --- Load exercise data directly from the target set ---
          try {
             if (!exerciseData || !exerciseData[targetSetIndex] || !exerciseData[targetSetIndex].exercises) {
                 throw new Error(`Exercise data missing for target Set ${targetSetIndex + 1}.`);
             }
             const targetSet = exerciseData[targetSetIndex];
             const foundExercise = targetSet.exercises.find(ex => ex?.id === currentViewedExerciseId);
             if (!foundExercise) {
                 // If the exact ID doesn't exist in the other set, show a message and don't swap
                 showMessage(`Exercise ID ${currentViewedExerciseId} does not exist in Set ${targetSetIndex + 1}. Cannot swap.`, 'error');
                 return;
             }
              if (!foundExercise.type) {
                  throw new Error(`Exercise ID "${currentViewedExerciseId}" in target Set ${targetSetIndex + 1} is missing the 'type' property.`);
             }
              // Assign to currentExerciseData for rendering, include target set info
             currentExerciseData = { ...foundExercise, set: targetSet.set };
             if(exercisesContainer) exercisesContainer.innerHTML = ''; // Clear container
             addedSentences = []; // Reset sentences if applicable

              // Render based on type
             switch (currentExerciseData.type) {
                 case 'wordScramble': renderWordScramble(currentExerciseData); break;
                 case 'tableFill': renderTableFill(currentExerciseData); break;
                 case 'matching': renderMatching(currentExerciseData); break;
                 case 'sentenceBuilder': renderSentenceBuilder(currentExerciseData); break;
                 case 'fillIn': renderFillIn(currentExerciseData); break;
                 case 'pictureDictionary': renderPictureDictionary(currentExerciseData); break;
                 case 'oppositesMatching': renderOppositesMatching(currentExerciseData); break;
                 case 'dragDropCategorize': renderDragDropCategorize(currentExerciseData); break;
                 case 'customPictureDictionary':
                      console.warn("Teacher mode viewing Custom Picture Dictionary - may not represent actual game state if custom images change.");
                      const customData = {
                         id: currentExerciseData.id,
                         type: 'customPictureDictionary',
                         title: currentExerciseData.title || 'Custom Picture Dictionary',
                         instructions: currentExerciseData.instructions || 'Identify items.',
                         items: uploadedPictureItems.length > 0 ? uploadedPictureItems : [{ imageDataUrl: '', answer: 'No custom items loaded' }],
                         set: currentExerciseData.set
                     };
                     renderCustomPictureDictionary(customData);
                     break;
                 default:
                     console.error(`Unknown exercise type: ${currentExerciseData.type}`);
                     if(exercisesContainer) exercisesContainer.innerHTML = `<div class="exercise"><h2>Unsupported Exercise</h2><p>The exercise type "${currentExerciseData.type}" is not implemented yet.</p></div>`;
                     break;
             }
              // Immediately disable inputs after loading
              disableExerciseInputs(currentExerciseData.id, true);

              // Ensure game remains paused
              if (!isPaused) togglePause();
              updateTurnIndicator(); // Update indicator based on the *newly viewed* exercise data

             // Update dropdown selection to reflect the swap
             if (teacherExerciseSelect) {
                 teacherExerciseSelect.value = `${targetSetIndex}|${currentViewedExerciseId}`;
             }

             showMessage(`Swapped view to Set ${targetSetIndex + 1} for exercise ${currentViewedExerciseId}.`, 'info');
             if (globalNextTurnArea) globalNextTurnArea.innerHTML = '';

         } catch (error) {
              console.error(`Teacher Mode Error swapping view for Exercise ${currentViewedExerciseId} to Set ${targetSetIndex + 1}:`, error);
              if(exercisesContainer) exercisesContainer.innerHTML = `<div class="exercise"><h2>Error Loading Swapped Exercise</h2><p>${error.message}</p></div>`;
              showMessage(`Error loading exercise ${currentViewedExerciseId || ''} from Set ${targetSetIndex + 1}.`, 'error', 6000);
              currentExerciseData = null;
              updateTurnIndicator();
         }
     }


    // ========================================
    //          Initial Setup on Load
    // ========================================
    function initializeUI() {
        console.log("Initializing UI...");
        // Ensure only setup overlay is visible initially
        if(mainGameInterface) mainGameInterface.style.display = 'none';
        if(pauseOverlay) pauseOverlay.style.display = 'none';
        if(endGameOverlay) endGameOverlay.style.display = 'none';
        if(gameSetupOverlay) gameSetupOverlay.style.display = 'flex'; // Show setup

        // Teacher Mode removed: nothing to hide

        // Set initial placeholder texts
        if (turnIndicator) turnIndicator.textContent = 'Waiting to start game...';
        if (customItemsArea) customItemsArea.innerHTML = initialCustomAreaText;
        if (clearCustomItemsBtn) clearCustomItemsBtn.style.display = 'none';
        // Initialize players-per-team UI
        if (playersPerTeamSelect) playersPerTeamSelect.value = '1';
        playersPerTeam = 1;
        renderPlayerInputs();
    }

    // Run initialization when the DOM is ready
    initializeUI();

}); // End DOMContentLoaded Listener
