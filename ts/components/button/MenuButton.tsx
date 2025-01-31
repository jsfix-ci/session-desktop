import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { CSSProperties } from 'styled-components';
import { resetOverlayMode, setOverlayMode } from '../../state/ducks/section';
import { getOverlayMode } from '../../state/selectors/section';
import { SessionIcon } from '../icon';
// tslint:disable: use-simple-attributes

const StyledMenuButton = styled.button`
  position: relative;
  display: inline-block;

  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-color);

  border-radius: 2px;
  width: 51px;
  height: 33px;
  cursor: pointer;

  transition: var(--default-duration);

  :hover {
    background: var(--hover-bg-color);
  }
`;

/**
 * This is the Session Menu Botton. i.e. the button on top of the conversation list to start a new conversation.
 * It has two state: selected or not and so we use an checkbox input to keep the state in sync.
 */
export const MenuButton = () => {
  const overlayMode = useSelector(getOverlayMode);
  const dispatch = useDispatch();

  const isToggled = Boolean(overlayMode);

  const onClickFn = () =>
    dispatch(isToggled ? resetOverlayMode() : setOverlayMode('choose-action'));

  return (
    <StyledMenuButton
      data-testid="new-conversation-button"
      style={
        {
          '--bg-color': 'var(--color-accent-button)',
          '--hover-bg-color': 'var(--color-accent-button)',
          '--fg-color': 'white',
        } as CSSProperties
      }
      onClick={onClickFn}
    >
      <SessionIcon
        iconSize="small"
        iconType="plusFat"
        iconColor="var(--fg-color)"
        iconRotation={isToggled ? 45 : 0}
        aria-label={window.i18n('chooseAnAction')}
      />
    </StyledMenuButton>
  );
};
