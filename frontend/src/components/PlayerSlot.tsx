import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import { Player } from "../types";

interface PlayerSlotProps {
  droppableId: string;
  allowedPlayer: Omit<Player, "id" | "name">;
  currentPlayer?: Player;
  onRemove?: () => void;
}

const PlayerSlot: React.FC<PlayerSlotProps> = ({
  droppableId,
  allowedPlayer,
  currentPlayer,
  onRemove,
}) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            flex items-center justify-between p-1 
            border-2 border-dashed rounded-md mb-4
            ${
              snapshot.isDraggingOver
                ? "bg-blue-50"
                : currentPlayer
                ? "bg-white"
                : "bg-gray-50"
            }
            ${
              allowedPlayer.teamId === "team1"
                ? " border-lime-500"
                : " border-indigo-400"
            }
          `}
        >
          <div className="flex items-center gap-2 flex-1">
            {allowedPlayer.isFemale ? (
              <FemaleIcon className="text-pink-200" />
            ) : (
              <MaleIcon className="text-blue-200" />
            )}
            {currentPlayer && (
              <span className="text-gray-700 text-xs">{currentPlayer.name}</span>
            )}
          </div>
          {currentPlayer && onRemove && (
            <button
              onClick={onRemove}
              className={`
                text-2xl leading-none
                ${allowedPlayer.teamId === "team1" ? "text-lime-500" : "text-indigo-400"}
                hover:opacity-75
              `}
            >
              ×
            </button>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default PlayerSlot;
