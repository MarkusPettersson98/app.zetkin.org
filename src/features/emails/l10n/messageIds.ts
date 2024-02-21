import { m, makeMessages } from 'core/i18n';

export default makeMessages('feat.emails', {
  blocked: {
    blacklisted: m('Blacklisted'),
    missingEmail: m('Missing email'),
    subtitle: m('Targets not available for email'),
    title: m('Blocked'),
    unsubscribed: m('Unsubscribed'),
  },
  deliveryStatus: {
    notLocked: m('Not locked, not scheduled'),
    notScheduled: m('Not scheduled'),
    wasSent: m<{ time: string }>('Was sent at {time}'),
    willSend: m<{ time: string }>('Will send at {time}'),
  },
  emailActionButtons: {
    delete: m('Delete'),
    delivery: m('Delivery'),
    deliveryDate: m('Delivery date'),
    deliveryTime: m('Delivery time'),
    duplicate: m('Duplicate'),
    schedule: m('Schedule'),
    sendAnyway: m('Send anyway'),
    sendLater: m('Send later'),
    sendNow: {
      alert: {
        desc: m(
          'There may be a better time of day to send. Scheduled sending also give fellow organizers a chance to coordinate with your plans.'
        ),
        title: m('Sending right now might not be optimal'),
      },
      header: m('Send now'),
    },
    setDate: m('Set delivery date to proceed'),
    timeZone: m('Timezone'),
    warning: m(
      'Are you sure you want to delete this email? This action is permanent and cannot be undone.'
    ),
  },
  ready: {
    loading: m('Loading...'),
    lockButton: m('Lock for delivery'),
    lockDescription: m('Lock to enable email delivery'),
    locked: m('Locked'),
    subtitle: m('Targets currently available for delivery'),
    title: m('Ready'),
    unlockButton: m('Unlock'),
    unlockDescription: m(
      'Proceed to delivery or unlock recipients to edit targeting. Unlocking may add or remove some targets depending on what results the smart search will produce.'
    ),
  },
  state: {
    draft: m('Draft'),
    scheduled: m('Scheduled'),
    sent: m('Sent'),
  },
  stats: {
    targets: m<{ numTargets: number }>(
      '{numTargets, plural, =0 {No targets} one {1 target} other {# targets}}'
    ),
  },
  tabs: {
    compose: m('Compose'),
    overview: m('Overview'),
  },
  targets: {
    defineButton: m('Define target group'),
    editButton: m('Edit target group'),
    locked: m('Targets are locked for delivery'),
    subtitle: m('Use smart search to define the recipients of this mail.'),
    title: m('Targets'),
    viewButton: m('View target group'),
  },
});
