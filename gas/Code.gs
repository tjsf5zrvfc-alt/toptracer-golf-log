const SHEET_NAME = 'Shots';

function doPost(e) {
  const sheet = getSheet_();
  const data = JSON.parse(e.postData.contents || '{}');
  sheet.appendRow([
    new Date(),
    data.date || '',
    data.club || '',
    data.carry || '',
    data.total || '',
    data.ballSpeed || '',
    data.launchAngle || '',
    data.side || '',
    data.memo || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, app: 'Toptracer Golf Log' }))
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
    sheet.appendRow([
      'savedAt',
      'date',
      'club',
      'carry',
      'total',
      'ballSpeed',
      'launchAngle',
      'side',
      'memo'
    ]);
  }

  return sheet;
}
