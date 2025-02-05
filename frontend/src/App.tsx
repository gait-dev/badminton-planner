import { useState } from "react";
import React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Team, Player, MatchType, OptimizedMatch } from "./types";
import { TeamList, MatchBox, Planning, MatchManager } from "./components";
import { parseMatchText } from "./utils/matchParser";

// Ordre fixe des matchs
const MATCH_ORDER = ["SH1", "SH2", "SD1", "SD2", "DH1", "DD1", "DX1", "DX2"];

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
    {
      type: "SH1",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: false, teamId: "team1" },
        { isFemale: false, teamId: "team2" },
      ],
    },
    {
      type: "SH2",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: false, teamId: "team1" },
        { isFemale: false, teamId: "team2" },
      ],
    },
    {
      type: "SD1",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: true, teamId: "team1" },
        { isFemale: true, teamId: "team2" },
      ],
    },
    {
      type: "SD2",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: true, teamId: "team1" },
        { isFemale: true, teamId: "team2" },
      ],
    },
    {
      type: "DH1",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: false, teamId: "team1" },
        { isFemale: false, teamId: "team1" },
        { isFemale: false, teamId: "team2" },
        { isFemale: false, teamId: "team2" },
      ],
    },
    {
      type: "DD1",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: true, teamId: "team1" },
        { isFemale: true, teamId: "team1" },
        { isFemale: true, teamId: "team2" },
        { isFemale: true, teamId: "team2" },
      ],
    },
    {
      type: "DX1",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: true, teamId: "team1" },
        { isFemale: false, teamId: "team1" },
        { isFemale: true, teamId: "team2" },
        { isFemale: false, teamId: "team2" },
      ],
    },
    {
      type: "DX2",
      players: [],
      hasConflict: false,
      court: 1,
      startTime: 0,
      allowedPlayers: [
        { isFemale: true, teamId: "team1" },
        { isFemale: false, teamId: "team1" },
        { isFemale: true, teamId: "team2" },
        { isFemale: false, teamId: "team2" },
      ],
    },
  ]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // Si c'est un drag depuis une équipe vers un match
    if (source.droppableId.endsWith("-players")) {
      const teamId = source.droppableId.split("-")[0];
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      const player = team.players[source.index];

      // Parse le droppableId du match pour obtenir les contraintes
      const [matchType, allowedTeamId, allowedIsFemale, slotIndex] =
        destination.droppableId.split("-");
      const isFemaleAllowed = allowedIsFemale === "true";

      // Vérifie si le joueur correspond aux contraintes
      if (
        player.teamId !== allowedTeamId ||
        player.isFemale !== isFemaleAllowed
      ) {
        return;
      }

      // Trouve le match cible
      const targetMatch = matches.find((m) => m.type === matchType);
      if (!targetMatch) return;

      // Vérifie si le slot est déjà occupé
      if (targetMatch.players[parseInt(slotIndex)]) {
        return;
      }

      // Met à jour les joueurs du match
      setMatches(
        matches.map((match) => {
          if (match.type === matchType) {
            const newPlayers = [...match.players];
            newPlayers[parseInt(slotIndex)] = player;
            return {
              ...match,
              players: newPlayers,
            };
          }
          return match;
        })
      );
    }

    // Si c'est un drag entre matches
    else if (destination.droppableId !== source.droppableId) {
      const [sourceMatchType, , , sourceSlotIndex] =
        source.droppableId.split("-");
      const [destMatchType, allowedTeamId, allowedIsFemale, destSlotIndex] =
        destination.droppableId.split("-");

      const sourceMatch = matches.find((m) => m.type === sourceMatchType);
      if (!sourceMatch) return;

      const player = sourceMatch.players[parseInt(sourceSlotIndex)];
      if (!player) return;

      // Vérifie si le joueur correspond aux contraintes de destination
      const isFemaleAllowed = allowedIsFemale === "true";
      if (
        player.teamId !== allowedTeamId ||
        player.isFemale !== isFemaleAllowed
      ) {
        return;
      }

      setMatches(
        matches.map((match) => {
          if (match.type === sourceMatchType) {
            const newPlayers = [...match.players];
            newPlayers[parseInt(sourceSlotIndex)] = undefined as any;
            return {
              ...match,
              players: newPlayers,
            };
          }
          if (match.type === destMatchType) {
            const newPlayers = [...match.players];
            newPlayers[parseInt(destSlotIndex)] = player;
            return {
              ...match,
              players: newPlayers,
            };
          }
          return match;
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

  const handleUpdateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(
      teams.map((team) => (team.id === teamId ? { ...team, ...updates } : team))
    );
  };

  const handleUpdatePlayer = (playerId: string, updates: Partial<Player>) => {
    setTeams(
      teams.map((team) => ({
        ...team,
        players: team.players.map((player) =>
          player.id === playerId ? { ...player, ...updates } : player
        ),
      }))
    );
  };

  const handleRemovePlayerFromMatch = (
    matchType: MatchType,
    playerId: string
  ) => {
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
    const maxPlayers =
      matchType.startsWith("D") || matchType.startsWith("DX") ? 4 : 2;
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
      case "DH1":
        return !newPlayer.isFemale;
      case "DD1":
        return newPlayer.isFemale;
      case "DX1":
      case "DX2": {
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

  const handleImport = (text: string) => {
    try {
      const parsed = parseMatchText(text);

      // Update team names
      setTeams([
        { id: "team1", name: parsed.team1, players: [] },
        { id: "team2", name: parsed.team2, players: [] },
      ]);

      // Create players map to avoid duplicates
      const playersMap = new Map<string, Player>();

      // Process all matches to collect unique players
      parsed.matches.forEach((match) => {
        match.players.forEach((player) => {
          const playerId = `${player.team}-${player.name}`;

          if (!playersMap.has(playerId)) {
            playersMap.set(playerId, {
              id: playerId,
              name: player.name,
              teamId: player.team,
              isFemale: player.isFemale,
            });
          }
        });
      });

      // Update teams with their players
      setTeams((teams) =>
        teams.map((team) => ({
          ...team,
          players: Array.from(playersMap.values()).filter(
            (p) => p.teamId === team.id
          ),
        }))
      );

      // Create optimized matches
      const matchesMap = new Map<string, OptimizedMatch>();

      parsed.matches.forEach((match) => {
        const allowedPlayers: Omit<Player, "id" | "name">[] = [];
        let matchPlayers: Player[] = [];

        match.players.forEach((player, index) => {
          const playerId = `${player.team}-${player.name}`;
          const playerObj = playersMap.get(playerId);

          // Add to allowed players pattern
          allowedPlayers.push({
            teamId: player.team,
            isFemale: player.isFemale,
          });

          // Add actual player if found
          if (playerObj) {
            matchPlayers.push(playerObj);
          }
        });

        // Réorganiser les joueurs par équipe
        if (match.type.startsWith('D')) { // Pour les doubles uniquement
          const team1Players = matchPlayers.filter(p => p.teamId === 'team1');
          const team2Players = matchPlayers.filter(p => p.teamId === 'team2');
          matchPlayers = [...team1Players, ...team2Players];

          // Réorganiser aussi les allowedPlayers
          const team1Allowed = allowedPlayers.filter(p => p.teamId === 'team1');
          const team2Allowed = allowedPlayers.filter(p => p.teamId === 'team2');
          allowedPlayers.splice(0, allowedPlayers.length, ...team1Allowed, ...team2Allowed);
        }

        matchesMap.set(match.type, {
          type: match.type,
          allowedPlayers,
          players: matchPlayers,
          hasConflict: false,
          conflictReason: "",
        });
      });

      // Créer les matchs dans l'ordre fixe
      const newMatches = MATCH_ORDER.map(matchType => {
        const match = matchesMap.get(matchType);
        if (!match) {
          // Si le match n'existe pas dans l'import, créer un match vide
          return {
            type: matchType,
            allowedPlayers: [],
            players: [],
            hasConflict: false,
            conflictReason: ""
          };
        }
        return match;
      });

      setMatches(newMatches);
    } catch (error) {
      console.error("Error importing matches:", error);
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
                onUpdateTeam={(id, updates) => handleUpdateTeam(id, updates)}
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
                    onUpdatePlayer={handleUpdatePlayer}
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
                onUpdateTeam={(id, updates) => handleUpdateTeam(id, updates)}
                onUpdatePlayer={handleUpdatePlayer}
              />
            </div>

            {/* Schedule Section */}
            <div className="bg-white rounded-lg shadow-md p-4 col-span-1">
              <MatchManager
                matches={matches}
                onImport={handleImport}
                onOptimize={() => {
                  // TODO: Implement optimize logic
                  console.log("Optimize matches");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
