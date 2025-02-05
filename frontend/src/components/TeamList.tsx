import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Man, Woman } from '@styled-icons/ionicons-solid';
import { Player, Team } from '../types';

interface TeamListProps {
  team: Team;
  teamColor: string;
  onPlayerNameChange: (playerId: string, newName: string) => void;
  onPlayerGenderChange: (playerId: string, isFemale: boolean) => void;
  onAddPlayer: (teamId: string) => void;
}

export const TeamList: React.FC<TeamListProps> = ({
  team,
  teamColor,
  onPlayerNameChange,
  onPlayerGenderChange,
  onAddPlayer,
}) => {
  const teamColorClass = team.id === 'team1' ? 'team1' : 'team2';

  return (
    <div className="flex-1 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">{team.name}</h3>
        <button
          onClick={() => onAddPlayer(team.id)}
          className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
        >
          + Joueur
        </button>
      </div>

      <Droppable droppableId={`${team.id}-players`}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-2"
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
                      flex items-center gap-2 p-2
                      bg-white border border-gray-200 rounded shadow-sm
                      border-l-4 border-l-${teamColorClass}
                      hover:bg-gray-50 transition-colors
                    `}
                  >
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => onPlayerNameChange(player.id, e.target.value)}
                      className={`
                        flex-1 px-2 py-1 
                        border border-transparent rounded
                        hover:border-gray-300 
                        focus:border-${teamColorClass} focus:outline-none 
                        transition-colors
                      `}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => onPlayerGenderChange(player.id, false)}
                        className={`
                          p-1.5 rounded transition-colors
                          ${!player.isFemale 
                            ? `bg-${teamColorClass}/30` 
                            : 'bg-gray-100'
                          }
                          hover:bg-${teamColorClass}/50
                        `}
                      >
                        <Man className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPlayerGenderChange(player.id, true)}
                        className={`
                          p-1.5 rounded transition-colors
                          ${player.isFemale 
                            ? `bg-${teamColorClass}/30` 
                            : 'bg-gray-100'
                          }
                          hover:bg-${teamColorClass}/50
                        `}
                      >
                        <Woman className="w-4 h-4" />
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
