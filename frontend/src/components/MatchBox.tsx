import React from "react";
import { OptimizedMatch, Player } from "../types";
import PlayerSlot from "./PlayerSlot";

interface MatchBoxProps {
  match: OptimizedMatch;
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
}

const MatchBox: React.FC<MatchBoxProps> = ({
  match,
  onRemovePlayer,
  onUpdatePlayer,
}) => {
  return (
    <div
      className={`
        flex 
        ${match.hasConflict ? "text-red-500" : "text-gray-700"}
      `}
    >
      <div className="flex items-center rounded-s-lg  shadow-sm bg-gray-100">
        <h3 className="-rotate-90 whitespace-nowrap text-lg font-medium origin-top-left translate-y-full">
          {match.type}
        </h3>
      </div>

      <div
        className={`
        flex-1 p-4 bg-white rounded-e-lg shadow-sm
        ${
          match.hasConflict
            ? "border-2 border-red-500"
            : "border border-gray-200"
        }
      `}
      >
        {match.hasConflict && (
          <div className="text-sm text-red-500 mb-2">
            {match.conflictReason}
          </div>
        )}

        <div className="gap-2">
          {match.allowedPlayers.map((allowedPlayer, index) => {
            const currentPlayer = match.players[index];
            return (
              <PlayerSlot
                key={`${match.type}-${allowedPlayer.teamId}-${allowedPlayer.isFemale}-${index}`}
                droppableId={`${match.type}-${allowedPlayer.teamId}-${allowedPlayer.isFemale}-${index}`}
                allowedPlayer={allowedPlayer}
                currentPlayer={currentPlayer}
                onRemove={
                  currentPlayer
                    ? () => onRemovePlayer(currentPlayer.id)
                    : undefined
                }
                onUpdatePlayer={onUpdatePlayer}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchBox;
