import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Man, Woman } from '@styled-icons/ionicons-solid';
import { Player } from '../types';

interface PlayerSlotProps {
  slotId: string;
  isFemale: boolean;
  acceptedTeam: 'team1' | 'team2';
  player?: Player;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({ 
  slotId, 
  isFemale, 
  acceptedTeam,
  player 
}) => {
  const Icon = isFemale ? Woman : Man;
  const teamColorClass = acceptedTeam === 'team1' ? 'team1' : 'team2';

  return (
    <Droppable droppableId={slotId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            h-8 px-1.5 py-1 
            box-border
            border-2 border-dashed border-${teamColorClass}
            rounded
            ${snapshot.isDraggingOver ? `bg-${teamColorClass}/30` : `bg-${teamColorClass}/10`}
            hover:bg-${teamColorClass}/30
            flex items-center justify-center
            transition-all duration-200
            relative
          `}
        >
          <Icon className={`w-5 h-5 opacity-20 text-${teamColorClass}`} />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
