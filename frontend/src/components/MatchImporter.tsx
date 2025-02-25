import React, { useState } from "react";
import { parseMatchText } from "../utils/matchParser";

interface MatchImporterProps {
  onImport: (text: string) => void;
}

const MatchImporter: React.FC<MatchImporterProps> = ({ onImport }) => {
  const [text, setText] = useState("");

  const handleImport = () => {
    try {
      parseMatchText(text);
      onImport(text);
    } catch (error) {
      // Gérer l'erreur silencieusement
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 p-2 border rounded-md mb-2 font-mono text-sm"
        placeholder="Collez ici le texte du match à importer..."
      />
      <button
        onClick={handleImport}
        className="bg-sky-500 text-white mt-5 w-full  px-4 py-2 rounded-md hover:bg-sky-400"
      >
        Importer
      </button>
    </div>
  );
};

export default MatchImporter;
