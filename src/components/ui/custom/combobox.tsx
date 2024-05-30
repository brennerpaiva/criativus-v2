'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../button';

interface ComboboxItem {
  id: string;
  nome: string;
  value: string;
  label: string;
  avatarUrl?: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  placeholder?: string;
  onSelect: (item: ComboboxItem) => void;
  groupHeading?: string;
}

export function Combobox({
  items,
  placeholder = 'Search...',
  onSelect,
  groupHeading = 'Items',
}: ComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  const handleSelect = (item: ComboboxItem) => {
    setValue(item.value);
    onSelect(item);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 justify-between overflow-hidden"
        >
          <Avatar className="mr-2">
            <AvatarImage
              className="rounded-full"
              width={22}
              src={
                value
                  ? items.find((item) => item.value === value)?.avatarUrl
                  : 'https://avatars.githubusercontent.com/u/114958953?v=4'
              }
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <p className="overflow-hidden flex-1">
            {value ? items.find((item) => item.value === value)?.label : 'Select item...'}
          </p>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[231px] p-0 mx-4">
        <Command>
          <CommandList>
            <CommandInput placeholder={placeholder} />
            <CommandEmpty>Sem resultados</CommandEmpty>
            <CommandGroup heading={groupHeading}>
              {items.map((item) => (
                <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                  <Avatar className="mr-2">
                    <AvatarImage
                      className="rounded-full"
                      width={30}
                      src={
                        item.avatarUrl || 'https://avatars.githubusercontent.com/u/114958953?v=4'
                      }
                    />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <p title={item.nome} className="text-sm truncate">{item.nome}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
        </Command>
      </PopoverContent>
    </Popover>
  );
}
