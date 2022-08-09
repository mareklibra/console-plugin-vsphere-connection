import * as React from 'react';
import { Button, Popover, Spinner } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from '../i18n';

export const InProgress: React.FC<{ text: string; infoText?: string }> = ({ text, infoText }) => {
  const { t } = useTranslation();

  return (
    <span>
      <Spinner isSVG size="md" aria-label={text} />
      &nbsp;
      {text}
      {infoText && (
        <Popover aria-label={t('Help')} bodyContent={infoText}>
          <Button aria-label={t('Help')} variant="link" isInline className="co-field-level-help">
            {/* @ts-expect-error: TODO: Fix TypeScript*/}
            <OutlinedQuestionCircleIcon className="co-field-level-help__icon" />
          </Button>
        </Popover>
      )}
    </span>
  );
};
