import { useState } from "react";
import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Team, Player, MatchType } from "./types";
import { UserIcon } from "@heroicons/react/24/outline";

interface OptimizedMatch {
  type: MatchType;
  players: Player[];
  hasConflict: boolean;
  conflictReason?: string;
  court: number;
  startTime: number; // en minutes depuis le début
}

interface ScheduleSolution {
  matches: OptimizedMatch[];
  totalDuration: number;
}

const MATCH_DURATION = 40; // minutes
const REST_DURATION = 20; // minutes

function App() {
  const TEAM_COLORS = {
    team1: "#a7c957",
    team2: "#219ebc",
  };

  const [matches, setMatches] = useState([
    { type: "SH1" as const, label: "Simple Homme 1", players: [] },
    { type: "SH2" as const, label: "Simple Homme 2", players: [] },
    { type: "SD1" as const, label: "Simple Dame 1", players: [] },
    { type: "SD2" as const, label: "Simple Dame 2", players: [] },
    { type: "DH" as const, label: "Double Hommes", players: [] },
    { type: "DD" as const, label: "Double Dames", players: [] },
    { type: "MX1" as const, label: "Mixte 1", players: [] },
    { type: "MX2" as const, label: "Mixte 2", players: [] },
  ]);

  const createDefaultPlayers = (teamId: string) => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `${teamId}-player-${i + 1}`,
      name: `Joueur ${i + 1}`,
      isFemale: i < 3 ? false : true,
      teamId,
    }));
  };

  const [teams, setTeams] = useState<Team[]>([
    {
      id: "team1",
      name: "Équipe 1",
      players: createDefaultPlayers("team1"),
    },
    {
      id: "team2",
      name: "Équipe 2",
      players: createDefaultPlayers("team2"),
    },
  ]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // Si c'est un drag depuis une équipe vers un match
    if (source.droppableId.endsWith("-players")) {
      const teamId = source.droppableId.split("-")[0];
      const matchType = destination.droppableId.split("-")[1] as MatchType;
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      const player = team.players[source.index];
      if (!player) return;

      // Vérifier si le joueur peut être ajouté au match
      const match = matches.find((m) => m.type === matchType);
      if (!match) return;

      if (!isValidMatchComposition(matchType, player, match.players)) return;

      // Ajouter le joueur au match
      setMatches(
        matches.map((m) =>
          m.type === matchType ? { ...m, players: [...m.players, player] } : m
        )
      );
    }
    // Si c'est un drag entre deux matches
    else if (destination.droppableId.startsWith("match-")) {
      const srcMatchType = source.droppableId.split("-")[1] as MatchType;
      const destMatchType = destination.droppableId.split("-")[1] as MatchType;

      // Si même match, réorganiser les joueurs
      if (srcMatchType === destMatchType) {
        const match = matches.find((m) => m.type === srcMatchType);
        if (!match) return;

        const newPlayers = Array.from(match.players);
        const [removed] = newPlayers.splice(source.index, 1);
        newPlayers.splice(destination.index, 0, removed);

        setMatches(
          matches.map((m) =>
            m.type === srcMatchType ? { ...m, players: newPlayers } : m
          )
        );
        return;
      }

      // Si match différent, vérifier la composition
      const srcMatch = matches.find((m) => m.type === srcMatchType);
      const destMatch = matches.find((m) => m.type === destMatchType);
      if (!srcMatch || !destMatch) return;

      const player = srcMatch.players[source.index];
      if (!player) return;

      if (!isValidMatchComposition(destMatchType, player, destMatch.players)) return;

      setMatches(
        matches.map((m) => {
          if (m.type === srcMatchType) {
            return {
              ...m,
              players: m.players.filter((_, i) => i !== source.index),
            };
          }
          if (m.type === destMatchType) {
            const newPlayers = Array.from(m.players);
            newPlayers.splice(destination.index, 0, player);
            return { ...m, players: newPlayers };
          }
          return m;
        })
      );
    }
  };

  const matchConfigs: Record<
    MatchType,
    {
      team1: { men: number; women: number };
      team2: { men: number; women: number };
      vertical: boolean;
    }
  > = {
    SH1: {
      team1: { men: 1, women: 0 },
      team2: { men: 1, women: 0 },
      vertical: true,
    },
    SH2: {
      team1: { men: 1, women: 0 },
      team2: { men: 1, women: 0 },
      vertical: true,
    },
    SD1: {
      team1: { men: 0, women: 1 },
      team2: { men: 0, women: 1 },
      vertical: true,
    },
    SD2: {
      team1: { men: 0, women: 1 },
      team2: { men: 0, women: 1 },
      vertical: true,
    },
    DH: {
      team1: { men: 2, women: 0 },
      team2: { men: 2, women: 0 },
      vertical: true,
    },
    DD: {
      team1: { men: 0, women: 2 },
      team2: { men: 0, women: 2 },
      vertical: true,
    },
    MX1: {
      team1: { men: 1, women: 1 },
      team2: { men: 1, women: 1 },
      vertical: true,
    },
    MX2: {
      team1: { men: 1, women: 1 },
      team2: { men: 1, women: 1 },
      vertical: true,
    },
  };

  const getSlotConfig = (type: MatchType) => {
    switch (type) {
      case "SH1":
      case "SH2":
        return {
          team1: { men: 1, women: 0 },
          team2: { men: 1, women: 0 },
          vertical: false,
        };
      case "SD1":
      case "SD2":
        return {
          team1: { men: 0, women: 1 },
          team2: { men: 0, women: 1 },
          vertical: false,
        };
      case "DH":
        return {
          team1: { men: 2, women: 0 },
          team2: { men: 2, women: 0 },
          vertical: true,
        };
      case "DD":
        return {
          team1: { men: 0, women: 2 },
          team2: { men: 0, women: 2 },
          vertical: true,
        };
      case "MX1":
      case "MX2": {
        return {
          team1: { men: 1, women: 1 },
          team2: { men: 1, women: 1 },
          vertical: true,
        };
      }
      default:
        return {
          team1: { men: 0, women: 0 },
          team2: { men: 0, women: 0 },
          vertical: false,
        };
    }
  };

  const renderSlots = (teamId: "team1" | "team2", teamColor: string) => {
    const slots = [];

    // Slots pour les hommes
    for (let i = 0; i < matchConfigs[matches[0].type].team1.men; i++) {
      slots.push(
        <Droppable
          key={`${teamId}-men-${i}`}
          droppableId={`${matches[0].type}-${teamId}-men-${i}`}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex items-center justify-center p-2 border-2 border-${teamColor} rounded-md ${
                snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"
              }`}
            >
              <UserIcon className="w-5 h-5 text-gray-400" />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    // Slots pour les femmes
    for (let i = 0; i < matchConfigs[matches[0].type].team1.women; i++) {
      slots.push(
        <Droppable
          key={`${teamId}-women-${i}`}
          droppableId={`${matches[0].type}-${teamId}-women-${i}`}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex items-center justify-center p-2 border-2 border-${teamColor} rounded-md ${
                snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"
              }`}
            >
              <UserIcon className="w-5 h-5 text-gray-400" />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    return slots;
  };

  const MatchSlots: React.FC<{
    matchType: MatchType;
    teamColors: typeof TEAM_COLORS;
  }> = ({ matchType, teamColors }) => {
    const config = getSlotConfig(matchType);

    return (
      <div className="flex gap-4">
        <div
          className={`flex flex-col gap-4 ${config.vertical ? "h-full" : ""}`}
        >
          {renderSlots("team1", teamColors.team1)}
        </div>
        <div
          className={`flex flex-col gap-4 ${config.vertical ? "h-full" : ""}`}
        >
          {renderSlots("team2", teamColors.team2)}
        </div>
      </div>
    );
  };

  const findPlayer = (playerId: string): [Player | undefined, number] => {
    for (let i = 0; i < teams.length; i++) {
      const player = teams[i].players.find((p) => p.id === playerId);
      if (player) return [player, i];
    }
    return [undefined, -1];
  };

  const updatePlayerName = (
    teamIndex: number,
    playerIndex: number,
    newName: string
  ) => {
    setTeams(
      teams.map((team, index) => {
        if (index === teamIndex) {
          const updatedPlayers = [...team.players];
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            name: newName,
          };
          return { ...team, players: updatedPlayers };
        }
        return team;
      })
    );

    // Mettre à jour le nom dans les matchs
    const playerId = teams[teamIndex].players[playerIndex].id;
    setMatches((prev) => {
      const updated = { ...prev };
      for (const matchType in updated) {
        updated[matchType] = updated[matchType].map((p) =>
          p.id === playerId ? { ...p, name: newName } : p
        );
      }
      return updated;
    });
  };

  const updateTeamName = (teamIndex: number, newName: string) => {
    setTeams(
      teams.map((team, index) =>
        index === teamIndex ? { ...team, name: newName } : team
      )
    );
  };

  const updatePlayerGender = (
    teamIndex: number,
    playerId: string,
    newGender: "M" | "F"
  ) => {
    setTeams(
      teams.map((team, index) =>
        index === teamIndex
          ? {
              ...team,
              players: team.players.map((player) =>
                player.id === playerId
                  ? { ...player, isFemale: newGender === "F" }
                  : player
              ),
            }
          : team
      )
    );
  };

  const addPlayer = (teamIndex: number) => {
    setTeams(
      teams.map((team, index) => {
        if (index === teamIndex) {
          const newPlayerId = `${team.id}-player-${team.players.length + 1}`;
          return {
            ...team,
            players: [
              ...team.players,
              {
                id: newPlayerId,
                name: `Joueur ${team.players.length + 1}`,
                isFemale: false,
                teamId: team.id,
              },
            ],
          };
        }
        return team;
      })
    );
  };

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
    player: Player,
    match: OptimizedMatch,
    schedule: OptimizedMatch[]
  ): boolean => {
    // Extraire l'ID original du joueur (sans le préfixe du match)
    const originalPlayerId = player.id.split("-")[2];

    const playerLastMatch = schedule
      .filter((m) => m.startTime < match.startTime)
      .find((m) =>
        m.players.some((p) => p.id.split("-")[2] === originalPlayerId)
      );

    if (!playerLastMatch) return true;

    const restTime =
      match.startTime - (playerLastMatch.startTime + MATCH_DURATION);
    console.log(
      `Temps de repos pour ${player.name} entre ${playerLastMatch.type} et ${match.type}: ${restTime} minutes`
    );

    return restTime >= REST_DURATION;
  };

  const findOptimalSchedule = (matches: OptimizedMatch[]): ScheduleSolution => {
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
          console.log(
            `Conflit entre ${match1.type} et ${match2.type}: ${id1} est dans les deux matchs`
          );
          return false;
        }
      }

      return true;
    };

    // Fonction pour vérifier si une solution est valide
    const isValidSolution = (rounds: OptimizedMatch[][]): boolean => {
      for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
        const round = rounds[roundIndex];

        // Vérifier qu'il n'y a pas de conflit dans le même tour
        if (round.length === 2 && !canPlayTogether(round[0], round[1])) {
          return false;
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
                console.log(
                  `${player.name} n'a pas assez de repos (dernier match: tour ${lastMatchRound}, actuel: ${roundIndex})`
                );
                return false;
              }
            }
          }
        }
      }
      return true;
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
    let validCount = 0;

    // Tester toutes les permutations possibles
    let bestSolution: OptimizedMatch[][] | null = null;
    let bestDuration = Infinity;

    console.time("Permutations");
    for (const permutation of generatePermutations(matches)) {
      permCount++;

      // Diviser la permutation en tours
      const rounds: OptimizedMatch[][] = [];
      for (let i = 0; i < permutation.length; i += 2) {
        const round: OptimizedMatch[] = [permutation[i]];
        if (i + 1 < permutation.length) {
          round.push(permutation[i + 1]);
        }
        rounds.push(round);
      }

      // Vérifier si cette solution est valide
      if (isValidSolution(rounds)) {
        validCount++;
        // Convertir les tours en planning avec temps et courts
        const schedule: OptimizedMatch[] = [];
        rounds.forEach((round, roundIndex) => {
          round.forEach((match, matchIndex) => {
            schedule.push({
              ...match,
              startTime: roundIndex * MATCH_DURATION,
              court: matchIndex + 1,
            });
          });
        });

        const duration = Math.max(
          ...schedule.map((m) => m.startTime + MATCH_DURATION)
        );
        if (duration < bestDuration) {
          bestDuration = duration;
          bestSolution = rounds;
        }
      }
    }
    console.timeEnd("Permutations");
    console.log(
      `Testé ${permCount} permutations, trouvé ${validCount} solutions valides`
    );

    if (!bestSolution) {
      throw new Error("Aucune solution valide trouvée");
    }

    // Convertir la meilleure solution en planning final
    const finalSchedule: OptimizedMatch[] = [];
    bestSolution.forEach((round, roundIndex) => {
      round.forEach((match, matchIndex) => {
        finalSchedule.push({
          ...match,
          startTime: roundIndex * MATCH_DURATION,
          court: matchIndex + 1,
        });
      });
    });

    return {
      matches: finalSchedule,
      totalDuration: bestDuration,
    };
  };

  const isValidMatchComposition = (
    matchType: MatchType,
    newPlayer: Player,
    currentPlayers: Player[]
  ) => {
    const maxPlayers = matchType.startsWith("D")
      ? 4
      : matchType.startsWith("MX")
      ? 4
      : 2;
    if (currentPlayers.length >= maxPlayers) return false;

    const teamPlayersCount = currentPlayers.filter(
      (p) => p.teamId === newPlayer.teamId
    ).length;
    const maxTeamPlayers = maxPlayers / 2;
    if (teamPlayersCount >= maxTeamPlayers) return false;

    // Vérifier les règles spécifiques par type de match
    switch (matchType) {
      case "SH1":
      case "SH2":
        return !newPlayer.isFemale;
      case "SD1":
      case "SD2":
        return newPlayer.isFemale;
      case "DH":
        return !newPlayer.isFemale;
      case "DD":
        return newPlayer.isFemale;
      case "MX1":
      case "MX2": {
        const teamPlayers = currentPlayers.filter(
          (p) => p.teamId === newPlayer.teamId
        );
        if (teamPlayers.length === 0) return true;
        const hasTeamMale = teamPlayers.some((p) => !p.isFemale);
        const hasTeamFemale = teamPlayers.some((p) => p.isFemale);
        if (newPlayer.isFemale) return !hasTeamFemale;
        return !hasTeamMale;
      }
      default:
        return false;
    }
  };

  const removePlayerFromMatch = (matchType: MatchType, playerId: string) => {
    setMatches((prev) => ({
      ...prev,
      [matchType]: prev[matchType].filter((p) => p.id !== playerId),
    }));
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, "0")}`;
  };

  const loadTestData = () => {
    const team1Players = [
      { id: "team1-1", name: "Fabien", teamId: "team1", isFemale: false },
      { id: "team1-2", name: "William", teamId: "team1", isFemale: false },
      { id: "team1-3", name: "Jeremy", teamId: "team1", isFemale: false },
      { id: "team1-4", name: "Thomas", teamId: "team1", isFemale: false },
      { id: "team1-5", name: "Elisa", teamId: "team1", isFemale: true },
      { id: "team1-6", name: "Natasha", teamId: "team1", isFemale: true },
      { id: "team1-7", name: "Frederique", teamId: "team1", isFemale: true },
    ];

    const team2Players = [
      { id: "team2-1", name: "Loic", teamId: "team2", isFemale: false },
      { id: "team2-2", name: "Luc", teamId: "team2", isFemale: false },
      { id: "team2-3", name: "Eli", teamId: "team2", isFemale: false },
      { id: "team2-4", name: "Audrey", teamId: "team2", isFemale: true },
      { id: "team2-5", name: "Oceane", teamId: "team2", isFemale: true },
      { id: "team2-6", name: "Olivia", teamId: "team2", isFemale: true },
      { id: "team2-7", name: "Jade", teamId: "team2", isFemale: true },
    ];

    // Mettre à jour les équipes
    setTeams([
      { id: "team1", name: "Ouille", players: team1Players },
      { id: "team2", name: "Adversaires", players: team2Players },
    ]);

    // Mettre à jour les états de sexe pour chaque joueur
    const newPlayerGenders: Record<string, boolean> = {};
    const newSelectedGenders: Record<string, boolean> = {};

    [...team1Players, ...team2Players].forEach((player) => {
      newPlayerGenders[player.id] = player.isFemale;
      newSelectedGenders[player.id] = true;
    });

    setPlayerGenders(newPlayerGenders);
    setSelectedGender(newSelectedGenders);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto p-5">
          <div className="grid grid-cols-[250px_minmax(600px,1fr)_250px] gap-5 min-h-[calc(100vh-40px)]">
            {/* Teams Section */}
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="relative mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {team.name}
                    </h2>
                    <button
                      onClick={() => addPlayer(team.id)}
                      className="absolute right-0 top-0 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      + Joueur
                    </button>
                  </div>

                  <Droppable droppableId={`${team.id}-players`}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {team.players.map((player, index) => (
                          <Draggable
                            key={player.id}
                            draggableId={`${team.id}-${player.id}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  flex items-center gap-2 p-2
                                  bg-white border border-gray-200 rounded-md shadow-sm
                                  ${team.id === "team1"
                                    ? "border-l-4 border-l-team1"
                                    : "border-l-4 border-l-team2"
                                  }
                                `}
                              >
                                <input
                                  type="text"
                                  value={player.name}
                                  onChange={(e) =>
                                    updatePlayerName(
                                      team.id,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-2 py-1 border border-transparent rounded hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      updatePlayerGender(
                                        team.id,
                                        player.id,
                                        false
                                      )
                                    }
                                    className={`
                                      p-1.5 rounded transition-colors
                                      ${!player.isFemale
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                      }
                                      hover:bg-blue-200
                                    `}
                                  >
                                    <UserIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      updatePlayerGender(team.id, player.id, true)
                                    }
                                    className={`
                                      p-1.5 rounded transition-colors
                                      ${player.isFemale
                                        ? "bg-pink-100"
                                        : "bg-gray-100"
                                      }
                                      hover:bg-pink-200
                                    `}
                                  >
                                    <UserIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>

            {/* Matches Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-2 gap-4">
                {matches.map((match) => (
                  <div
                    key={match.type}
                    className={`
                      p-4 bg-white rounded-lg shadow-sm
                      ${match.hasConflict
                        ? "border-2 border-red-500"
                        : "border border-gray-200"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-700">
                        {match.type}
                      </h3>
                      {match.hasConflict && (
                        <div className="text-sm text-red-500">
                          {match.conflictReason}
                        </div>
                      )}
                    </div>

                    <Droppable droppableId={`match-${match.type}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`
                            min-h-[100px] p-2 rounded-md
                            ${snapshot.isDraggingOver
                              ? "bg-blue-50"
                              : "bg-gray-50"
                            }
                            transition-colors duration-200
                          `}
                        >
                          {match.players.map((player, index) => (
                            <Draggable
                              key={player.id}
                              draggableId={`${match.type}-${player.id}`}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`
                                    flex items-center justify-between p-2 mb-2
                                    bg-white rounded border
                                    ${player.teamId === "team1"
                                      ? "border-l-4 border-l-team1"
                                      : "border-l-4 border-l-team2"
                                    }
                                  `}
                                >
                                  <span>{player.name}</span>
                                  <button
                                    onClick={() => {
                                      setMatches(
                                        matches.map((m) =>
                                          m.type === match.type
                                            ? {
                                                ...m,
                                                players: m.players.filter(
                                                  (p) => p.id !== player.id
                                                ),
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                    className="text-gray-400 hover:text-gray-600 px-2"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Planning
              </h2>
              {/* Add schedule content here */}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
