import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Player, MatchType } from "../types";

interface MatchBoxProps {
  match: {
    type: MatchType;
    players: Player[];
    hasConflict: boolean;
    conflictReason?: string;
  };
  onRemovePlayer: (playerId: string) => void;
}

const MatchBox: React.FC<MatchBoxProps> = ({ match, onRemovePlayer }) => {
  return (
    <div
      className={`
        p-4 bg-white rounded-lg shadow-sm
        ${match.hasConflict ? "border-2 border-red-500" : "border border-gray-200"}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-700">{match.type}</h3>
        {match.hasConflict && (
          <div className="text-sm text-red-500">{match.conflictReason}</div>
        )}
      </div>

      <Droppable droppableId={`match-${match.type}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[100px] p-2 rounded-md
              ${snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"}
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
                      ${player.teamId === "team1" ? "border-l-4 border-l-team1" : "border-l-4 border-l-team2"}
                    `}
                  >
                    <span>{player.name}</span>
                    <button
                      onClick={() => onRemovePlayer(player.id)}
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
  );
};

export default MatchBox;
