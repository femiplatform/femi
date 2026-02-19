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
  var first = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0];
  var need = headers || [];
  // If sheet empty
  if (sh.getLastRow() === 0 || (first.length === 1 && String(first[0]||"").trim() === "")) {
    sh.clear();
    sh.getRange(1,1,1,need.length).setValues([need]);
    sh.setFrozenRows(1);
    return;
  }
  // If header mismatch, rewrite header only if it's blank-ish
  var current = sh.getRange(1,1,1,need.length).getValues()[0];
  var mismatch = false;
  for (var i=0; i<need.length; i++) {
    if (String(current[i]||"").trim() !== need[i]) { mismatch = true; break; }
  }
  if (mismatch) {
    // Keep existing data, just enforce header row width
    sh.getRange(1,1,1,need.length).setValues([need]);
    sh.setFrozenRows(1);
  }
}

function femiReadAll_(sheetName, headers) {
  var sh = femiSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var range = sh.getRange(1,1,lastRow, headers.length);
  var values = range.getValues();
  var out = [];
  for (var r=1; r<values.length; r++) {
    var row = values[r];
    if (String(row[0]||"").trim() === "") continue;
    var obj = {};
    for (var c=0; c<headers.length; c++) obj[headers[c]] = row[c];
    out.push(obj);
  }
  return out;
}

function femiAppend_(sheetName, headers, obj) {
  var sh = femiSheet_(sheetName);
  var row = [];
  for (var i=0; i<headers.length; i++) row.push(obj[headers[i]] !== undefined ? obj[headers[i]] : "");
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

  var idCol = headers.indexOf(idField) + 1;
  femiRequire_(idCol > 0, "DB", "Invalid idField");
  var data = sh.getRange(2,1,lastRow-1,headers.length).getValues();

  for (var r=0; r<data.length; r++) {
    if (String(data[r][idCol-1]) === String(idValue)) {
      // apply patch
      for (var k in patch) {
        if (!patch.hasOwnProperty(k)) continue;
        var idx = headers.indexOf(k);
        if (idx >= 0) data[r][idx] = patch[k];
      }
      sh.getRange(2+r,1,1,headers.length).setValues([data[r]]);
      var updated = {};
      for (var c=0; c<headers.length; c++) updated[headers[c]] = data[r][c];
      return updated;
    }
  }
  return null;
}

function femiDeleteById_(sheetName, headers, idField, idValue) {
  var sh = femiSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return false;
  var idCol = headers.indexOf(idField) + 1;
  femiRequire_(idCol > 0, "DB", "Invalid idField");
  var range = sh.getRange(2, idCol, lastRow-1, 1).getValues();
  for (var r=0; r<range.length; r++) {
    if (String(range[r][0]) === String(idValue)) {
      sh.deleteRow(2 + r);
      return true;
    }
  }
  return false;
}
