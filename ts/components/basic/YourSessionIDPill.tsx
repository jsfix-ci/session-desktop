import React from 'react';
import styled from 'styled-components';
import { UserUtils } from '../../session/utils';

const StyledPillDividerLine = styled.div`
  border-bottom: 1px solid var(--color-pill-divider);
  line-height: 0.1em;
  flex-grow: 1;
  height: 1px;
  align-self: center;
`;

const StyledPillSpan = styled.span`
  padding: 5px 15px;
  border-radius: 50px;
  color: var(--color-pill-divider-text);
  border: 1px solid var(--color-pill-divider);
`;

const StyledPillDivider = styled.div`
  width: 100%;
  text-align: center;
  display: flex;
  margin: 35px 0;
`;

export const YourSessionIDPill = () => {
  return (
    <StyledPillDivider>
      <StyledPillDividerLine />
      <StyledPillSpan>{window.i18n('yourSessionID')}</StyledPillSpan>
      <StyledPillDividerLine />
    </StyledPillDivider>
  );
};

const StyledYourSessionIDSelectable = styled.p`
  user-select: none;
  text-align: center;
  word-break: break-all;
  font-weight: 300;
  color: var(--color-text);
  font-size: var(--font-size-sm);
`;

export const YourSessionIDSelectable = () => {
  const ourSessionID = UserUtils.getOurPubKeyStrFromCache();
  return (
    <StyledYourSessionIDSelectable data-testid="your-session-id">
      {ourSessionID.slice(0, 33)}
      <br />
      {ourSessionID.slice(33)}
    </StyledYourSessionIDSelectable>
  );
};
