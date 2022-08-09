import * as React from 'react';
import { Button, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from './i18n';

export const PopoverHelpButton: React.FC<{ content: React.ReactNode }> = ({ content }) => {
  const { t } = useTranslation();
  return (
    <Popover aria-label={t('Help')} bodyContent={content}>
      <Button aria-label={t('Help')} variant="link" isInline className="co-field-level-help">
        {/* @ts-expect-error: TODO: Fix TypeScript*/}
        <OutlinedQuestionCircleIcon className="co-field-level-help__icon" />
      </Button>
    </Popover>
  );
};
