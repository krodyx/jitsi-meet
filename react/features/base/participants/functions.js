/* global MD5 */

declare var config: Object;
declare var interfaceConfig: Object;

/**
 * Returns local participant from Redux state.
 *
 * @param {(Function|Participant[])} participantsOrGetState - Either the
 * features/base/participants Redux state or Redux's getState function to be
 * used to retrieve the features/base/participants state.
 * @returns {(Participant|undefined)}
 */
export function getLocalParticipant(participantsOrGetState) {
    const participants = _getParticipants(participantsOrGetState);

    return participants.find(p => p.local);
}

/**
 * Returns participant by ID from Redux state.
 *
 * @param {(Function|Participant[])} participantsOrGetState - Either the
 * features/base/participants Redux state or Redux's getState function to be
 * used to retrieve the features/base/participants state.
 * @param {string} id - The ID of the participant to retrieve.
 * @private
 * @returns {(Participant|undefined)}
 */
export function getParticipantById(participantsOrGetState, id) {
    const participants = _getParticipants(participantsOrGetState);

    return participants.find(p => p.id === id);
}

/**
 * Returns array of participants from Redux state.
 *
 * @param {(Function|Participant[])} participantsOrGetState - Either the
 * features/base/participants Redux state or Redux's getState function to be
 * used to retrieve the features/base/participants state.
 * @private
 * @returns {Participant[]}
 */
function _getParticipants(participantsOrGetState) {
    const participants
        = typeof participantsOrGetState === 'function'
            ? participantsOrGetState()['features/base/participants']
            : participantsOrGetState;

    return participants || [];
}

/**
 * Returns the URL of the image for the avatar of a particular participant
 * identified by their id and/or e-mail address.
 *
 * @param {Object} [options] - The optional arguments.
 * @param {string} [options.avatarId] - Participant's avatar id.
 * @param {string} [options.avatarUrl] - Participant's avatar url.
 * @param {string} [options.email] - Participant's email.
 * @param {string} [options.participantId] - Participant's id.
 * @returns {string} The URL of the image for the avatar of the participant
 * identified by the specified participantId and/or email.
 *
 * @public
 */
export function getAvatarURL(options = {}) {
    if (typeof config === 'object' && config.disableThirdPartyRequests) {
        return 'images/avatar2.png';
    }

    const { avatarId, avatarUrl, email, participantId } = options;

    // The priority is url, email and lowest is avatarId
    if (avatarUrl) {
        return avatarUrl;
    }

    let avatar = null;

    if (email) {
        avatar = email;
    } else {
        avatar = avatarId;
    }

    // If the ID looks like an email, we'll use gravatar.
    // Otherwise, it's a random avatar, and we'll use the configured
    // URL.
    const random = !avatar || avatar.indexOf('@') < 0;

    if (!avatar) {
        if (participantId) {
            avatar = participantId;
        } else {
            return undefined;
        }
    }

    avatar = MD5.hexdigest(avatar.trim().toLowerCase());

    let urlPref = null;
    let urlSuf = null;

    if (!random) {
        urlPref = 'https://www.gravatar.com/avatar/';
        urlSuf = '?d=wavatar&size=200';
    } else if (random && typeof interfaceConfig === 'object'
        && interfaceConfig.RANDOM_AVATAR_URL_PREFIX) {
        urlPref = interfaceConfig.RANDOM_AVATAR_URL_PREFIX;
        urlSuf = interfaceConfig.RANDOM_AVATAR_URL_SUFFIX;
    } else {
        urlPref = 'https://api.adorable.io/avatars/200/';
        urlSuf = '.png';
    }

    return urlPref + avatar + urlSuf;
}
