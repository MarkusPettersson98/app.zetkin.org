/* eslint-disable jsx-a11y/no-autofocus */
import { Add } from '@material-ui/icons';
import EditIcon from '@material-ui/icons/Edit';
import { useAutocomplete } from '@material-ui/lab';
import { useState } from 'react';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListSubheader,
  TextField,
} from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';

import { groupTags } from './utils';
import TagChip from './TagChip';
import TagDialog from './TagDialog';
import { EditTag, NewTag } from './types';
import { ZetkinTag, ZetkinTagGroup } from 'types/zetkin';

const TagSelect: React.FunctionComponent<{
  disabledTags: ZetkinTag[];
  groups: ZetkinTagGroup[];
  onCreateTag: (tag: NewTag) => void;
  onEditTag: (tag: EditTag) => void;
  onSelect: (tag: ZetkinTag) => void;
  tags: ZetkinTag[];
}> = ({ disabledTags, groups, onCreateTag, onEditTag, onSelect, tags }) => {
  const intl = useIntl();

  const [tagToEdit, setTagToEdit] = useState<
    ZetkinTag | Pick<ZetkinTag, 'title'> | undefined
  >(undefined);

  const {
    inputValue,
    getInputProps,
    getListboxProps,
    getRootProps,
    groupedOptions,
  } = useAutocomplete({
    getOptionLabel: (option) => option.title,
    open: true,
    options: tags,
  });

  const groupedFilteredTags = groupTags(
    groupedOptions,
    intl.formatMessage({
      id: 'misc.tags.tagsManager.ungroupedHeader',
    })
  );

  return (
    <Box {...getRootProps()}>
      <TextField
        {...getInputProps()}
        autoFocus
        fullWidth
        inputProps={{
          'data-testid': 'TagManager-TagSelect-searchField',
        }}
        placeholder={intl.formatMessage({
          id: 'misc.tags.tagsManager.addTag',
        })}
        variant="outlined"
      />
      {/* Options */}
      <List
        {...getListboxProps()}
        style={{ maxHeight: '400px', overflowY: 'scroll' }}
      >
        {Object.values(groupedFilteredTags).map((group) => {
          // Groups
          return (
            <List
              key={group.title}
              subheader={
                <ListSubheader disableSticky>{group.title}</ListSubheader>
              }
              title={group.title}
            >
              {/* Tags */}
              {group.tags.map((tag) => {
                return (
                  <ListItem key={tag.id} dense>
                    <Box
                      alignItems="center"
                      display="flex"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <TagChip
                        chipProps={{
                          disabled: disabledTags
                            .map((disabledTags) => disabledTags.id)
                            .includes(tag.id),
                          onClick: () => onSelect(tag),
                        }}
                        tag={tag}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setTagToEdit(tag);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          );
        })}
        <ListItem
          button
          data-testid="TagManager-TagSelect-createTagOption"
          dense
          onClick={() =>
            setTagToEdit({
              title: inputValue,
            })
          }
        >
          <Add />
          {inputValue ? (
            <FormattedMessage
              id="misc.tags.tagsManager.createNamedTag"
              values={{
                b: (...chunks: string[]) => (
                  <>
                    &nbsp;<b>{chunks}</b>
                  </>
                ),
                name: inputValue,
              }}
            />
          ) : (
            <FormattedMessage id="misc.tags.tagsManager.createTag" />
          )}
        </ListItem>
      </List>
      <TagDialog
        groups={groups}
        onClose={() => setTagToEdit(undefined)}
        onSubmit={(tag) => {
          if ('id' in tag) {
            // If existing tag
            onEditTag(tag);
          } else {
            // If new tag
            onCreateTag(tag);
          }
        }}
        open={Boolean(tagToEdit)}
        tag={tagToEdit}
      />
    </Box>
  );
};

export default TagSelect;
