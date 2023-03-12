import copy from 'copy-to-clipboard';
import { Box, Button } from '@mui/material';
import React, { useState } from 'react';

import { Msg } from 'core/i18n';

import messageIds from './l10n/messageIds';

const ZUITextfieldToClipboard: React.FunctionComponent<{
  children: React.ReactNode;
  copyText: string | number | boolean;
}> = ({ children, copyText }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleClick = () => {
    copy(copyText.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      <Box
        alignItems="center"
        border={1}
        borderColor="lightgray"
        borderRadius={1}
        display="flex"
        paddingX={1}
      >
        {children}
      </Box>
      <Button onClick={handleClick} variant="outlined">
        {copied ? (
          <Msg id={messageIds.copyToClipboard.copied} />
        ) : (
          <Msg id={messageIds.copyToClipboard.copy} />
        )}
      </Button>
    </Box>
  );
};

export default ZUITextfieldToClipboard;
