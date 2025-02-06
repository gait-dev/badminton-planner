import React, { useState, useCallback } from "react";
import { OptimizedMatch } from "../types";
import PlanningMatch from "./PlanningMatch";

interface PlanningProps {
  matches: OptimizedMatch[];
  onOptimize: () => void;
}

const MATCH_DURATION = 40; // minutes
const REST_DURATION = 20; // minutes

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
  // Fonction pour vérifier si deux matchs peuvent être joués en même temps
  const canPlaySimultaneously = (
    match1: OptimizedMatch,
    match2: OptimizedMatch | null,
    schedule: OptimizedMatch[]
  ): boolean => {
    if (!match2) return true;

    // Pour chaque joueur du match1, on extrait l'ID original (sans le préfixe du match)
    const match1PlayerIds = match1.players.map((p) => p.id.split("-")[2]);
    const match2PlayerIds = match2
      ? match2.players.map((p) => p.id.split("-")[2])
      : [];

    // Vérifier si un joueur est commun aux deux matchs
    const hasCommonPlayer = match1PlayerIds.some((id1) =>
      match2PlayerIds.includes(id1)
    );
    if (hasCommonPlayer) {
      return false;
    }

    // Pour tous les joueurs des deux matchs
    const allPlayerIds = [...match1PlayerIds, ...match2PlayerIds];

    // Vérifier si un des joueurs a joué dans les 40 minutes précédentes
    const recentTime = Math.min(
      match1.startTime,
      match2 ? match2.startTime : Infinity
    );
    const previousMatches = schedule.filter(
      (m) =>
        m.startTime < recentTime && m.startTime >= recentTime - MATCH_DURATION
    );

    // Si un joueur a joué dans le match précédent, on ne peut pas jouer
    return !previousMatches.some((m) =>
      m.players.some((p) => allPlayerIds.includes(p.id.split("-")[2]))
    );
  };

  // Fonction pour vérifier si un joueur a assez de repos
  const hasEnoughRest = (
    playerId: string,
    match: OptimizedMatch,
    schedule: OptimizedMatch[]
  ): boolean => {
    // Extraire l'ID original du joueur (sans le préfixe du match)
    const originalPlayerId = playerId.split("-")[2];

    const playerLastMatch = schedule
      .filter((m) => m.startTime < match.startTime)
      .find((m) =>
        m.players.some((p) => p.id.split("-")[2] === originalPlayerId)
      );

    if (!playerLastMatch) return true;

    const restTime =
      match.startTime - (playerLastMatch.startTime + MATCH_DURATION);

    return restTime >= REST_DURATION;
  };

  const findOptimalSchedule = (
    matches: OptimizedMatch[]
  ): SolutionWithPauses => {
    // Fonction pour obtenir l'ID unique d'un joueur (type de match + équipe + numéro)
    const getPlayerId = (player: { id: string }): string => {
      const [matchType, team, num] = player.id.split("-");
      return `${team}-${num}`;
    };

    // Fonction pour obtenir le dernier match d'un joueur
    const getLastMatchTime = (
      playerId: string,
      currentRoundIndex: number,
      rounds: OptimizedMatch[][]
    ): number | null => {
      for (let i = currentRoundIndex - 1; i >= 0; i--) {
        const round = rounds[i];
        if (
          round.some((match) =>
            match.players.some((p) => getPlayerId(p) === playerId)
          )
        ) {
          return i;
        }
      }
      return null;
    };

    // Fonction pour vérifier si une paire de matchs peut être jouée ensemble
    const canPlayTogether = (
      match1: OptimizedMatch,
      match2: OptimizedMatch
    ): boolean => {
      const match1PlayerIds = match1.players.map((p) => getPlayerId(p));
      const match2PlayerIds = match2.players.map((p) => getPlayerId(p));

      for (const id1 of match1PlayerIds) {
        if (match2PlayerIds.includes(id1)) {
          return false;
        }
      }

      return true;
    };

    // Fonction pour vérifier si une solution est valide
    const isValidSolution = (rounds: OptimizedMatch[][]): number => {
      let delay = 0;
      for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
        const round = rounds[roundIndex];

        // Vérifier qu'il n'y a pas de conflit dans le même tour
        if (round.length === 2 && !canPlayTogether(round[0], round[1])) {
          return -1;
        }

        // Pour chaque match du tour
        for (const match of round) {
          // Pour chaque joueur du match
          for (const player of match.players) {
            const playerId = getPlayerId(player);
            const lastMatchRound = getLastMatchTime(
              playerId,
              roundIndex,
              rounds
            );

            // Si le joueur a joué dans un tour précédent
            if (lastMatchRound !== null) {
              // Vérifier qu'il y a au moins un tour de pause
              if (roundIndex - lastMatchRound < 2) {
                delay++;
              }
            }
          }
        }
      }
      return delay;
    };

    // Fonction pour générer toutes les permutations
    function* generatePermutations(
      arr: OptimizedMatch[]
    ): Generator<OptimizedMatch[]> {
      if (arr.length <= 1) {
        yield arr;
      } else {
        for (let i = 0; i < arr.length; i++) {
          const current = arr[i];
          const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
          for (const p of generatePermutations(remaining)) {
            yield [current, ...p];
          }
        }
      }
    }

    let permCount = 0;

    // Tester toutes les permutations possibles
    let solutions: {
      [score: number]: { [firstMatch: string]: SolutionWithPauses[] };
    } = {};

    // Fonction pour trouver les pauses nécessaires dans une solution
    const findRequiredPauses = (rounds: OptimizedMatch[][]) => {
      const pauses: SolutionWithPauses["pauses"] = [];
      const playerLastMatch: {
        [playerId: string]: { round: number; match: OptimizedMatch };
      } = {};

      rounds.forEach((round, roundIndex) => {
        round.forEach((match) => {
          match.players.forEach((player) => {
            const playerId = `${player.name}-${player.teamId}`;
            if (playerLastMatch[playerId]) {
              const lastMatch = playerLastMatch[playerId];
              if (roundIndex - lastMatch.round < 2) {
                pauses.push({
                  player: player.name,
                  fromMatch: lastMatch.match.type,
                  toMatch: match.type,
                  roundFrom: lastMatch.round,
                  roundTo: roundIndex,
                });
              }
            }
            playerLastMatch[playerId] = { round: roundIndex, match };
          });
        });
      });
      return pauses;
    };

    for (const permutation of generatePermutations(matches)) {
      permCount++;

      // Diviser en tours de 2 matchs maximum
      const rounds: OptimizedMatch[][] = [];
      for (let i = 0; i < permutation.length; i += 2) {
        const round = permutation.slice(i, i + 2);
        rounds.push(round);
      }

      // Vérifier si cette solution est valide
      let validity = isValidSolution(rounds);

      // Ne stocker que les solutions avec un score positif ou nul
      if (validity >= 0) {
        const firstMatchType = rounds[0][0].type;

        // Initialiser les structures si nécessaire
        if (!solutions[validity]) {
          solutions[validity] = {};
        }
        if (!solutions[validity][firstMatchType]) {
          solutions[validity][firstMatchType] = [];
        }

        // Ajouter la solution avec ses pauses
        solutions[validity][firstMatchType].push({
          rounds,
          pauses: findRequiredPauses(rounds),
        });
      }
    }
    console.timeEnd("Permutations");

    // Compter le nombre total de solutions par score
    const solutionCounts = Object.entries(solutions)
      .map(([score, solutions]) => {
        const count = Object.values(solutions).reduce(
          (acc, sols) => acc + sols.length,
          0
        );
        return `${count} solution${count > 1 ? "s" : ""} avec ${score} pause${
          score !== "1" ? "s" : ""
        }`;
      })
      .join(", ");

    console.log(`Testé ${permCount} permutations, trouvé ${solutionCounts}`);

    // Prendre la meilleure solution disponible (score le plus bas)
    const scores = Object.keys(solutions)
      .map(Number)
      .sort((a, b) => a - b);
    if (scores.length > 0) {
      const bestScore = scores[0];
      console.log(`Meilleures solutions (score ${bestScore}):`);

      Object.entries(solutions[bestScore]).forEach(
        ([matchType, matchSolutions]) => {
          console.log(
            `  ${matchType}: ${matchSolutions.length} solution${
              matchSolutions.length > 1 ? "s" : ""
            }`
          );
          // Afficher les pauses pour la première solution de ce type
          if (matchSolutions.length > 0) {
            console.log("  Pauses nécessaires:");
            matchSolutions[0].pauses.forEach((pause) => {
              console.log(
                `    ${pause.player}: entre ${pause.fromMatch} (tour ${
                  pause.roundFrom + 1
                }) et ${pause.toMatch} (tour ${pause.roundTo + 1})`
              );
            });
          }
        }
      );

      const firstMatchType = Object.keys(solutions[bestScore])[0];
      return solutions[bestScore][firstMatchType][0];
    }

    throw new Error("Aucune solution valide trouvée");
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, "0")}`;
  };

  const [solution, setSolution] = React.useState<SolutionWithPauses | null>(
    null
  );
  const [isCalculating, setIsCalculating] = React.useState(false);

  const handleOptimize = useCallback(async () => {
    setIsCalculating(true);
    try {
      const optimalSchedule = findOptimalSchedule(matches);
      setSolution(optimalSchedule);
    } finally {
      setIsCalculating(false);
    }
  }, [matches]);

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

              {round.map((match, matchIndex) => (
                <PlanningMatch
                  key={`match-${match.type}-${index * 2 + matchIndex}`}
                  match={match}
                />
              ))}
            </React.Fragment>
          ))
        )}
      </div>
      {solution && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Durée totale :</div>
        </div>
      )}

      <button
        onClick={handleOptimize}
        className="bg-sky-500 text-white mt-5 w-full px-4 py-2 rounded-md hover:bg-sky-400 disabled:bg-sky-300"
        disabled={isCalculating}
      >
        {isCalculating ? "Calcul en cours..." : "Ordre des matchs"}
      </button>
    </div>
  );
};

export default Planning;
