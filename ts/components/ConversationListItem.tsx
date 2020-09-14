import React from 'react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { Portal } from 'react-portal';

import { Avatar } from './Avatar';
import { MessageBody } from './conversation/MessageBody';
import { Timestamp } from './conversation/Timestamp';
import { ContactName } from './conversation/ContactName';
import { TypingAnimation } from './conversation/TypingAnimation';

import { LocalizerType } from '../types/Util';
import {
  getBlockMenuItem,
  getClearNicknameMenuItem,
  getCopyMenuItem,
  getDeleteContactMenuItem,
  getDeleteMessagesMenuItem,
  getInviteContactMenuItem,
  getLeaveGroupMenuItem,
} from '../session/utils/Menu';
import { ConversationAttributes } from '../../js/models/conversations';
import { GroupUtils } from '../session/utils';
import { PubKey } from '../session/types';
import { UserUtil } from '../util';

export type PropsData = {
  id: string;
  phoneNumber: string;
  color?: string;
  profileName?: string;
  name?: string;
  type: 'group' | 'direct';
  avatarPath?: string;
  isMe: boolean;
  isPublic?: boolean;
  isRss?: boolean;
  isClosable?: boolean;
  primaryDevice?: string;

  lastUpdated: number;
  unreadCount: number;
  mentionedUs: boolean;
  isSelected: boolean;

  isTyping: boolean;
  lastMessage?: {
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
    text: string;
    isRss: boolean;
  };

  isBlocked?: boolean;
  isOnline?: boolean;
  hasNickname?: boolean;
  isSecondary?: boolean;
  isGroupInvitation?: boolean;
  isKickedFromGroup?: boolean;
};

type PropsHousekeeping = {
  i18n: LocalizerType;
  style?: Object;
  onClick?: (id: string) => void;
  onDeleteMessages?: () => void;
  onDeleteContact?: () => void;
  onBlockContact?: () => void;
  onChangeNickname?: () => void;
  onClearNickname?: () => void;
  onCopyPublicKey?: () => void;
  onUnblockContact?: () => void;
  onInviteContacts?: () => void;
};

type Props = PropsData & PropsHousekeeping;

type State = {
  closedMemberConversations?: Array<ConversationAttributes>;
};

export class ConversationListItem extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { closedMemberConversations: undefined };
  }

  public componentDidMount() {
    void this.fetchClosedConversationDetails();
  }

  public async fetchClosedConversationDetails() {
    if (!this.props.isPublic && this.props.type === 'group') {
      const groupId = this.props.phoneNumber;
      let members = await GroupUtils.getGroupMembers(PubKey.cast(groupId));
      const ourPrimary = await UserUtil.getPrimary();
      members = members.filter(m => m.key !== ourPrimary.key);
      members.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
      const membersConvos = members.map(
        m => window.ConversationController.get(m.key).cachedProps
      );
      // no need to forward more than 2 conversation for rendering the group avatar
      membersConvos.slice(0, 2);
      this.setState({ closedMemberConversations: membersConvos });
    }
  }

  public renderAvatar() {
    const {
      avatarPath,
      color,
      type,
      i18n,
      isMe,
      name,
      phoneNumber,
      profileName,
      isPublic,
    } = this.props;

    const iconSize = 36;

    return (
      <div className="module-conversation-list-item__avatar-container">
        <Avatar
          avatarPath={avatarPath}
          color={color}
          noteToSelf={isMe}
          conversationType={type}
          i18n={i18n}
          name={name}
          phoneNumber={phoneNumber}
          profileName={profileName}
          size={iconSize}
          isPublic={isPublic}
          closedMemberConversations={this.state.closedMemberConversations}
        />
      </div>
    );
  }

  public renderUnread() {
    const { unreadCount, mentionedUs } = this.props;

    if (unreadCount > 0) {
      const atSymbol = mentionedUs ? <p className="at-symbol">@</p> : null;

      return (
        <div>
          <p className="module-conversation-list-item__unread-count">
            {unreadCount}
          </p>
          {atSymbol}
        </div>
      );
    }

    return null;
  }

  public renderHeader() {
    const { unreadCount, i18n, isMe, lastUpdated } = this.props;

    return (
      <div className="module-conversation-list-item__header">
        <div
          className={classNames(
            'module-conversation-list-item__header__name',
            unreadCount > 0
              ? 'module-conversation-list-item__header__name--with-unread'
              : null
          )}
        >
          {this.renderUser()}
        </div>
        {this.renderUnread()}
        {
          <div
            className={classNames(
              'module-conversation-list-item__header__date',
              unreadCount > 0
                ? 'module-conversation-list-item__header__date--has-unread'
                : null
            )}
          >
            {
              <Timestamp
                timestamp={lastUpdated}
                extended={false}
                module="module-conversation-list-item__header__timestamp"
                i18n={i18n}
              />
            }
          </div>
        }
      </div>
    );
  }

  public renderContextMenu(triggerId: string) {
    const {
      i18n,
      isBlocked,
      isMe,
      isClosable,
      isRss,
      isPublic,
      hasNickname,
      type,
      isKickedFromGroup,
      onDeleteContact,
      onDeleteMessages,
      onBlockContact,
      onClearNickname,
      onCopyPublicKey,
      onUnblockContact,
      onInviteContacts,
    } = this.props;

    const isPrivate = type === 'direct';

    return (
      <ContextMenu id={triggerId}>
        {getBlockMenuItem(
          isMe,
          isPrivate,
          isBlocked,
          onBlockContact,
          onUnblockContact,
          i18n
        )}
        {/* {!isPublic && !isRss && !isMe ? (
          <MenuItem onClick={onChangeNickname}>
            {i18n('changeNickname')}
          </MenuItem>
        ) : null} */}
        {getClearNicknameMenuItem(
          isPublic,
          isRss,
          isMe,
          hasNickname,
          onClearNickname,
          i18n
        )}
        {getCopyMenuItem(
          isPublic,
          isRss,
          type === 'group',
          onCopyPublicKey,
          i18n
        )}
        {getDeleteMessagesMenuItem(isPublic, onDeleteMessages, i18n)}
        {getInviteContactMenuItem(
          type === 'group',
          isPublic,
          onInviteContacts,
          i18n
        )}
        {getDeleteContactMenuItem(
          isMe,
          isClosable,
          type === 'group',
          isPublic,
          isRss,
          onDeleteContact,
          i18n
        )}
        {getLeaveGroupMenuItem(
          isKickedFromGroup,
          type === 'group',
          isPublic,
          isRss,
          onDeleteContact,
          i18n
        )}
      </ContextMenu>
    );
  }

  public renderMessage() {
    const { lastMessage, isTyping, unreadCount, i18n } = this.props;

    if (!lastMessage && !isTyping) {
      return null;
    }
    let text = lastMessage && lastMessage.text ? lastMessage.text : '';

    // if coming from Rss feed
    if (lastMessage && lastMessage.isRss) {
      // strip any HTML
      text = text.replace(/<[^>]*>?/gm, '');
    }

    if (isEmpty(text)) {
      return null;
    }

    return (
      <div className="module-conversation-list-item__message">
        <div
          className={classNames(
            'module-conversation-list-item__message__text',
            unreadCount > 0
              ? 'module-conversation-list-item__message__text--has-unread'
              : null
          )}
        >
          {isTyping ? (
            <TypingAnimation i18n={i18n} />
          ) : (
            <MessageBody
              isGroup={true}
              text={text}
              disableJumbomoji={true}
              disableLinks={true}
              i18n={i18n}
            />
          )}
        </div>
        {lastMessage && lastMessage.status ? (
          <div
            className={classNames(
              'module-conversation-list-item__message__status-icon',
              `module-conversation-list-item__message__status-icon--${lastMessage.status}`
            )}
          />
        ) : null}
      </div>
    );
  }

  public render() {
    const {
      phoneNumber,
      unreadCount,
      onClick,
      id,
      isSelected,
      isBlocked,
      style,
      mentionedUs,
    } = this.props;
    const triggerId = `conversation-item-${phoneNumber}-ctxmenu`;

    return (
      <div>
        <ContextMenuTrigger id={triggerId}>
          <div
            role="button"
            onClick={() => {
              if (onClick) {
                onClick(id);
              }
            }}
            style={style}
            className={classNames(
              'module-conversation-list-item',
              unreadCount > 0
                ? 'module-conversation-list-item--has-unread'
                : null,
              unreadCount > 0 && mentionedUs
                ? 'module-conversation-list-item--mentioned-us'
                : null,
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
        </ContextMenuTrigger>
        <Portal>{this.renderContextMenu(triggerId)}</Portal>
      </div>
    );
  }

  private renderUser() {
    const { name, phoneNumber, profileName, isMe, i18n } = this.props;

    const shortenedPubkey = window.shortenPubkey(phoneNumber);

    const displayedPubkey = profileName ? shortenedPubkey : phoneNumber;
    const displayName = isMe ? i18n('noteToSelf') : profileName;

    return (
      <div className="module-conversation__user">
        <ContactName
          phoneNumber={displayedPubkey}
          name={name}
          profileName={displayName}
          module="module-conversation__user"
          i18n={window.i18n}
          boldProfileName={true}
        />
      </div>
    );
  }
}
