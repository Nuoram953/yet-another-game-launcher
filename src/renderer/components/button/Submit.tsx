import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

interface Props{
  handleOnClick:()=>Promise<void>|void
}

export const SubmitButton = ({handleOnClick}:Props) => {
  const [state, setState] = useState('idle'); // idle, loading, success

  const handleClick = () => {
    setState('loading');
    handleOnClick
    setState('success');
  };

  return (
    <button
      onClick={handleClick}
      disabled={state !== 'idle'}
      className="
        relative
        px-6
        py-2
        rounded-lg
        font-medium
        transition-all
        duration-200
        bg-blue-500 
        hover:bg-blue-600 
        text-white
      "
    >
      <span className={`
        flex
        items-center
        justify-center
        gap-2
        ${state !== 'idle' ? 'opacity-0' : 'opacity-100'}
      `}>
        Save
      </span>
      
      {state === 'loading' && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </span>
      )}
      
      {state === 'success' && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <span>Saved!</span>
          <Check className="w-5 h-5 text-green-400" />
        </span>
      )}
    </button>
  );
};
