import { ReactElement } from 'react';
import { im, m, makeMessages } from 'core/i18n';

export default makeMessages('zui', {
  accessList: {
    added: im<{ sharer: string; updated: ReactElement }>(
      'Added by {sharer} {updated}'
    ),
    levels: {
      configure: m('Edit & Configure'),
      edit: m('Editing'),
      readonly: m('Read-only'),
    },
    removeAccess: m('Remove access'),
    roles: {
      admin: m('Admin'),
      organizer: m('Organizer'),
    },
  },
  breadcrumbs: {
    areas: m('Areas'),
    assignees: m('Assignees'),
    calendar: m('Calendar'),
    callassignments: m('Call assignments'),
    callers: m('Callers'),
    campaigns: m('Campaigns'),
    closed: m('Closed'),
    conversation: m('Conversation'),
    events: m('Events'),
    folders: m('Views'),
    insights: m('Insights'),
    instances: m('Instances'),
    journeys: m('Journeys'),
    manage: m('Manage'),
    milestones: m('Milestones'),
    new: m('New'),
    organize: m('Organize'),
    people: m('People'),
    projects: m('Projects'),
    questions: m('Questions'),
    submissions: m('Submissions'),
    surveys: m('Surveys'),
    tasks: m('Tasks'),
    views: m('Views'),
  },
  collapse: {
    collapse: m('Collapse'),
    expand: m('Expand'),
  },
  confirmDialog: {
    button: m('Confirm'),
    defaultTitle: m('Confirm'),
    defaultWarningText: m(
      'Are you sure you want to do this action? It can not be undone.'
    ),
  },
  copyToClipboard: {
    copied: m('Copied'),
    copiedValue: im<{ value: string }>('Copied "{value}"'),
  },
  dataTableSearch: {
    button: m('Search'),
    helpText: im<{ minSearchLength: number }>(
      'Type at least {minSearchLength} characters'
    ),
    idSearchHelpText: m('Type an ID (numbers only)'),
    placeholder: m('Search this table'),
    placeholderWithIdSearch: m('Search - use # for IDs, e.g. type #123'),
    title: m('Search'),
  },
  dataTableSorting: {
    addButton: m('Add sorting column'),
    button: m('Sort'),
    hint: im<{ shiftKeyIcon: ReactElement }>(
      'Hint: hold down {shiftKeyIcon} while clicking multiple columns'
    ),
    title: m('Sort'),
  },
  dateRange: {
    draft: m('No start date'),
    finite: im<{ end: Date; start: Date }>(
      'From {start, date, medium} to {end, date, medium}'
    ),
    indefinite: im<{ start: Date }>('From {start, date, medium} onwards'),
  },
  editTextInPlace: {
    tooltip: {
      edit: m('Click to edit'),
      noEmpty: m('This cannot be empty'),
    },
  },
  futures: {
    errorLoading: m('There was an error loading the data.'),
  },
  imageSelectDialog: {
    instructions: m('Drag and drop an image file, or click to select'),
  },
  lists: {
    showMore: m('Show more...'),
  },
  personSelect: {
    keepTyping: m('Keep typing to start searching'),
    noResult: m('No matching person found'),
    search: m('Type to start searching'),
    searching: m('Searching...'),
  },
  snackbar: {
    error: m('Oh dear, something went wrong'),
    info: m(''),
    success: m('Success!'),
    warning: m('Warning!'),
  },
  submitOrCancel: {
    cancel: m('Cancel'),
    submit: m('Submit'),
  },
});
