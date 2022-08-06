import * as React from 'react';
import { Spinner } from '@patternfly/react-core';

export const InProgress: React.FC<{ text: string }> = ({ text }) => (
  <span>
    <Spinner isSVG size="md" aria-label={text} />
    &nbsp;
    {text}
  </span>
);
