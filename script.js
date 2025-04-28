document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const playerNameInput = document.getElementById('player-name');
    const playerRatingInput = document.getElementById('player-rating');
    const ratingValueDisplay = document.getElementById('rating-value');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playersList = document.getElementById('players-list');
    const noPlayersMessage = document.getElementById('no-players-message');
    const playerCountDisplay = document.getElementById('player-count');
    const generateTeamsBtn = document.getElementById('generate-teams-btn');
    const clearTeamsBtn = document.getElementById('clear-teams-btn');
    const teamsContainer = document.getElementById('teams-container');
    const warningContainer = document.getElementById('warning-container');
    const toast = document.getElementById('toast');
    const resetPlayersBtn = document.getElementById('reset-players-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');
    const confirmResetBtn = document.getElementById('confirm-reset-btn');
    const playerSelectionList = document.getElementById('player-selection-list');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deselectAllBtn = document.getElementById('deselect-all-btn');
    const selectedCountDisplay = document.getElementById('selected-count');

    // State
    let players = [];
    let teams = [];
    let selectedPlayerIds = [];

    // Default players data
    const defaultPlayers = [
        { id: "1", name: "Jhonata", rating: 5 },
                { id: "2", name: "Danilo", rating: 6 },
                { id: "3", name: "Jack", rating: 7 },
                { id: "4", name: "Bruno", rating: 4 },
                { id: "5", name: "Lucas Ferreira", rating: 5 },
                { id: "6", name: "Tio Nelson", rating: 4 },
                { id: "7", name: "Luizão", rating: 5 },
                { id: "8", name: "Gabriel", rating: 9 },
                { id: "9", name: "Haroldo", rating: 6 },
                { id: "10", name: "Edilson", rating: 5 }, // nao sei
                { id: "11", name: "Vini", rating: 6 }, 
                { id: "12", name: "Douglas", rating: 8 },
                { id: "13", name: "Diego Mariano", rating: 9 },
                { id: "14", name: "Enzo", rating: 7 },
                { id: "15", name: "Wesley", rating: 8.5 },
                { id: "16", name: "Kaue", rating: 7 },
                { id: "17", name: "Leo", rating: 6 },
                { id: "18", name: "Valdinei", rating: 9 },
                { id: "19", name: "Felipe Dias", rating: 7 },
                { id: "20", name: "Samurai", rating: 9 },
                { id: "21", name: "Murilo", rating: 8.5 },
                { id: "22", name: "Diego Saouda", rating: 7 },
                { id: "23", name: "Claudinei", rating: 5 },
                { id: "24", name: "Matheus", rating: 7 },
                { id: "25", name: "Claúdio", rating: 4 },
                { id: "26", name: "Breno", rating: 6 },
                { id: "27", name: "Daniel Cardoso", rating: 9 },
                { id: "28", name: "Samir", rating: 5 },
                { id: "29", name: "Leandro 127", rating: 7 },
                { id: "30", name: "Pedro Henrique", rating: 7 },
                { id: "31", name: "Idemar", rating: 7 },
    ];

    // Initialize
    loadPlayers();
    updatePlayersTable();
    updateTeamsWarning();
    updatePlayerSelectionList();

    // Event Listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    playerRatingInput.addEventListener('input', () => {
        ratingValueDisplay.textContent = playerRatingInput.value;
    });

    addPlayerBtn.addEventListener('click', addPlayer);

    generateTeamsBtn.addEventListener('click', generateTeams);

    clearTeamsBtn.addEventListener('click', clearTeams);

    resetPlayersBtn.addEventListener('click', () => {
        confirmModal.classList.add('show');
    });

    closeModalBtn.addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });

    cancelResetBtn.addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });

    confirmResetBtn.addEventListener('click', () => {
        resetPlayers();
        confirmModal.classList.remove('show');
    });

    selectAllBtn.addEventListener('click', selectAllPlayers);
    deselectAllBtn.addEventListener('click', deselectAllPlayers);

    // Functions
    function switchTab(tabName) {
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });

        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabName}-tab`) {
                pane.classList.add('active');
            }
        });
    }

    function addPlayer() {
        const name = playerNameInput.value.trim();
        const rating = parseInt(playerRatingInput.value);

        if (!name) {
            showToast('Nome obrigatório', 'Por favor, insira o nome do jogador.', 'error');
            return;
        }

        const player = {
            id: Date.now().toString(),
            name: name,
            rating: rating
        };

        players.push(player);
        // Also select the new player by default
        selectedPlayerIds.push(player.id);
        
        savePlayers();
        saveSelectedPlayers();
        updatePlayersTable();
        updateTeamsWarning();
        updatePlayerSelectionList();
        updateSelectedCount();

        playerNameInput.value = '';
        playerRatingInput.value = '5';
        ratingValueDisplay.textContent = '5';

        showToast('Jogador adicionado', `${player.name} foi adicionado com nota ${player.rating}.`);
    }

    function removePlayer(id) {
        const playerToRemove = players.find(p => p.id === id);
        players = players.filter(player => player.id !== id);
        
        // Also remove from selected players if present
        selectedPlayerIds = selectedPlayerIds.filter(playerId => playerId !== id);
        
        savePlayers();
        saveSelectedPlayers();
        updatePlayersTable();
        updateTeamsWarning();
        updatePlayerSelectionList();
        updateSelectedCount();

        if (playerToRemove) {
            showToast('Jogador removido', `${playerToRemove.name} foi removido da lista.`);
        }
    }

    function updatePlayersTable() {
        // Sort players by rating (highest to lowest)
        const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
        
        playersList.innerHTML = '';
        
        if (sortedPlayers.length === 0) {
            noPlayersMessage.style.display = 'block';
            document.getElementById('players-table').style.display = 'none';
        } else {
            noPlayersMessage.style.display = 'none';
            document.getElementById('players-table').style.display = 'table';
            
            sortedPlayers.forEach(player => {
                const row = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                
                const ratingCell = document.createElement('td');
                ratingCell.className = 'text-center';
                
                const ratingBadge = document.createElement('span');
                ratingBadge.className = `rating-badge ${getRatingClass(player.rating)}`;
                ratingBadge.textContent = player.rating;
                ratingCell.appendChild(ratingBadge);
                
                const actionCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
                deleteButton.addEventListener('click', () => removePlayer(player.id));
                actionCell.appendChild(deleteButton);
                
                row.appendChild(nameCell);
                row.appendChild(ratingCell);
                row.appendChild(actionCell);
                
                playersList.appendChild(row);
            });
        }
        
        playerCountDisplay.textContent = `${players.length} jogadores disponíveis para sorteio`;
    }

    function updateTeamsWarning() {
        warningContainer.innerHTML = '';
        
        const selectedCount = selectedPlayerIds.length;
        
        if (selectedCount < 10) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-destructive';
            alert.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div>
                    <div class="alert-title">Atenção</div>
                    <div class="alert-message">
                        São necessários pelo menos 10 jogadores selecionados para formar 2 times.
                        Atualmente há ${selectedCount} jogadores selecionados.
                    </div>
                </div>
            `;
            warningContainer.appendChild(alert);
            generateTeamsBtn.disabled = true;
        } else {
            generateTeamsBtn.disabled = false;
        }
    }

    function generateTeams() {
        if (selectedPlayerIds.length < 10) {
            showToast('Jogadores insuficientes', 'São necessários pelo menos 10 jogadores selecionados para formar 2 times.', 'error');
            return;
        }

        generateTeamsBtn.textContent = 'Gerando times...';
        generateTeamsBtn.disabled = true;
        
        // Add a small delay to show loading state
        setTimeout(() => {
            // Get only selected players
            const selectedPlayers = players.filter(player => selectedPlayerIds.includes(player.id));
            teams = generateBalancedTeams(selectedPlayers);
            renderTeams();
            
            generateTeamsBtn.textContent = 'Gerar Times';
            generateTeamsBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Gerar Times`;
            generateTeamsBtn.disabled = false;
            clearTeamsBtn.style.display = 'block';
            
            showToast('Times gerados com sucesso!', `${teams.length} times balanceados foram criados.`);
        }, 800);
    }

    function renderTeams() {
        teamsContainer.innerHTML = '';
        
        teams.forEach((team, index) => {
            const teamCard = document.createElement('div');
            teamCard.className = `team-card ${index % 2 === 0 ? 'team-a' : 'team-b'}`;
            
            const teamHeader = document.createElement('div');
            teamHeader.className = 'team-header';
            
            const teamTitle = document.createElement('div');
            teamTitle.className = 'team-title';
            teamTitle.textContent = `Time ${index + 1}`;
            
            const teamBadge = document.createElement('div');
            teamBadge.className = `team-badge ${index % 2 === 0 ? 'primary' : 'secondary'}`;
            teamBadge.textContent = `Média: ${team.averageRating.toFixed(1)}`;
            
            teamHeader.appendChild(teamTitle);
            teamHeader.appendChild(teamBadge);
            
            const teamStats = document.createElement('div');
            teamStats.className = 'team-stats';
            teamStats.textContent = `Total de pontos: ${team.totalRating}`;
            
            const teamPlayers = document.createElement('div');
            teamPlayers.className = 'team-players';
            
            team.players.forEach(player => {
                const playerItem = document.createElement('div');
                playerItem.className = 'player-item';
                
                const playerName = document.createElement('div');
                playerName.className = 'player-name';
                playerName.textContent = player.name;
                
                const playerRating = document.createElement('div');
                playerRating.className = `rating-badge ${getRatingClass(player.rating)}`;
                playerRating.textContent = player.rating;
                
                playerItem.appendChild(playerName);
                playerItem.appendChild(playerRating);
                
                teamPlayers.appendChild(playerItem);
            });
            
            teamCard.appendChild(teamHeader);
            teamCard.appendChild(teamStats);
            teamCard.appendChild(teamPlayers);
            
            teamsContainer.appendChild(teamCard);
        });
    }

    function clearTeams() {
        teams = [];
        teamsContainer.innerHTML = '';
        clearTeamsBtn.style.display = 'none';
    }

    function generateBalancedTeams(playersList) {
        // Make a copy of the players array to avoid modifying the original
        const availablePlayers = [...playersList];
        
        // Shuffle the players to add randomness
        shuffleArray(availablePlayers);
        
        // Sort players by rating (highest to lowest)
        availablePlayers.sort((a, b) => b.rating - a.rating);
        
        const numTeams = Math.floor(availablePlayers.length / 5);
        const teams = Array.from({ length: numTeams }, () => ({
            players: [],
            totalRating: 0,
            averageRating: 0
        }));
        
        // Distribute players using the serpentine method (snake draft)
        // This helps balance teams by alternating the order
        let teamIndex = 0;
        let direction = 1; // 1 for forward, -1 for backward
        
        for (const player of availablePlayers) {
            if (teams[teamIndex].players.length < 5) {
                teams[teamIndex].players.push(player);
                teams[teamIndex].totalRating += player.rating;
                
                // Move to the next team
                teamIndex += direction;
                
                // Change direction if we reach the end or beginning
                if (teamIndex >= teams.length) {
                    teamIndex = teams.length - 1;
                    direction = -1;
                } else if (teamIndex < 0) {
                    teamIndex = 0;
                    direction = 1;
                }
            }
        }
        
        // Calculate average ratings
        for (const team of teams) {
            team.averageRating = team.totalRating / team.players.length;
        }
        
        // Final optimization: swap players between teams to balance ratings
        optimizeTeamBalance(teams);
        
        return teams;
    }

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Optimize team balance by swapping players
    function optimizeTeamBalance(teams) {
        const iterations = 100; // Number of optimization attempts
        
        for (let i = 0; i < iterations; i++) {
            // Find the teams with highest and lowest average ratings
            let highestTeamIndex = 0;
            let lowestTeamIndex = 0;
            
            for (let j = 1; j < teams.length; j++) {
                if (teams[j].averageRating > teams[highestTeamIndex].averageRating) {
                    highestTeamIndex = j;
                }
                if (teams[j].averageRating < teams[lowestTeamIndex].averageRating) {
                    lowestTeamIndex = j;
                }
            }
            
            if (highestTeamIndex === lowestTeamIndex) break;
            
            // Try to find players to swap that would improve balance
            const highTeam = teams[highestTeamIndex];
            const lowTeam = teams[lowestTeamIndex];
            
            // Find the best swap that minimizes the difference between teams
            let bestSwapDiff = highTeam.averageRating - lowTeam.averageRating;
            let bestHighPlayerIndex = -1;
            let bestLowPlayerIndex = -1;
            
            for (let h = 0; h < highTeam.players.length; h++) {
                for (let l = 0; l < lowTeam.players.length; l++) {
                    const highPlayer = highTeam.players[h];
                    const lowPlayer = lowTeam.players[l];
                    
                    // Calculate new averages if we swap these players
                    const newHighTotal = highTeam.totalRating - highPlayer.rating + lowPlayer.rating;
                    const newLowTotal = lowTeam.totalRating - lowPlayer.rating + highPlayer.rating;
                    
                    const newHighAvg = newHighTotal / highTeam.players.length;
                    const newLowAvg = newLowTotal / lowTeam.players.length;
                    
                    const newDiff = Math.abs(newHighAvg - newLowAvg);
                    
                    // If this swap improves balance, remember it
                    if (newDiff < bestSwapDiff) {
                        bestSwapDiff = newDiff;
                        bestHighPlayerIndex = h;
                        bestLowPlayerIndex = l;
                    }
                }
            }
            
            // If we found a beneficial swap, do it
            if (bestHighPlayerIndex >= 0 && bestLowPlayerIndex >= 0) {
                const highPlayer = highTeam.players[bestHighPlayerIndex];
                const lowPlayer = lowTeam.players[bestLowPlayerIndex];
                
                // Update team totals
                highTeam.totalRating = highTeam.totalRating - highPlayer.rating + lowPlayer.rating;
                lowTeam.totalRating = lowTeam.totalRating - lowPlayer.rating + highPlayer.rating;
                
                // Swap players
                highTeam.players[bestHighPlayerIndex] = lowPlayer;
                lowTeam.players[bestLowPlayerIndex] = highPlayer;
                
                // Recalculate averages
                highTeam.averageRating = highTeam.totalRating / highTeam.players.length;
                lowTeam.averageRating = lowTeam.totalRating / lowTeam.players.length;
            } else {
                // If no beneficial swap was found, stop optimizing
                break;
            }
        }
    }

    function getRatingClass(rating) {
        if (rating >= 9) return 'rating-high';
        if (rating >= 7) return 'rating-medium';
        if (rating >= 5) return 'rating-average';
        return 'rating-low';
    }

    function showToast(title, message, type = 'success') {
        const toastElement = document.getElementById('toast');
        const toastTitle = toastElement.querySelector('.toast-title');
        const toastMessage = toastElement.querySelector('.toast-message');
        
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        toastElement.className = 'toast';
        if (type === 'error') {
            toastElement.classList.add('error');
        }
        
        toastElement.classList.add('show');
        
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    }

    function savePlayers() {
        localStorage.setItem('players', JSON.stringify(players));
    }

    function saveSelectedPlayers() {
        localStorage.setItem('selectedPlayerIds', JSON.stringify(selectedPlayerIds));
    }

    function loadPlayers() {
        const savedPlayers = localStorage.getItem('players');
        if (savedPlayers) {
            players = JSON.parse(savedPlayers);
        } else {
            // Default players if none exist
            players = [...defaultPlayers];
            savePlayers();
        }

        // Load selected players
        const savedSelectedPlayerIds = localStorage.getItem('selectedPlayerIds');
        if (savedSelectedPlayerIds) {
            selectedPlayerIds = JSON.parse(savedSelectedPlayerIds);
        } else {
            // By default, select all players
            selectedPlayerIds = players.map(player => player.id);
            saveSelectedPlayers();
        }
    }

    function resetPlayers() {
        players = [...defaultPlayers];
        savePlayers();
        
        // Select all players by default
        selectedPlayerIds = players.map(player => player.id);
        saveSelectedPlayers();
        
        updatePlayersTable();
        updatePlayerSelectionList();
        updateTeamsWarning();
        updateSelectedCount();
        
        showToast('Lista resetada', 'A lista de jogadores foi resetada para os valores padrão.');
    }

    function updatePlayerSelectionList() {
        playerSelectionList.innerHTML = '';
        
        if (players.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'text-center muted';
            emptyMessage.textContent = 'Nenhum jogador cadastrado';
            playerSelectionList.appendChild(emptyMessage);
            return;
        }
        
        // Sort players by name for selection list
        const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedPlayers.forEach(player => {
            const checkboxItem = document.createElement('label');
            checkboxItem.className = 'player-checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = player.id;
            checkbox.checked = selectedPlayerIds.includes(player.id);
            checkbox.addEventListener('change', () => togglePlayerSelection(player.id));
            
            const label = document.createElement('span');
            label.className = 'player-checkbox-label';
            label.textContent = player.name;
            
            const rating = document.createElement('span');
            rating.className = `player-checkbox-rating ${getRatingClass(player.rating)}`;
            rating.textContent = player.rating;
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            checkboxItem.appendChild(rating);
            
            playerSelectionList.appendChild(checkboxItem);
        });
        
        updateSelectedCount();
    }

    function togglePlayerSelection(playerId) {
        if (selectedPlayerIds.includes(playerId)) {
            selectedPlayerIds = selectedPlayerIds.filter(id => id !== playerId);
        } else {
            selectedPlayerIds.push(playerId);
        }
        
        saveSelectedPlayers();
        updateSelectedCount();
        updateTeamsWarning();
    }

    function selectAllPlayers() {
        selectedPlayerIds = players.map(player => player.id);
        saveSelectedPlayers();
        updatePlayerSelectionList();
        updateSelectedCount();
        updateTeamsWarning();
    }

    function deselectAllPlayers() {
        selectedPlayerIds = [];
        saveSelectedPlayers();
        updatePlayerSelectionList();
        updateSelectedCount();
        updateTeamsWarning();
    }

    function updateSelectedCount() {
        selectedCountDisplay.textContent = `${selectedPlayerIds.length} jogadores selecionados`;
    }
});