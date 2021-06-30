import React from 'react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { contextMenu } from 'react-contexify';

import { Avatar, AvatarSize } from './Avatar';
import { MessageBody } from './conversation/MessageBody';
import { Timestamp } from './conversation/Timestamp';
import { ContactName } from './conversation/ContactName';
import { TypingAnimation } from './conversation/TypingAnimation';

import {
  ConversationAvatar,
  usingClosedConversationDetails,
} from './session/usingClosedConversationDetails';
import {
  ConversationListItemContextMenu,
  PropsContextConversationItem,
} from './session/menu/ConversationListItemContextMenu';
import { createPortal } from 'react-dom';
import { OutgoingMessageStatus } from './conversation/message/OutgoingMessageStatus';
import { DefaultTheme, withTheme } from 'styled-components';
import { PubKey } from '../session/types';
import { ConversationType, openConversationExternal } from '../state/ducks/conversations';
import { SessionIcon, SessionIconSize, SessionIconType } from './session/icon';
import { useSelector } from 'react-redux';
import { SectionType } from './session/ActionsPanel';

export interface ConversationListItemProps extends ConversationType {
  index?: number; // used to force a refresh when one conversation is removed on top of the list
  memberAvatars?: Array<ConversationAvatar>; // this is added by usingClosedConversationDetails
}

type PropsHousekeeping = {
  style?: Object;
  theme: DefaultTheme;
};

type Props = ConversationListItemProps & PropsHousekeeping;

const Portal = ({ children }: { children: any }) => {
  return createPortal(children, document.querySelector('.inbox.index') as Element);
};

class ConversationListItem extends React.PureComponent<Props> {
  public constructor(props: Props) {
    super(props);
  }

  public renderAvatar() {
    const { avatarPath, name, phoneNumber, profileName, memberAvatars } = this.props;

    const userName = name || profileName || phoneNumber;

    return (
      <div className="module-conversation-list-item__avatar-container">
        <Avatar
          avatarPath={avatarPath}
          name={userName}
          size={AvatarSize.S}
          memberAvatars={memberAvatars}
          pubkey={phoneNumber}
        />
      </div>
    );
  }

  public renderHeader() {
    const { unreadCount, mentionedUs, activeAt, isPinned } = this.props;

    let atSymbol = null;
    let unreadCountDiv = null;
    if (unreadCount > 0) {
      atSymbol = mentionedUs ? <p className="at-symbol">@</p> : null;
      unreadCountDiv = <p className="module-conversation-list-item__unread-count">{unreadCount}</p>;
    }

    const isMessagesSection =
      window.inboxStore?.getState().section.focusedSection === SectionType.Message;

    const pinIcon =
      isMessagesSection && isPinned ? (
        <SessionIcon
          iconType={SessionIconType.Pin}
          iconColor={this.props.theme.colors.textColorSubtle}
          iconSize={SessionIconSize.Tiny}
        />
      ) : null;

    return (
      <div className="module-conversation-list-item__header">
        <div
          className={classNames(
            'module-conversation-list-item__header__name',
            unreadCount > 0 ? 'module-conversation-list-item__header__name--with-unread' : null
          )}
        >
          {this.renderUser()}
        </div>

        {pinIcon}
        {unreadCountDiv}
        {atSymbol}
        {
          <div
            className={classNames(
              'module-conversation-list-item__header__date',
              unreadCount > 0 ? 'module-conversation-list-item__header__date--has-unread' : null
            )}
          >
            {
              <Timestamp
                timestamp={activeAt}
                extended={false}
                isConversationListItem={true}
                theme={this.props.theme}
              />
            }
          </div>
        }
      </div>
    );
  }

  public renderMessage() {
    const { lastMessage, isTyping, unreadCount } = this.props;

    if (!lastMessage && !isTyping) {
      return null;
    }
    const text = lastMessage && lastMessage.text ? lastMessage.text : '';

    if (isEmpty(text)) {
      return null;
    }

    return (
      <div className="module-conversation-list-item__message">
        <div
          className={classNames(
            'module-conversation-list-item__message__text',
            unreadCount > 0 ? 'module-conversation-list-item__message__text--has-unread' : null
          )}
        >
          {isTyping ? (
            <TypingAnimation />
          ) : (
            <MessageBody isGroup={true} text={text} disableJumbomoji={true} disableLinks={true} />
          )}
        </div>
        {lastMessage && lastMessage.status ? (
          <OutgoingMessageStatus
            status={lastMessage.status}
            iconColor={this.props.theme.colors.textColorSubtle}
            theme={this.props.theme}
          />
        ) : null}
      </div>
    );
  }

  public render() {
    const { phoneNumber, unreadCount, id, isSelected, isBlocked, style, mentionedUs } = this.props;
    const triggerId = `conversation-item-${phoneNumber}-ctxmenu`;
    const key = `conversation-item-${phoneNumber}`;

    return (
      <div key={key}>
        <div
          role="button"
          onClick={() => {
            window.inboxStore?.dispatch(openConversationExternal(id));
          }}
          onContextMenu={(e: any) => {
            contextMenu.show({
              id: triggerId,
              event: e,
            });
          }}
          style={style}
          className={classNames(
            'module-conversation-list-item',
            unreadCount > 0 ? 'module-conversation-list-item--has-unread' : null,
            unreadCount > 0 && mentionedUs ? 'module-conversation-list-item--mentioned-us' : null,
            isSelected ? 'module-conversation-list-item--is-selected' : null,
            isBlocked ? 'module-conversation-list-item--is-blocked' : null
          )}
        >
          {this.renderAvatar()}
          <div className="module-conversation-list-item__content">
            {this.renderHeader()}
            {this.renderMessage()}
          </div>
        </div>
        <Portal>
          <ConversationListItemContextMenu {...this.getMenuProps(triggerId)} />
        </Portal>
      </div>
    );
  }

  private getMenuProps(triggerId: string): PropsContextConversationItem {
    return {
      triggerId,
      ...this.props,
    };
  }

  private renderUser() {
    const { name, phoneNumber, profileName, isMe } = this.props;

    const shortenedPubkey = PubKey.shorten(phoneNumber);

    const displayedPubkey = profileName ? shortenedPubkey : phoneNumber;
    const displayName = isMe ? window.i18n('noteToSelf') : profileName;

    let shouldShowPubkey = false;
    if ((!name || name.length === 0) && (!displayName || displayName.length === 0)) {
      shouldShowPubkey = true;
    }

    return (
      <div className="module-conversation__user">
        <ContactName
          phoneNumber={displayedPubkey}
          name={name}
          profileName={displayName}
          module="module-conversation__user"
          boldProfileName={true}
          shouldShowPubkey={shouldShowPubkey}
        />
      </div>
    );
  }
}

export const ConversationListItemWithDetails = usingClosedConversationDetails(
  withTheme(ConversationListItem)
);
