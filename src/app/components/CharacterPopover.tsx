import { ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { User } from 'lucide-react';

interface Character {
  name: string;
  description: string;
  role: string;
  appearances: number;
}

interface CharacterPopoverProps {
  character: Character;
  children: ReactNode;
}

export function CharacterPopover({ character, children }: CharacterPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span onClick={() => setOpen(true)}>{children}</span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{character.name}</h3>
              <p className="text-sm text-gray-500">{character.role}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {character.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
            <span>Appearances in book</span>
            <span className="font-semibold text-gray-700">{character.appearances}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
