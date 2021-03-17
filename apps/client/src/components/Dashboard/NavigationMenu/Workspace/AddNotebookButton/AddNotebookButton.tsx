import {
  Button,
  Icon,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import { useStore } from '../../../../../store';

export const AddNotebookButton = ({ id }: { id: string }) => {
  const ref = useRef<HTMLInputElement>(null);
  const addNotebook = useStore((state) => state.addNotebook);
  const { handleSubmit, control, reset } = useForm();

  const onSubmit = (data: { name: string }) => {
    addNotebook(id, data.name);
    reset();
  };

  return (
    <Popover placement="right-start" initialFocusRef={ref}>
      <PopoverTrigger>
        <Button
          variant="unstyled"
          _focus={{ outline: 'none' }}
          h="auto"
          minW="auto"
        >
          <Icon as={FiPlus} />
        </Button>
      </PopoverTrigger>
      <PopoverContent _focus={{ outline: 'none' }}>
        <PopoverArrow />
        <PopoverHeader>Create Notebook</PopoverHeader>
        <PopoverBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={(props) => (
                <Input
                  type="text"
                  ref={ref}
                  onChange={(e) => props.onChange(e.target.value)}
                  value={props.value}
                />
              )}
            />
          </form>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
