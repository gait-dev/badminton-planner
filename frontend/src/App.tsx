import { useState } from "react";
import React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Team, Player, MatchType, OptimizedMatch } from "./types";
import { TeamList, MatchBox, Planning } from "./components";

interface OptimizedMatch {
  type: MatchType;
  players: Player[];
  hasConflict: boolean;
  conflictReason?: string;
  court: number;
  startTime: number;
}

const TEAM_COLORS = {
  team1: "#a7c957",
  team2: "#f4845f",
} as const;

function App() {
  const createDefaultPlayers = (teamId: string): Player[] => {
    const players: Player[] = [];
    // Create 4 male players
    for (let i = 1; i <= 3; i++) {
      players.push({
        id: `${teamId}-${i}`,
        name: `Joueur ${i}`,
        teamId,
        isFemale: false,
      });
    }
    // Create 3 female players
    for (let i = 4; i <= 6; i++) {
      players.push({
        id: `${teamId}-${i}`,
        name: `Joueur ${i}`,
        teamId,
        isFemale: true,
      });
    }
    return players;
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

  const [matches, setMatches] = useState<OptimizedMatch[]>([
    { type: "SH1", players: [], hasConflict: false, court: 1, startTime: 0 },
    { type: "SH2", players: [], hasConflict: false, court: 1, startTime: 0 },
    { type: "SD1", players: [], hasConflict: false, court: 1, startTime: 0 },
    { type: "SD2", players: [], hasConflict: false, court: 1, startTime: 0 },
    { type: "DH", players: [], hasConflict: false, court: 1, startTime: 0 },
    { type: "DD", players: [], hasConflict: false, court: 1, startTime: 0 },
    { type: "MX1", players: [], hasConflict: false, court: 1, startTime: 0 },
    { type: "MX2", players: [], hasConflict: false, court: 1, startTime: 0 },
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

  const handleAddPlayer = (teamId: string) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              players: [
                ...team.players,
                {
                  id: `${teamId}-${Date.now()}`,
                  name: `Joueur ${team.players.length + 1}`,
                  isFemale: false,
                  teamId,
                },
              ],
            }
          : team
      )
    );
  };

  const handleUpdatePlayer = (playerId: string, updates: Partial<Player>) => {
    setTeams(teams.map(team => ({
      ...team,
      players: team.players.map(player =>
        player.id === playerId ? { ...player, ...updates } : player
      )
    })));
  };

  const handleRemovePlayerFromMatch = (matchType: MatchType, playerId: string) => {
    setMatches(
      matches.map((match) =>
        match.type === matchType
          ? {
              ...match,
              players: match.players.filter((p) => p.id !== playerId),
            }
          : match
      )
    );
  };

  const isValidMatchComposition = (
    matchType: MatchType,
    newPlayer: Player,
    currentPlayers: Player[]
  ): boolean => {
    const maxPlayers = matchType.startsWith("D") || matchType.startsWith("MX")
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto p-5">
          <div className="grid grid-cols-5 gap-5 min-h-[calc(100vh-40px)]">
            {/* Team 1 Section */}
            <div className="col-span-1">
                <TeamList
                  key={teams[0].id}
                  team={teams[0]}
                  onAddPlayer={() => handleAddPlayer(teams[0].id)}
                  onUpdatePlayer={handleUpdatePlayer}
                />
            </div>

            {/* Matches Section */}
            <div className="bg-white rounded-lg shadow-md p-4 col-span-2">
              <div className="grid grid-cols-2 gap-4">
                {matches.map((match) => (
                  <MatchBox
                    key={match.type}
                    match={match}
                    onRemovePlayer={(playerId) =>
                      handleRemovePlayerFromMatch(match.type, playerId)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Team 2 Section */}
            <div className="col-span-1">
                <TeamList
                  key={teams[1].id}
                  team={teams[1]}
                  onAddPlayer={() => handleAddPlayer(teams[1].id)}
                  onUpdatePlayer={handleUpdatePlayer}
                />
            </div>


            {/* Schedule Section */}
            <div className="bg-white rounded-lg shadow-md p-4 col-span-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Planning
              </h2>
              <Planning matches={matches} />
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
