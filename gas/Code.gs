const SHEET_NAME = 'Shots';

const HEADERS = [
  'savedAt',
  'storageVersion',
  'dataSource',
  'sessionDate',
  'sessionName',
  'sessionTheme',
  'sessionMemo',
  'nextTask',
  'date',
  'shotDateTime',
  'club',
  'targetCarry',
  'carry',
  'total',
  'run',
  'clubSpeed',
  'ballSpeed',
  'smashFactor',
  'launchAngle',
  'sideAngle',
  'backSpin',
  'sideSpin',
  'clubPath',
  'faceAngle',
  'landingAngle',
  'apex',
  'offline',
  'impactAngle',
  'rating',
  'memo'
];

function doPost(e) {
  const sheet = getSheet_();
  const data = JSON.parse(e.postData.contents || '{}');
  sheet.appendRow([
    new Date(),
    data.storageVersion || '',
    data.dataSource || '',
    data.sessionDate || '',
    data.sessionName || '',
    data.sessionTheme || '',
    data.sessionMemo || '',
    data.nextTask || '',
    data.date || '',
    data.shotDateTime || '',
    data.club || '',
    data.targetCarry || '',
    data.carry || '',
    data.total || '',
    data.run || '',
    data.clubSpeed || '',
    data.ballSpeed || '',
    data.smashFactor || '',
    data.launchAngle || '',
    data.sideAngle || '',
    data.backSpin || '',
    data.sideSpin || '',
    data.clubPath || '',
    data.faceAngle || '',
    data.landingAngle || '',
    data.apex || '',
    data.offline || '',
    data.impactAngle || '',
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
