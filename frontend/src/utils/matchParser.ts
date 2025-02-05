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

export function parseMatchText(text: string): ParsedResult {
  const lines = text.split('\n').filter(line => line.trim());
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
      console.log("Adding last mixed match:", currentMatch.type);
      mixedMatches.push(currentMatch);
    } else {
      matches.push(currentMatch);
    }
  }

  console.log("All mixed matches collected:", mixedMatches.map(m => m.type));

  // Deuxième passage : traiter les mixtes
  for (const mixedMatch of mixedMatches) {
    // Trouver les lignes pertinentes pour ce match
    let matchLines: string[] = [];
    let foundMatch = false;
    
    console.log('Looking for match:', mixedMatch.type);
    
    // Parcourir les lignes pour trouver celles qui appartiennent à ce match
    for (const line of lines) {
      // Vérifier si la ligne commence par le type de match suivi d'un chiffre ou d'un espace
      if (line.match(new RegExp(`^${mixedMatch.type}[\\s\\d]`))) {
        console.log('Found match line:', line);
        foundMatch = true;
        matchLines.push(line);
      } else if (foundMatch && line.match(/^(SH|SD|DH|DD|DX)\d/)) {
        // Si on trouve un nouveau match, on arrête
        console.log('Found next match:', line);
        break;
      } else if (foundMatch && line.includes(' - ') && !line.includes('Victoires') && !line.includes('Totaux')) {
        console.log('Found player line:', line);
        matchLines.push(line);
      }
    }

    console.log('Match lines for', mixedMatch.type, ':', matchLines);

    const playerNames = matchLines.flatMap(line => {
      const matches = line.match(/\d{8}\s*-\s*[^(]+(?=\s*\(|\s+\d{8}|\s*$)/g) || [];
      console.log('Found players in line:', matches);
      return matches;
    });

    console.log('All players for', mixedMatch.type, ':', mixedMatch.players);

    playerNames.forEach((playerMatch, index) => {
      const name = playerMatch.split('-')[1].trim();
      const team = getTeamId(mixedMatch.type, index);
      
      // Chercher si on connaît déjà le joueur
      if (knownPlayers.has(name)) {
        const knownPlayer = knownPlayers.get(name)!;
        console.log("Player is known:", name, "from", knownPlayer.matchType);
        mixedMatch.players.push({ name, isFemale: knownPlayer.isFemale, team });
      } else {
        console.log(name, "is not known, team:", team);
        
        // Chercher un partenaire dans les joueurs connus qui joue ce match
        const partner = Array.from(knownPlayers.values()).find(p => {
          // Le partenaire doit :
          // 1. Être dans la même équipe
          // 2. Être dans ce match (son nom est dans playerNames)
          return p.team === team && 
                 playerNames.some(pn => pn.split('-')[1].trim() === p.name);
        });

        if (partner) {
          console.log("Found partner in known players:", partner.name, "from", partner.matchType);
          // Si on a trouvé un partenaire, on prend le sexe opposé
          const isFemale = !partner.isFemale;
          mixedMatch.players.push({ name, isFemale, team });
          knownPlayers.set(name, { name, isFemale, team, matchType: mixedMatch.type });
        } else {
          // Si pas de partenaire connu, premier joueur = femme
          const isFemale = index % 2 === 0;
          console.log("No partner found, using default rule:", isFemale);
          mixedMatch.players.push({ name, isFemale, team });
          knownPlayers.set(name, { name, isFemale, team, matchType: mixedMatch.type });
        }
      }
    });
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
