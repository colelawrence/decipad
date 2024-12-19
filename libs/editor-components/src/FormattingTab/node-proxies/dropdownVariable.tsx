import {
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  VariableDropdownElement,
} from '@decipad/editor-types';
import { createMultipleNodeProxyFactory, ifVaries } from '../proxy';
import {
  mapVariableProperties,
  variableActions,
  setNodeProperty,
} from './utils';
import { FC } from 'react';
import { ProxyFactoryConfig, ProxyFormProps } from './types';
import { VariableForm } from './VariableForm';
import {
  cssVar,
  DropdownMenu,
  getNumberType,
  getStringType,
  InputField,
} from '@decipad/ui';
import { ProxyDropdownField } from '../proxy-fields';
import {
  CaretDown,
  Number as NumberIcon,
  TableSmall,
  Text,
} from 'libs/ui/src/icons';
import { useDropdown } from '../../Widgets/hooks/useDropdown';
import { css } from '@emotion/react';

const caretWrapper = css({
  width: 12,
  height: 12,
  position: 'absolute',
  top: '50%',
  right: 12,
  transform: 'translateY(50%)',
});

const inputWrapper = css({
  position: 'relative',
});

const input = css({
  '&[data-is-multiple="true"]': {
    color: cssVar('textDisabled'),
    '&:hover': {
      backgroundColor: cssVar('backgroundSubdued'),
      cursor: 'not-allowed',
    },
  },
  '&[data-is-multiple="false"]': {
    color: cssVar('textDefault'),
    '&:hover': {
      backgroundColor: cssVar('backgroundSubdued'),
      cursor: 'pointer',
    },
  },
});

type DropdownType = 'number' | 'text' | 'smart-selection';

export const dropdownVariableConfig = {
  key: 'dropdownVariable' as const,
  match: { type: ELEMENT_VARIABLE_DEF, variant: 'dropdown' },
  factory: createMultipleNodeProxyFactory({
    mapProperties: (node: VariableDropdownElement) => {
      const [, dropdown] = node.children;

      const dropdownType = ((): DropdownType => {
        if (dropdown.smartSelection) return 'smart-selection';
        if (node.coerceToType?.kind === 'number') return 'number';
        return 'text';
      })();

      return {
        ...mapVariableProperties(node),
        dropdownType,
        dropdownValue: dropdown.children[0].text,
      };
    },
    actions: {
      ...variableActions,
      setDropdownType: (node, editor: MyEditor, dropdownType: DropdownType) => {
        setNodeProperty(
          editor,
          node.children[1],
          'smartSelection',
          dropdownType === 'smart-selection'
        );

        // If setting to smart-selection, leave coerceToType unchanged
        if (dropdownType !== 'smart-selection') {
          setNodeProperty(
            editor,
            node,
            'coerceToType',
            {
              number: getNumberType(),
              text: getStringType(),
            }[dropdownType]
          );
        }
      },
    },
  }),
} satisfies ProxyFactoryConfig<any, any>;

const DynamicDropdownField = ({
  properties,
  nodes,
}: ProxyFormProps<typeof dropdownVariableConfig>['proxy']) => {
  const dropdownElem = nodes[0].children[1];

  const {
    dropdownOpen,
    setDropdownOpen,
    dropdownIds,
    addOption,
    removeOption,
    editOption,
    execute,
  } = useDropdown(dropdownElem);

  const dropdownValue = ifVaries(properties.dropdownValue, 'Multiple');

  return (
    <DropdownMenu
      open={dropdownOpen}
      setOpen={(value) =>
        dropdownValue !== 'Multiple' && setDropdownOpen(value)
      }
      items={dropdownIds}
      addOption={addOption}
      onRemoveOption={removeOption}
      onEditOption={editOption}
      onExecute={execute}
      isEditingAllowed={true}
    >
      <div css={inputWrapper}>
        <div>
          <InputField
            type="text"
            size="small"
            label="Value"
            value={dropdownValue}
            inputCss={input}
            disabled={nodes.length > 1}
            data-is-multiple={dropdownValue === 'Multiple'}
          />
        </div>
        <div css={caretWrapper}>
          <CaretDown />
        </div>
      </div>
    </DropdownMenu>
  );
};

export const DropdownVariableForm: FC<
  ProxyFormProps<typeof dropdownVariableConfig>
> = ({ editor, proxy }) => {
  const { properties, actions } = proxy;

  return (
    <VariableForm editor={editor} proxy={proxy}>
      <DynamicDropdownField {...proxy} />
      <ProxyDropdownField
        editor={editor}
        label="Dropdown type"
        property={properties.dropdownType}
        onChange={actions.setDropdownType}
        options={['number', 'text', 'smart-selection']}
        labelForValue={(dropdownType) =>
          ({
            number: 'Number',
            text: 'Text',
            'smart-selection': 'From existing column',
          }[dropdownType])
        }
        iconForValue={(dropdownType) =>
          ({
            number: <NumberIcon />,
            text: <Text />,
            'smart-selection': <TableSmall />,
          }[dropdownType])
        }
      />
    </VariableForm>
  );
};
