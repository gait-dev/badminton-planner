import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Player } from '../types';
import { PlayerSlot } from './PlayerSlot';

interface MatchBoxConfig {
  team1: { men: number; women: number };
  team2: { men: number; women: number };
  vertical: boolean;
}

interface MatchBoxProps {
  matchType: string;
  config: MatchBoxConfig;
  teamColors: {
    team1: string;
    team2: string;
  };
  players: Player[];
  onPlayerAdd?: (player: Player) => void;
  onPlayerRemove?: (playerId: string) => void;
}

export const MatchBox: React.FC<MatchBoxProps> = ({
  matchType,
  config,
  teamColors,
  players,
  onPlayerAdd,
  onPlayerRemove
}) => {
  const renderTeamSlots = (teamId: 'team1' | 'team2') => {
    const slots = [];

    // Men slots
    for (let i = 0; i < config[teamId].men; i++) {
      slots.push(
        <PlayerSlot
          key={`${teamId}-men-${i}`}
          slotId={`${matchType}-${teamId}-men-${i}`}
          isFemale={false}
          acceptedTeam={teamId}
        />
      );
    }

    // Women slots
    for (let i = 0; i < config[teamId].women; i++) {
      slots.push(
        <PlayerSlot
          key={`${teamId}-women-${i}`}
          slotId={`${matchType}-${teamId}-women-${i}`}
          isFemale={true}
          acceptedTeam={teamId}
        />
      );
    }

    return slots;
  };

  return (
    <div className="flex flex-col gap-2 w-full p-2 bg-white rounded-lg shadow-md border border-gray-200">
      <h4 className="text-gray-700 font-medium m-0 pb-1 border-b border-gray-200">
        {matchType}
      </h4>
      
      <div className="flex flex-col gap-2 min-h-[40px]">
        <div className="flex gap-4 w-full">
          <div className={`flex gap-1 flex-1 ${config.vertical ? 'flex-col' : 'flex-row'}`}>
            {renderTeamSlots('team1')}
          </div>
          <div className={`flex gap-1 flex-1 ${config.vertical ? 'flex-col' : 'flex-row'}`}>
            {renderTeamSlots('team2')}
          </div>
        </div>
        
        <Droppable droppableId={`${matchType}-drop`}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                flex flex-col gap-1 min-h-[40px] p-1 rounded
                ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-transparent'}
                transition-colors duration-200
              `}
            >
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`
                    flex items-center gap-1.5 p-1.5
                    bg-white rounded border border-gray-200 shadow-sm
                    ${player.teamId === 'team1' ? 'border-l-4 border-l-team1' : 'border-l-4 border-l-team2'}
                  `}
                >
                  <span className="flex-1">{player.name}</span>
                  {onPlayerRemove && (
                    <button
                      onClick={() => onPlayerRemove(player.id)}
                      className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
