import React, { useState, useCallback } from "react";
import { OptimizedMatch } from "../types";
import PlanningMatch from "./PlanningMatch";

interface PlanningProps {
  matches: OptimizedMatch[];
  onOptimize: () => void;
}

interface SolutionWithPauses {
  rounds: OptimizedMatch[][];
  pauses: Array<{
    player: string;
    fromMatch: string;
    toMatch: string;
    roundFrom: number;
    roundTo: number;
  }>;
}

const Planning: React.FC<PlanningProps> = ({ matches, onOptimize }) => {
  const [solution, setSolution] = useState<SolutionWithPauses | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validSolutionsState, setValidSolutionsState] = useState<{
    [score: number]: { [firstMatch: string]: Array<{ permutation: OptimizedMatch[]; pauses: number }> }
  } | null>(null);
  const [selectedFirstMatch, setSelectedFirstMatch] = useState<string>("");

  const generateAllPermutations = (arr: OptimizedMatch[]): OptimizedMatch[][] => {
    const permutations: OptimizedMatch[][] = [];

    const permute = (arr: OptimizedMatch[], result: OptimizedMatch[] = []) => {
      if (arr.length === 0) {
        permutations.push([...result]);
      } else {
        for (let i = 0; i < arr.length; i++) {
          const current = arr[i];
          const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
          permute(remaining, [...result, current]);
        }
      }
    }

    permute(arr);
    return permutations;
  }

  const analyzePauses = (permutation: OptimizedMatch[]): number => {
    let pauseCount = 0;
    const playerLastMatch: { [playerId: string]: number } = {}; // Stocke l'index du dernier match de chaque joueur

    // Parcourir tous les matchs
    for (let matchIndex = 0; matchIndex < permutation.length; matchIndex++) {
      const match = permutation[matchIndex];
      
      // Vérifier chaque joueur du match
      for (const player of match.players) {
        const playerId = player.id;
        
        // Si le joueur a déjà joué
        if (playerLastMatch[playerId] !== undefined) {
          const matchGap = matchIndex - playerLastMatch[playerId];
          
          // Si le joueur joue deux matchs d'affilée
          if (matchGap === 1) {
            return 99; // Solution abandonnée
          }
          
          // Si le joueur a moins de 2 matchs d'écart
          if (matchGap < 3) {
            pauseCount++;
          }
        }
        
        // Mettre à jour le dernier match du joueur
        playerLastMatch[playerId] = matchIndex;
      }
    }

    return pauseCount;
  }

  const testPermutations = () => {
    console.time('Permutations');
    const allPermutations = generateAllPermutations(matches);
    console.timeEnd('Permutations');
    
    // Analyser les pauses pour chaque permutation
    const permutationsWithPauses = allPermutations.map(perm => ({
      permutation: perm,
      pauses: analyzePauses(perm)
    }));

    // Filtrer les solutions valides (pauses < 99)
    const validSolutions = permutationsWithPauses.filter(sol => sol.pauses < 99);
    
    console.log(`Nombre total de permutations: ${allPermutations.length}`);
    console.log(`Nombre de solutions valides: ${validSolutions.length}`);
    console.log('Solutions valides par nombre de pauses:');
    
    // Grouper les solutions par nombre de pauses
    const solutionsByPauses: { [key: number]: typeof validSolutions } = {};
    validSolutions.forEach(sol => {
      if (!solutionsByPauses[sol.pauses]) {
        solutionsByPauses[sol.pauses] = [];
      }
      solutionsByPauses[sol.pauses].push(sol);
    });
    
    // Afficher chaque groupe de solutions
    Object.entries(solutionsByPauses)
      .sort(([a], [b]) => Number(a) - Number(b)) // Trier par nombre de pauses
      .forEach(([pauses, solutions]) => {
        console.log(`\n=== Solutions avec ${pauses} pause(s) (${solutions.length} solutions)`);
        console.log(solutions)
      });

    return validSolutions;
  }

  const handleOptimize = useCallback(() => {
    setIsCalculating(true);
    try {
      const validSolutions = testPermutations();
      
      // Grouper les solutions par nombre de pauses et premier match
      const solutionsByPausesAndFirst: typeof validSolutionsState = {};
      validSolutions.forEach(solution => {
        const firstMatch = solution.permutation[0].type;
        const pauses = solution.pauses;
        
        if (!solutionsByPausesAndFirst[pauses]) {
          solutionsByPausesAndFirst[pauses] = {};
        }
        if (!solutionsByPausesAndFirst[pauses][firstMatch]) {
          solutionsByPausesAndFirst[pauses][firstMatch] = [];
        }
        solutionsByPausesAndFirst[pauses][firstMatch].push(solution);
      });

      setValidSolutionsState(solutionsByPausesAndFirst);

      // Trouver le meilleur score
      const bestScore = Math.min(...Object.keys(solutionsByPausesAndFirst).map(Number));
      
      // Prendre le premier type de match disponible pour le meilleur score
      const firstMatchTypes = Object.keys(solutionsByPausesAndFirst[bestScore]);
      setSelectedFirstMatch(firstMatchTypes[0]);

      // Définir la première solution comme solution actuelle
      const firstSolution = solutionsByPausesAndFirst[bestScore][firstMatchTypes[0]][0];
      const rounds: OptimizedMatch[][] = [];
      for (let i = 0; i < firstSolution.permutation.length; i += 2) {
        rounds.push(firstSolution.permutation.slice(i, i + 2));
      }
      setSolution({
        rounds,
        pauses: []
      });
    } finally {
      setIsCalculating(false);
    }
  }, [matches]);

  const handleFirstMatchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFirstMatch = event.target.value;
    setSelectedFirstMatch(newFirstMatch);

    // Mettre à jour la solution avec la nouvelle sélection
    if (validSolutionsState) {
      const bestScore = Math.min(...Object.keys(validSolutionsState).map(Number));
      const newSolution = validSolutionsState[bestScore][newFirstMatch][0];
      
      const rounds: OptimizedMatch[][] = [];
      for (let i = 0; i < newSolution.permutation.length; i += 2) {
        rounds.push(newSolution.permutation.slice(i, i + 2));
      }
      setSolution({
        rounds,
        pauses: []
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Planning</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {isCalculating ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          solution?.rounds.map((round, index) => (
            <React.Fragment key={`round-${index}`}>
              <div className="col-span-2">Tour {index + 1}</div>

              {round.map((match, matchIndex) => {
                // Trouver les pauses qui concernent ce match
                const matchPauses = solution.pauses.filter(
                  (pause) =>
                    pause.fromMatch === match.type ||
                    pause.toMatch === match.type
                );
                const pausedPlayers = matchPauses.map((pause) => pause.player);

                return (
                  <PlanningMatch
                    key={`match-${match.type}-${index * 2 + matchIndex}`}
                    match={match}
                    pausedPlayers={pausedPlayers}
                  />
                );
              })}
            </React.Fragment>
          ))
        )}
      </div>
      {solution && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            La meilleur solution contient {solution?.pauses.length} tours avec
            pause
          </div>
        </div>
      )}

      <button
        onClick={handleOptimize}
        className="bg-sky-500 text-white w-full px-4 py-2 rounded-md hover:bg-sky-400 disabled:bg-sky-300"
        disabled={isCalculating}
      >
        {isCalculating ? "Calcul en cours..." : "Ordre des matchs"}
      </button>

      {validSolutionsState && (
        <>
          <label className="block text-sm font-medium text-gray-700 mt-4">
            Premier match
          </label>
          <select
            value={selectedFirstMatch}
            onChange={handleFirstMatchChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white"
          >
            {Object.keys(validSolutionsState[Math.min(...Object.keys(validSolutionsState).map(Number))]).map((firstMatch) => (
              <option key={firstMatch} value={firstMatch}>
                {firstMatch}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default Planning;
