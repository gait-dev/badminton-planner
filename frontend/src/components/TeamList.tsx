import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Team, Player } from "../types";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

interface TeamListProps {
  team: Team;
  onAddPlayer: () => void;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
}

const TeamList: React.FC<TeamListProps> = ({ team, onAddPlayer, onUpdatePlayer }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="relative mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{team.name}</h2>
        <button
          onClick={onAddPlayer}
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
                draggableId={player.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                      flex items-center justify-between p-3 
                      bg-white rounded-lg border border-gray-200
                      hover:shadow-sm transition-shadow
                      ${team.id === "team1" ? "border-l-4 border-l-team1" : "border-l-4 border-l-team2"}
                    `}
                  >
                    <span className="text-gray-800">{player.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdatePlayer(player.id, { isFemale: false })}
                        className={`
                          p-1 rounded transition-colors text-xs
                          ${!player.isFemale 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-gray-100 text-gray-400"}
                          hover:bg-blue-50
                        `}
                      >
                        <MaleIcon></MaleIcon>
                      </button>
                      <button
                        onClick={() => onUpdatePlayer(player.id, { isFemale: true })}
                        className={`
                          p-1 rounded transition-colors text-xs
                          ${player.isFemale 
                            ? "bg-pink-100 text-pink-600" 
                            : "bg-gray-100 text-gray-400"}
                          hover:bg-pink-50
                        `}
                      >
                        <FemaleIcon></FemaleIcon>
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
  );
};

export default TeamList;
