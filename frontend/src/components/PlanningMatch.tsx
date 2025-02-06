import React from "react";
import { OptimizedMatch } from "../types";

interface PlanningMatchProps {
  match: OptimizedMatch;
  pause: string[];
}

const PlanningMatch: React.FC<PlanningMatchProps> = ({ match }) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, "0")}`;
  };

  // Séparer les joueurs par équipe
  const team1Players = match.players.filter((p) => p.teamId === "team1");
  const team2Players = match.players.filter((p) => p.teamId === "team2");

  return (
    <div className="relative group">
      {/* Card principale */}
      <div
        className={`flex col-span-1 rounded-lg shadow-sm ${
          match.hasConflict ? "bg-red-50" : "bg-white"
        }`}
      >
        <div className="flex items-center rounded-s-lg shadow-sm bg-gray-100 px-2 py-1">
          <h3 className="whitespace-nowrap text-lg font-medium">
            {match.type}
          </h3>
        </div>
      </div>

      {/* Popup qui apparaît au hover */}
      <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <div className="p-4">
          <h4 className="font-medium mb-2">Joueurs</h4>
          <div className="space-y-4">
            {/* Équipe 1 */}
            <div className="border-b-2 border-lime-500">
              {team1Players.map((player) => (
                <div key={player.id} className="text-sm text-gray-600">
                  {player.name}
                </div>
              ))}
            </div>

            {/* Séparateur VS */}
            <div className="text-center font-bold text-gray-500">VS</div>

            {/* Équipe 2 */}
            <div className="border-b-2 border-indigo-400">
              {team2Players.map((player) => (
                <div key={player.id} className="text-sm text-gray-600">
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          {match.hasConflict && (
            <div className="mt-3 text-sm text-red-600 border-t pt-2">
              {match.conflictReason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningMatch;
