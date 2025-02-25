interface ParsedPlayer {
  name: string;
  isFemale: boolean;
  team: string;
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

interface TempPlayer {
  name: string;
  isFemale: boolean;
  team: string;
  matchType: string;
}

function getTeamId(matchType: string, playerIndex: number): string {
  // Pour les matchs à 4 joueurs (DH, DD, DX)
  if (matchType.startsWith('D')) {
    // Joueur 1 et 3 -> team1, Joueur 2 et 4 -> team2
    return playerIndex % 2 === 0 ? "team1" : "team2";
  }
  // Pour les matchs à 2 joueurs (SH, SD)
  return playerIndex === 0 ? "team1" : "team2";
}

function cleanMatchText(text: string): string[] {
  const lines = text.split('\n').filter(line => line.trim());
  let startIndex = -1;
  let endIndex = -1;

  // Trouver le début des données pertinentes (après "Dis. Ord. Ter.")
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Dis. Ord. Ter.')) {
      startIndex = i;
      break;
    }
  }

  // Trouver la fin des données pertinentes (avant "Capitaines" ou "Bonus" ou "Powered by")
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].includes('Capitaines') || 
        lines[i].includes('Bonus') || 
        lines[i].includes('Powered by') ||
        lines[i].includes('Remarques')) {
      endIndex = i;
      break;
    }
  }

  // Si on n'a pas trouvé de fin explicite, prendre la dernière ligne avec "Totaux"
  if (endIndex === -1) {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('Totaux')) {
        endIndex = i + 1;
        break;
      }
    }
  }

  // Si on a trouvé un début mais pas de fin, prendre jusqu'à la fin
  if (startIndex !== -1 && endIndex === -1) {
    endIndex = lines.length;
  }

  // Retourner les lignes pertinentes
  return startIndex !== -1 ? lines.slice(startIndex, endIndex) : lines;
}

export function parseMatchText(text: string): ParsedResult {
  // Pré-traiter le texte pour ne garder que les lignes pertinentes
  const lines = cleanMatchText(text);
  const matches: ParsedMatch[] = [];
  const mixedMatches: ParsedMatch[] = [];
  let currentMatch: ParsedMatch | null = null;
  let team1 = "";
  let team2 = "";

  // Map pour stocker les infos des joueurs
  const knownPlayers = new Map<string, TempPlayer>();

  // Extrait les noms des équipes
  const teamLine = lines.find(line => 
    line.includes('(') && 
    !line.includes('Dis. Ord. Ter.') &&
    !line.includes('Licence - Nom')
  );

  if (teamLine) {
    const team1Match = teamLine.match(/^([^(]+)/);
    if (team1Match) {
      team1 = team1Match[1].trim();
    }
    const team2Match = teamLine.match(/\)\s*([^(]+)/);
    if (team2Match) {
      team2 = team2Match[1].trim();
    }
  }

  // Premier passage : traiter tous les matchs sauf les mixtes
  for (const line of lines) {
    const matchTypeMatch = line.match(/^(SH|SD|DH|DD|DX)\d/);
    if (matchTypeMatch) {
      if (currentMatch) {
        if (currentMatch.type.startsWith('DX')) {
          mixedMatches.push(currentMatch);
        } else {
          matches.push(currentMatch);
        }
      }
      
      const matchType = matchTypeMatch[0];
      currentMatch = {
        type: matchType,
        players: []
      };

      // Si ce n'est pas un mixte, traiter les joueurs immédiatement
      if (!matchType.startsWith('DX')) {
        const playerNames = line.match(/\d{8}\s*-\s*[^(]+(?=\s*\(|\s+\d{8}|\s*$)/g) || [];
        playerNames.forEach((playerMatch, index) => {
          const name = playerMatch.split('-')[1].trim();
          const isFemale = isPlayerFemale(matchType, index, name);
          const team = getTeamId(matchType, index);
          // Stocker les infos du joueur
          knownPlayers.set(name, { name, isFemale, team, matchType });
          currentMatch?.players.push({ name, isFemale, team });
        });
      }
    } else if (!line.includes('Victoires') && !line.includes('Totaux')) {
      const playerNames = line.match(/\d{8}\s*-\s*[^(]+(?=\s*\(|\s+\d{8}|\s*$)/g) || [];
      if (playerNames && currentMatch && !currentMatch.type.startsWith('DX')) {
        playerNames.forEach((playerMatch, index) => {
          const name = playerMatch.split('-')[1].trim();
          const isFemale = isPlayerFemale(currentMatch.type, currentMatch.players.length, name);
          const team = getTeamId(currentMatch.type, currentMatch.players.length);
          // Stocker les infos du joueur
          knownPlayers.set(name, { name, isFemale, team, matchType: currentMatch.type });
          currentMatch.players.push({ name, isFemale, team });
        });
      }
    }
  }

  // Ajouter le dernier match non-mixte
  if (currentMatch) {
    if (currentMatch.type.startsWith('DX')) {
      mixedMatches.push(currentMatch);
    } else {
      matches.push(currentMatch);
    }
  }

  // Deuxième passage : traiter les mixtes
  for (const mixedMatch of mixedMatches) {
    let matchLines: string[] = [];
    let foundMatch = false;
    
    console.log('=== Traitement du match mixte ===', mixedMatch.type);
    
    // Collecter toutes les lignes pertinentes pour ce match mixte
    for (const line of lines) {
      console.log('Analyse ligne:', line);
      console.log('Regex testée:', new RegExp(`^${mixedMatch.type}(?:[\\s\\d]|$)`));
      
      if (line.match(new RegExp(`^${mixedMatch.type}(?:[\\s\\d]|$)`))) {
        console.log('✅ Ligne de début de match trouvée:', line);
        foundMatch = true;
        matchLines.push(line);
      } else if (foundMatch) {
        console.log('Dans le match, analyse de:', line);
        if (line.match(/^(SH|SD|DH|DD|DX)\d/)) {
          console.log('❌ Fin du match trouvée:', line);
          break;
        } else if (!line.includes('Victoires') && !line.includes('Totaux')) {
          if (line.match(/\d{8}\s*-\s*[^(]+/)) {
            console.log('✅ Ligne de joueur trouvée:', line);
            matchLines.push(line);
          }
        }
      }
    }

    console.log('Lignes collectées pour', mixedMatch.type, ':', matchLines);

    // Extraire tous les joueurs
    const playerNames = matchLines.flatMap(line => {
      const matches = line.match(/\d{8}\s*-\s*[^(]+(?=\s*\(|\s+\d{8}|\s*$)/g) || [];
      const names = matches.map(m => m.split('-')[1].trim());
      console.log('Joueurs trouvés dans la ligne:', names);
      return names;
    });

    console.log('Tous les joueurs trouvés:', playerNames);

    // Traiter chaque joueur
    playerNames.forEach((name, index) => {
      const team = getTeamId(mixedMatch.type, index);
      const knownPlayer = knownPlayers.get(name);
      
      console.log('Traitement du joueur:', {
        name,
        index,
        team,
        isKnown: !!knownPlayer,
        knownInfo: knownPlayer
      });

      if (knownPlayer) {
        mixedMatch.players.push({ name, isFemale: knownPlayer.isFemale, team });
      } else {
        const isFemale = name.match(/[eéèêë]\s*$/i) !== null;
        console.log('Genre déterminé par le nom:', { name, isFemale });
        mixedMatch.players.push({ name, isFemale, team });
        knownPlayers.set(name, { name, isFemale, team, matchType: mixedMatch.type });
      }
    });

    console.log('Joueurs finaux du match:', mixedMatch.players);
  }

  // Ajouter les mixtes à la fin
  matches.push(...mixedMatches);

  return {
    team1,
    team2,
    matches
  };
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
