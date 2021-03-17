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
import { useStore } from '../../../../store';

export const AddWorkspaceButton = () => {
  const ref = useRef<HTMLInputElement>(null);
  const addWorkspace = useStore((state) => state.addWorkspace);
  const { handleSubmit, control, reset } = useForm();

  const onSubmit = (data: { name: string }) => {
    addWorkspace(data.name);
    reset();
  };

  return (
    <Popover placement="right-start" initialFocusRef={ref}>
      <PopoverTrigger>
        <Button variant="unstyled" _focus={{ outline: 'none' }}>
          <Icon as={FiPlus} />
        </Button>
      </PopoverTrigger>
      <PopoverContent _focus={{ outline: 'none' }}>
        <PopoverArrow />
        <PopoverHeader>Create Workspace</PopoverHeader>
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
