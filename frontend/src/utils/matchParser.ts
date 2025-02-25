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

function cleanMatchText(text: string): string[] {
  // 1. Supprimer tous les espaces en début de ligne et lignes vides
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 2. Joindre toutes les lignes en une seule chaîne
  let fullText = lines.join(' ');

  // 3. Ajouter des retours à la ligne devant les types de match
  fullText = fullText.replace(/(SH1|SH2|SD1|SD2|DX1|DX2|DD1|DH1)/g, '\n$1');

  // 4. Découper à nouveau en lignes et nettoyer
  return fullText.split('\n');
}

function extractTeams(line: string): Omit<ParsedResult, 'matches'> | null {
  // Regexp pour détecter "2 chiffres-3 lettres-2 chiffres"
  const teamRegex = /(\d{2}-[A-Z]{2,10}-\d{1,2})/g;
  const matches = line.match(teamRegex);
  
  if (matches && matches.length >= 2) {
    return {
      team1: matches[0],
      team2: matches[1]
    };
  }
  return null;
}

function extractPlayer(text: string): Omit<ParsedPlayer, 'isFemale' | 'team'> | null {
  const playerRegex = /(\d{8})\s+-\s+([^(]+)\s*\(([^)]+)\)/;
  const match = text.match(playerRegex);
  
  if (match) {
    const [_, license, name, category] = match;
    return {
      name: name.trim()
    };
  }
  return null;
}

function extractSingleMatch(line: string): ParsedMatch | null {
  // Regexp pour détecter un match simple et ses deux joueurs
  const singleMatchRegex = /^(SH[12]|SD[12]).*?(\d{8}\s+-\s+[^(]+\s*\([^)]+\)).*?(\d{8}\s+-\s+[^(]+\s*\([^)]+\))/;
  const match = line.match(singleMatchRegex);
  
  if (match) {
    const [_, type, player1Text, player2Text] = match;
    const player1 = extractPlayer(player1Text);
    const player2 = extractPlayer(player2Text);
    
    if (player1 && player2) {
      return {
        type,
        players: [
          { ...player1, team: "team1", isFemale: type.startsWith('SD') },
          { ...player2, team: "team2", isFemale: type.startsWith('SD') }
        ]
      };
    }
  }
  return null;
}

function extractDoubleMatch(line: string): ParsedMatch | null {
  // Regexp pour détecter un match double et ses quatre joueurs
  const doubleMatchRegex = /^(DH1|DD1|DX[12]).*?(\d{8}\s+-\s+[^(]+\s*\([^)]+\)).*?(\d{8}\s+-\s+[^(]+\s*\([^)]+\)).*?(\d{8}\s+-\s+[^(]+\s*\([^)]+\)).*?(\d{8}\s+-\s+[^(]+\s*\([^)]+\))/;
  const match = line.match(doubleMatchRegex);
  
  if (match) {
    const [_, type, player1Text, player2Text, player3Text, player4Text] = match;
    const player1 = extractPlayer(player1Text);
    const player2 = extractPlayer(player2Text);
    const player3 = extractPlayer(player3Text);
    const player4 = extractPlayer(player4Text);
    
    if (player1 && player2 && player3 && player4) {
      const isFemale = type.startsWith('DD');
      const isMixed = type.startsWith('DX');
      return {
        type,
        players: [
          { ...player1, team: "team1", isFemale: isFemale || (isMixed && true) },
          { ...player3, team: "team1", isFemale: isFemale || (isMixed && false) },
          { ...player2, team: "team2", isFemale: isFemale || (isMixed && true) },
          { ...player4, team: "team2", isFemale: isFemale || (isMixed && false) }
        ]
      };
    }
  }
  return null;
}

export function parseMatchText(text: string): ParsedResult {
  const lines = cleanMatchText(text);
  console.log("\n=== Test de cleanMatchText ===");
  console.log("Nombre de lignes après nettoyage:", lines.length);
  console.log("\nLignes conservées:");
  lines.forEach((line, index) => {
    console.log(`${index + 1}: ${line}`);
  });

  // Chercher les équipes dans chaque ligne
  console.log("\n=== Test de extractTeams ===");
  let result: ParsedResult = {
    team1: "",
    team2: "",
    matches: []
  };

  for (let i = 0; i < lines.length; i++) {
    const teams = extractTeams(lines[i]);
    if (teams) {
      console.log(`\nÉquipes trouvées ligne ${i + 1}:`);
      console.log("Texte:", lines[i]);
      console.log("Équipes:", teams);
      
      // On a trouvé les équipes, on les enregistre et on arrête la recherche
      result = { ...teams, matches: [] };
      break;
    }
  }

  // Chercher les matchs dans chaque ligne
  console.log("\n=== Test de extractMatch ===");
  for (let i = 0; i < lines.length; i++) {
    const singleMatch = extractSingleMatch(lines[i]);
    if (singleMatch) {
      console.log(`\nMatch simple trouvé ligne ${i + 1}:`);
      console.log("Texte:", lines[i]);
      console.log("Match:", singleMatch);
      
      // On a trouvé un match simple, on l'ajoute à la liste des matchs
      result.matches.push(singleMatch);
    } else {
      const doubleMatch = extractDoubleMatch(lines[i]);
      if (doubleMatch) {
        console.log(`\nMatch double trouvé ligne ${i + 1}:`);
        console.log("Texte:", lines[i]);
        console.log("Match:", doubleMatch);
        
        // On a trouvé un match double, on l'ajoute à la liste des matchs
        result.matches.push(doubleMatch);
      }
    }
  }
  console.log(result)
  return result;
}