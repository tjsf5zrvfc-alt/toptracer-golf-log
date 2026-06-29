const SHEET_NAME = 'Shots';

const HEADERS = [
  'savedAt',
  'storageVersion',
  'sessionDate',
  'sessionName',
  'sessionTheme',
  'sessionMemo',
  'nextTask',
  'date',
  'club',
  'targetCarry',
  'carry',
  'total',
  'ballSpeed',
  'launchAngle',
  'side',
  'rating',
  'memo'
];

function doPost(e) {
  const sheet = getSheet_();
  const data = JSON.parse(e.postData.contents || '{}');
  sheet.appendRow([
    new Date(),
    data.storageVersion || '',
    data.sessionDate || '',
    data.sessionName || '',
    data.sessionTheme || '',
    data.sessionMemo || '',
    data.nextTask || '',
    data.date || '',
    data.club || '',
    data.targetCarry || '',
    data.carry || '',
    data.total || '',
    data.ballSpeed || '',
    data.launchAngle || '',
    data.side || '',
    data.rating || '',
    data.memo || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, app: 'Toptracer Golf Log', version: '1.2' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  getSheet_();
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return sheet;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const missingHeaders = HEADERS.filter(function(header) {
    return currentHeaders.indexOf(header) === -1;
  });
  if (missingHeaders.length) {
    sheet.getRange(1, currentHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  }

  return sheet;
}
