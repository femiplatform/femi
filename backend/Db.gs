// FEMI DB helpers (Google Sheets)

function femiSs_() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  femiRequire_(id, "CONFIG", "SPREADSHEET_ID is not set in Script Properties");
  return SpreadsheetApp.openById(id);
}

function femiSheet_(name) {
  var ss = femiSs_();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function femiEnsureSheet_(name, headers) {
  var sh = femiSheet_(name);
  var need = headers || [];
  if (!need.length) return;

  // If sheet empty: initialize header
  if (sh.getLastRow() === 0) {
    sh.clear();
    sh.getRange(1, 1, 1, need.length).setValues([need]);
    sh.setFrozenRows(1);
    return;
  }

  var hi = femiHeaderInfo_(sh);
  var cur = hi.headers.map(function(h){ return String(h||"").trim(); });
  var curSet = {};
  cur.forEach(function(h){ if(h) curSet[h]=true; });

  var nextCol = hi.lastCol + 1;
  for (var i=0; i<need.length; i++) {
    var h = need[i];
    if (!curSet[h]) {
      sh.getRange(1, nextCol).setValue(h);
      nextCol++;
      curSet[h] = true;
    }
  }
  sh.setFrozenRows(1);
}

function femiHeaderInfo_(sh) {
  var lastCol = Math.max(1, sh.getLastColumn());
  var headerRow = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var headers = [];
  var map = {};
  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || "").trim();
    headers.push(h);
    if (h) map[h] = c; // 0-based
  }
  return { headers: headers, map: map, lastCol: lastCol };
}

function femiReadAll_(sheetName, headers) {
  var sh = femiSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var hi = femiHeaderInfo_(sh);
  var lastCol = Math.max(hi.lastCol, headers.length);
  var values = sh.getRange(1, 1, lastRow, lastCol).getValues();
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    // require first requested header (often id) not blank, fallback to first cell
    if (String(row[0] || "").trim() === "") continue;
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      var idx = (hi.map[key] !== undefined) ? hi.map[key] : i; // fallback legacy
      obj[key] = row[idx];
    }
    out.push(obj);
  }
  return out;
}

function femiAppend_(sheetName, headers, obj) {
  var sh = femiSheet_(sheetName);
  var hi = femiHeaderInfo_(sh);
  // If sheet has no header row yet, ensure it
  var hasAnyHeader = hi.headers.some(function(h){ return h && h.length; });
  if (!hasAnyHeader) {
    femiEnsureSheet_(sheetName, headers);
    hi = femiHeaderInfo_(sh);
  }
  var headerRow = hi.headers;
  var row = [];
  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || "").trim();
    row.push(h && obj[h] !== undefined ? obj[h] : "");
  }
  sh.appendRow(row);
  return obj;
}

function femiFindBy_(sheetName, headers, field, value) {
  var all = femiReadAll_(sheetName, headers);
  for (var i=0; i<all.length; i++) {
    if (String(all[i][field]) === String(value)) return all[i];
  }
  return null;
}

function femiUpdateById_(sheetName, headers, idField, idValue, patch) {
  var sh = femiSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return null;

  var hi = femiHeaderInfo_(sh);
  var idCol = (hi.map[idField] !== undefined) ? hi.map[idField] : headers.indexOf(idField);
  if (idCol < 0) return null;

  var range = sh.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  var targetRow = -1;
  for (var i = 0; i < range.length; i++) {
    if (String(range[i][0]) === String(idValue)) { targetRow = i + 2; break; }
  }
  if (targetRow < 0) return null;

  Object.keys(patch || {}).forEach(function(k){
    var col = (hi.map[k] !== undefined) ? hi.map[k] : headers.indexOf(k);
    if (col >= 0) sh.getRange(targetRow, col + 1).setValue(patch[k]);
  });

  return femiFindBy_(sheetName, headers, idField, idValue);
}

function femiDeleteById_(sheetName, headers, idField, idValue) {
  var sh = femiSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return false;

  var hi = femiHeaderInfo_(sh);
  var idCol = (hi.map[idField] !== undefined) ? hi.map[idField] : headers.indexOf(idField);
  if (idCol < 0) return false;

  var colVals = sh.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < colVals.length; i++) {
    if (String(colVals[i][0]) === String(idValue)) {
      sh.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}
