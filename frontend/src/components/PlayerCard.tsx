import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Player } from "../types";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";

interface PlayerCardProps {
  player: Player;
  index: number;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  index,
  onUpdatePlayer,
}) => {
  return (
    <Draggable draggableId={player.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
          flex items-center justify-between p-3 
          bg-white rounded-left border border-gray-200
          hover:shadow-sm transition-shadow border-l-4
          ${
            player.teamId === "team1"
              ? " border-l-lime-500"
              : " border-l-indigo-400"
          }
          `}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUpdatePlayer(player.id, { isFemale: !player.isFemale })
              }
              className={`${
                player.isFemale ? "text-pink-400" : "text-blue-400"
              }`}
            >
              {player.isFemale ? <FemaleIcon /> : <MaleIcon />}
            </button>
            <input
              type="text"
              value={player.name}
              onChange={(e) =>
                onUpdatePlayer(player.id, { name: e.target.value })
              }
              className="border-none bg-transparent focus:outline-none"
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default PlayerCard;
