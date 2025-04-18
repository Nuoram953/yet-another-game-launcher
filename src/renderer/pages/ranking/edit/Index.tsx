import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Gamepad2, ListOrdered, BookmarkPlus, ChevronRight, Plus, ArrowRight } from 'lucide-react';

// Sample game data
const initialGames = [
  { id: 'zelda-botw', name: 'The Legend of Zelda: Breath of the Wild', image: '/api/placeholder/80/80' },
  { id: 'witcher3', name: 'The Witcher 3: Wild Hunt', image: '/api/placeholder/80/80' },
  { id: 'elden-ring', name: 'Elden Ring', image: '/api/placeholder/80/80' },
  { id: 'mario-odyssey', name: 'Super Mario Odyssey', image: '/api/placeholder/80/80' },
  { id: 'rdr2', name: 'Red Dead Redemption 2', image: '/api/placeholder/80/80' },
  { id: 'bloodborne', name: 'Bloodborne', image: '/api/placeholder/80/80' },
  { id: 'gta5', name: 'Grand Theft Auto V', image: '/api/placeholder/80/80' },
  { id: 'horizon', name: 'Horizon Zero Dawn', image: '/api/placeholder/80/80' },
  { id: 'god-of-war', name: 'God of War', image: '/api/placeholder/80/80' },
  { id: 'minecraft', name: 'Minecraft', image: '/api/placeholder/80/80' },
  { id: 'hollow-knight', name: 'Hollow Knight', image: '/api/placeholder/80/80' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', image: '/api/placeholder/80/80' },
  { id: 'hades', name: 'Hades', image: '/api/placeholder/80/80' },
  { id: 'souls', name: 'Dark Souls', image: '/api/placeholder/80/80' },
  { id: 'skyrim', name: 'The Elder Scrolls V: Skyrim', image: '/api/placeholder/80/80' },
  { id: 'stardew', name: 'Stardew Valley', image: '/api/placeholder/80/80' },
  { id: 'portal2', name: 'Portal 2', image: '/api/placeholder/80/80' },
  { id: 'mass-effect2', name: 'Mass Effect 2', image: '/api/placeholder/80/80' }
];

const SortableItem = ({ id, name, image, index, removeFn }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: isDragging ? 'relative' : undefined,
    opacity: isDragging ? 0.8 : 1,
  };
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 mb-3 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 group hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
    >
      <div className="flex items-center gap-3 flex-1">
        {index !== undefined && (
          <div className="flex justify-center items-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold flex-shrink-0">
            {index + 1}
          </div>
        )}
        <div className="flex-shrink-0 rounded-md overflow-hidden w-12 h-12 bg-slate-100 dark:bg-slate-700">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 font-medium text-slate-700 dark:text-slate-200">{name}</div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="cursor-grab opacity-60 hover:opacity-100 transition-opacity touch-none p-1" 
          {...attributes} 
          {...listeners}
          type="button"
        >
          <GripVertical size={18} />
        </button>
        <button 
          onClick={() => removeFn(id)} 
          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          type="button"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

const GameCard = ({ game, onAddToRanked, onAddToPlaceholder, rankedFull }) => {
  return (
    <div className="relative group bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-3 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3">
        <div className="rounded-md overflow-hidden w-16 h-16 bg-slate-100 dark:bg-slate-700 flex-shrink-0">
          <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-800 dark:text-slate-200">{game.name}</h3>
          <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAddToPlaceholder(game)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-xs text-slate-700 dark:text-slate-300 transition-colors"
              type="button"
            >
              <BookmarkPlus size={12} />
              <span>Add to Placeholder</span>
            </button>
            <button
              onClick={() => onAddToRanked(game)}
              disabled={rankedFull}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                rankedFull 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300'
              }`}
              type="button"
            >
              <Plus size={12} />
              <span>Add to Top 10</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
    <Icon size={64} className="mb-4 opacity-50" />
    <p className="text-center max-w-xs">{message}</p>
  </div>
);

export function RankingEditPage() {
  const [ranked, setRanked] = useState([]);
  const [placeholder, setPlaceholder] = useState([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndRanked = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setRanked((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndPlaceholder = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setPlaceholder((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addToRanked = (game) => {
    if (ranked.length < 10) {
      setRanked([...ranked, game]);
    }
  };

  const addToPlaceholder = (game) => {
    setPlaceholder([...placeholder, game]);
  };

  const removeFromRanked = (id) => {
    setRanked(ranked.filter(game => game.id !== id));
  };

  const removeFromPlaceholder = (id) => {
    setPlaceholder(placeholder.filter(game => game.id !== id));
  };

  const moveToRanked = (id) => {
    if (ranked.length < 10) {
      const game = placeholder.find(g => g.id === id);
      setRanked([...ranked, game]);
      setPlaceholder(placeholder.filter(g => g.id !== id));
    }
  };

  const moveToPlaceholder = (id) => {
    const game = ranked.find(g => g.id === id);
    setPlaceholder([...placeholder, game]);
    setRanked(ranked.filter(g => g.id !== id));
  };

  const availableGames = initialGames.filter(
    game => !ranked.some(g => g.id === game.id) && !placeholder.some(g => g.id === game.id)
  );

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden flex flex-col">
      <header className="bg-white dark:bg-slate-800 py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Top 10 Games Ranking
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Create your definitive ranking of the best video games
          </p>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Column - Rankings and Placeholders */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            {/* Top 10 Ranking Section */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <ListOrdered size={20} />
                  Your Top 10 Games
                </h2>
                <div className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                  {ranked.length}/10
                </div>
              </div>
              
              <div className="bg-slate-200/50 dark:bg-slate-800/30 rounded-xl p-4 min-h-72">
                {ranked.length === 0 ? (
                  <EmptyState 
                    icon={ListOrdered}
                    message="Your top 10 list is empty. Select games from the available list to start ranking."
                  />
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndRanked}
                  >
                    <SortableContext items={ranked.map(game => game.id)} strategy={verticalListSortingStrategy}>
                      {ranked.map((game, index) => (
                        <div key={game.id} className="relative group">
                          <SortableItem 
                            id={game.id} 
                            name={game.name}
                            image={game.image}
                            index={index}
                            removeFn={removeFromRanked}
                          />
                          <button
                            onClick={() => moveToPlaceholder(game.id)}
                            className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/30 text-yellow-700 dark:text-yellow-400 py-1 px-2 rounded-md flex items-center gap-1"
                            type="button"
                          >
                            <BookmarkPlus size={12} />
                            <span>Move to Placeholder</span>
                          </button>
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
            
            {/* Placeholder Section */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <BookmarkPlus size={20} />
                  Placeholder Games
                </h2>
                <div className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                  {placeholder.length}
                </div>
              </div>
              
              <div className="bg-slate-200/50 dark:bg-slate-800/30 rounded-xl p-4 min-h-72">
                {placeholder.length === 0 ? (
                  <EmptyState 
                    icon={BookmarkPlus}
                    message="No placeholder games. Add games you're considering but haven't finalized their position."
                  />
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndPlaceholder}
                  >
                    <SortableContext items={placeholder.map(game => game.id)} strategy={verticalListSortingStrategy}>
                      {placeholder.map((game) => (
                        <div key={game.id} className="relative group">
                          <SortableItem 
                            id={game.id} 
                            name={game.name}
                            image={game.image}
                            removeFn={removeFromPlaceholder}
                          />
                          {ranked.length < 10 && (
                            <button
                              onClick={() => moveToRanked(game.id)}
                              className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 py-1 px-2 rounded-md flex items-center gap-1"
                              type="button"
                            >
                              <ArrowRight size={12} />
                              <span>Move to Top 10</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Available Games */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Gamepad2 size={20} />
                Available Games
              </h2>
              <div className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                {availableGames.length}
              </div>
            </div>
            
            <div className="bg-slate-200/50 dark:bg-slate-800/30 rounded-xl p-4 overflow-y-auto h-full">
              {availableGames.length === 0 ? (
                <EmptyState 
                  icon={Gamepad2}
                  message="All games have been added to your lists. You can remove games from your rankings to make them available again."
                />
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {availableGames.map(game => (
                    <GameCard 
                      key={game.id}
                      game={game}
                      onAddToRanked={addToRanked}
                      onAddToPlaceholder={addToPlaceholder}
                      rankedFull={ranked.length >= 10}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
