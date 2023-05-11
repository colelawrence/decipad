import { useMemo } from 'react';
import { Path } from 'slate';
import { InlineMenuGroup, InlineMenuItem } from '@decipad/ui';
import { css } from '@emotion/react';
import { MyEditor } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { groups } from 'libs/ui/src/templates/SlashCommandsMenu/SlashCommandsMenu';
import { execute } from '../../utils';

const Insert = ({
  computer,
  editor,
  search,
  path,
}: {
  computer: Computer;
  editor: MyEditor;
  search: string;
  path: Path;
}) => {
  const filteredItems = useMemo(() => {
    const insertOptions = groups();
    if (!search) {
      return insertOptions;
    }

    return insertOptions.map((groups) => {
      return {
        ...groups,
        items: groups.items.filter((item) =>
          item.title.toLowerCase().includes(search.toLowerCase())
        ),
      };
    });
  }, [search]);

  return (
    <div css={fade_up}>
      {filteredItems.map(
        ({ ...group }, i) =>
          group.items.length >= 1 && (
            <InlineMenuGroup key={i} {...group}>
              {group.items.map(({ ...item }) => (
                <InlineMenuItem
                  {...item}
                  data-testid={`sidebar-menu-item-${item.command}`}
                  key={item.command}
                  focused={false}
                  onExecute={() => {
                    path &&
                      execute({
                        sidebar: true,
                        editor,
                        path,
                        command: item.command,
                        getAvailableIdentifier:
                          computer.getAvailableIdentifier.bind(computer),
                      });
                  }}
                />
              ))}
            </InlineMenuGroup>
          )
      )}
    </div>
  );
};

const fade_up = css({
  animation: 'fade-up 0.3s ease',
  '@keyframes fade-up': {
    '0%': {
      opacity: '0',
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: '1',
      transform: 'translateY(0)',
    },
  },
});

export default Insert;
