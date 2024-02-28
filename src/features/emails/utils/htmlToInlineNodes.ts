import { EmailContentInlineNode, InlineNodeKind } from '../types';

export default function htmlToInlineNodes(html: string) {
  const inlineNodes: EmailContentInlineNode[] = [];

  const div = document.createElement('div');
  div.innerHTML = html;
  const childNodeArray = Array.from(div.childNodes);

  childNodeArray.forEach((node) => {
    if (node.nodeName === '#text') {
      inlineNodes.push({
        kind: InlineNodeKind.STRING,
        value: node.nodeValue || '',
      });
    }

    if (node.nodeName === 'BR') {
      inlineNodes.push({
        kind: InlineNodeKind.LINE_BREAK,
      });
    }

    if (node.nodeName === 'I') {
      inlineNodes.push({
        content: htmlToInlineNodes(node.textContent || ''),
        kind: InlineNodeKind.ITALIC,
      });
    }

    if (node.nodeName === 'B') {
      inlineNodes.push({
        content: htmlToInlineNodes(node.textContent || ''),
        kind: InlineNodeKind.BOLD,
      });
    }
  });

  return inlineNodes;
}
