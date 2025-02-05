import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { UserIcon } from "@heroicons/react/24/outline";

interface PlayerSlotProps {
  droppableId: string;
  teamColor: string;
}

const PlayerSlot: React.FC<PlayerSlotProps> = ({ droppableId, teamColor }) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            flex items-center justify-center p-2 
            border-2 rounded-md
            ${snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"}
            border-${teamColor}
          `}
        >
          <UserIcon className="w-5 h-5 text-gray-400" />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default PlayerSlot;
