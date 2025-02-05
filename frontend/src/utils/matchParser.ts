interface ParsedPlayer {
  name: string;
  isFemale: boolean;
}

interface ParsedMatch {
  type: string;
  players: ParsedPlayer[];
}

interface ParsedResult {
  team1: string;
  team2: string;
  matches: ParsedMatch[];
}

export function parseMatchText(text: string): ParsedResult {
  const lines = text.split('\n').filter(line => line.trim());
  const matches: ParsedMatch[] = [];
  let currentMatch: ParsedMatch | null = null;
  let team1 = "";
  let team2 = "";

  // Skip the header line that contains "Dis. Ord. Ter."
  const teamLine = lines.find(line => 
    line.includes('(') && 
    !line.includes('Dis. Ord. Ter.') &&
    !line.includes('Licence - Nom')
  );

  if (teamLine) {
    // Find the first team name (before the first parenthesis)
    const team1Match = teamLine.match(/^([^(]+)/);
    if (team1Match) {
      team1 = team1Match[1].trim();
    }

    // Find the second team name (between the first closing parenthesis and the next opening parenthesis)
    const team2Match = teamLine.match(/\)\s*([^(]+)/);
    if (team2Match) {
      team2 = team2Match[1].trim();
    }
  }

  for (const line of lines) {
    // New match starts with match type (e.g., "SH1", "DD1", etc.)
    const matchTypeMatch = line.match(/^(SH|SD|DH|DD|DX)\d/);
    if (matchTypeMatch) {
      if (currentMatch) {
        matches.push(currentMatch);
      }
      
      const matchType = matchTypeMatch[0];
      currentMatch = {
        type: matchType,
        players: []
      };

      // Parse players if they are on the same line
      const playerNames = line.match(/\d{8}\s*-\s*([^(]+)/g);
      if (playerNames) {
        playerNames.forEach(playerMatch => {
          const name = playerMatch.split('-')[1].trim();
          if (currentMatch) {
            const isFemale = isPlayerFemale(matchType, currentMatch.players.length, name);
            currentMatch.players.push({ name, isFemale });
          }
        });
      }
    }
    // Player line (not starting with match type)
    else if (line.includes(' - ') && !line.includes('Victoires') && !line.includes('Totaux')) {
      const playerNames = line.match(/\d{8}\s*-\s*([^(]+)/g);
      if (playerNames && currentMatch) {
        playerNames.forEach(playerMatch => {
          const name = playerMatch.split('-')[1].trim();
          const isFemale = isPlayerFemale(currentMatch.type, currentMatch.players.length, name);
          currentMatch.players.push({ name, isFemale });
        });
      }
    }
  }

  // Don't forget to add the last match
  if (currentMatch) {
    matches.push(currentMatch);
  }

  const result = {
    team1,
    team2,
    matches
  };

  console.log('Parsed result:', result);
  return result;
}

function isPlayerFemale(matchType: string, playerIndex: number, name: string): boolean {
  const matchCategory = matchType.slice(0, 2);
  
  switch (matchCategory) {
    case 'SD': // Simple Dame
      return true;
    case 'SH': // Simple Homme
      return false;
    case 'DD': // Double Dame
      return true;
    case 'DH': // Double Homme
      return false;
    case 'DX': // Double Mixte
      // Pour chaque paire de joueurs dans le mixte
      // L'équipe 1 est aux indices 0-1, l'équipe 2 aux indices 2-3
      const pairIndex = Math.floor(playerIndex / 2); // 0 pour équipe 1, 1 pour équipe 2
      const positionInPair = playerIndex % 2; // 0 pour premier joueur, 1 pour second
      return positionInPair === 0; // Le premier joueur de chaque paire est une femme
    default:
      return false;
  }
}
