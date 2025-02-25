import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Team, Player } from "../types";
import PlayerCard from "./PlayerCard";

interface TeamListProps {
  team: Team;
  onAddPlayer: () => void;
  onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
}

const TeamList: React.FC<TeamListProps> = ({ team, onAddPlayer, onUpdateTeam, onUpdatePlayer }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4">
        <input
          type="text"
          value={team.name}
          onChange={(e) => onUpdateTeam(team.id, { name: e.target.value })}
          className="text-xl font-bold mb-2 border-none bg-transparent focus:outline-none"
        />
      </div>

      <Droppable droppableId={`${team.id}-players`}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {team.players.map((player, index) => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                index={index} 
                onUpdatePlayer={onUpdatePlayer}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
        <button
          onClick={onAddPlayer}
          className={`mt-5 px-3 py-1 text-sm text-white rounded hover:bg-green-600 transition-colors w-full 
            ${team.id === "team1" ? " bg-lime-500" : " bg-indigo-400"}
          `}
        >
          + Joueur
        </button>
    </div>
  );
};

export default TeamList;
