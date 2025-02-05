import React from "react";
import { OptimizedMatch } from "../types";
import MatchImporter from "./MatchImporter";
import Planning from "./Planning";

interface MatchManagerProps {
  matches: OptimizedMatch[];
  onImport: (text: string) => void;
  onOptimize: () => void;
}

const MatchManager: React.FC<MatchManagerProps> = ({
  matches,
  onImport,
  onOptimize,
}) => {
  return (
    <div className="space-y-4">
      <MatchImporter onImport={onImport} />
      <Planning matches={matches} onOptimize={onOptimize} />
    </div>
  );
};

export default MatchManager;
