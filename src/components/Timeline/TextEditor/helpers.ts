/* eslint-disable @typescript-eslint/ban-ts-comment */
import { cloneDeep } from 'lodash';
import isUrl from 'is-url';
import markdown from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { unified } from 'unified';
import {
  Descendant,
  Editor,
  Range,
  Element as SlateElement,
  Transforms,
} from 'slate';
import isHotkey, { isKeyHotkey } from 'is-hotkey';
import slate, { BlockType, NodeTypes, serialize } from 'remark-slate';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];
const HOTKEYS: { [key: string]: string } = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+shift+x': 'strikethrough',
};

/* TODO: Resolve typescript errors */

type LinkElement = { children: Descendant[]; type: 'link'; url: string };

const toggleBlock = (editor: Editor, format: string): void => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      // @ts-ignore
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      // @ts-ignore
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { children: [], type: format };

    // @ts-ignore
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: string): void => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: Editor,
  format: string,
  blockType = 'type'
): boolean => {
  const { selection } = editor;
  if (!selection) {
    return false;
  }

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        // @ts-ignore
        n[blockType] === format,
    })
  );

  return !!match;
};

const isLinkActive = (editor: Editor): boolean => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      // @ts-ignore
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
  return !!link;
};

const isMarkActive = (editor: Editor, format: string): boolean => {
  const marks = Editor.marks(editor) as { [key: string]: unknown };
  return marks ? marks[format] === true : false;
};

const unwrapLink = (editor: Editor): void => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      // @ts-ignore
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
};

const wrapLink = (editor: Editor, url: string): void => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;

  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    children: isCollapsed ? [{ text: url }] : [],
    type: 'link',
    url,
  };

  if (isCollapsed) {
    // @ts-ignore
    Transforms.insertNodes(editor, link);
  } else {
    // @ts-ignore
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const withInlines = (editor: Editor): Editor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) =>
    ['link'].includes(element.type) || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const insertLink = (editor: Editor, url: string): void => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const keyDownHandler = (editor: Editor, event: React.KeyboardEvent): void => {
  const { selection } = editor;

  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault();
      const mark = HOTKEYS[hotkey];
      toggleMark(editor, mark);
    }
  }

  // Insert new line according to convention
  if (isHotkey('shift+enter', event)) {
    event.preventDefault();
    Editor.insertText(editor, '\n');
  }

  // Default left/right behavior is unit:'character'.
  // This fails to distinguish between two cursor positions, such as
  // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
  // Here we modify the behavior to unit:'offset'.
  // This lets the user step into and out of the inline without stepping over characters.
  // You may wish to customize this further to only use unit:'offset' in specific cases.
  if (selection && Range.isCollapsed(selection)) {
    const { nativeEvent } = event;
    if (isKeyHotkey('left', nativeEvent)) {
      event.preventDefault();
      Transforms.move(editor, { reverse: true, unit: 'offset' });
      return;
    }
    if (isKeyHotkey('right', nativeEvent)) {
      event.preventDefault();
      Transforms.move(editor, { unit: 'offset' });
      return;
    }
  }
};

interface SlateEl {
  [key: string]: string | unknown;
  children?: SlateEl[];
}

function slateReplace(
  slateArray: SlateEl[],
  field: string,
  match: string | null,
  replace: string
) {
  return slateArray.map((item) => {
    if (!match && !!item[field]) {
      item[replace] = item[field];
    }
    if (item[field] === match) {
      item[field] = replace;
    }
    if (item.children) {
      item.children = slateReplace(item.children, field, match, replace);
    }
    return item;
  });
}

const markdownToSlate = (markdownString: string): Promise<SlateEl[]> =>
  unified()
    .use(markdown)
    .use(slate)
    .use(remarkGfm)
    .process(markdownString)
    .then(
      (file) => {
        let slateArray = file.result as SlateEl[];

        slateArray = slateReplace(slateArray, 'type', 'list_item', 'list-item');
        slateArray = slateReplace(
          slateArray,
          'type',
          'ul_list',
          'bulleted-list'
        );
        slateArray = slateReplace(
          slateArray,
          'type',
          'ol_list',
          'numbered-list'
        );
        slateArray = slateReplace(
          slateArray,
          'type',
          'heading_one',
          'heading-one'
        );
        slateArray = slateReplace(
          slateArray,
          'type',
          'heading_two',
          'heading-two'
        );
        slateArray = slateReplace(
          slateArray,
          'type',
          'block_quote',
          'block-quote'
        );
        slateArray = slateReplace(slateArray, 'link', null, 'url');
        return slateArray.map((item) => {
          return item;
        });
      },
      (error) => {
        throw error;
      }
    );

const slateToMarkdown = (slateArray: Descendant[]): string => {
  const nodeTypes = {
    block_quote: 'block-quote',
    heading: {
      1: 'heading-one',
      2: 'heading-two',
    },
    listItem: 'list-item',
    ol_list: 'numbered-list',
    ul_list: 'bulleted-list',
  };

  const processed = (slateArray as SlateEl[]).map((item) => {
    const itemCopy = cloneDeep(item);
    if (itemCopy.type === 'paragraph') {
      itemCopy.children = itemCopy.children?.map((child) => {
        if (child.url) {
          child.link = child.url as string;
        }
        if (child.strikethrough) {
          child.strikeThrough = true;
        }
        return child;
      });
    }
    return itemCopy;
  });
  return processed
    .map((v) => {
      return serialize(v as unknown as BlockType, {
        nodeTypes: nodeTypes as NodeTypes,
      });
    })
    .join('');
};

export {
  toggleBlock,
  toggleMark,
  insertLink,
  isBlockActive,
  isLinkActive,
  isMarkActive,
  keyDownHandler,
  LIST_TYPES,
  markdownToSlate,
  slateToMarkdown,
  TEXT_ALIGN_TYPES,
  withInlines,
  unwrapLink,
};
