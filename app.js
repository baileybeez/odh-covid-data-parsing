function requestUpdatedData() {
  var csv = downloadCsvData()
  var tally = {}
  
  for (var idx in csv) {
    var pkg = tryParseRow(csv[idx])
    if (pkg.date !== "invalid") {  
      if (tally[pkg.date] == null)
        tally[pkg.date] = dataPack()
        
      tally[pkg.date].cases += pkg.cases
      tally[pkg.date].hospitals += pkg.hospitals
      tally[pkg.date].deaths += pkg.deaths
    }
  }
  
  var row = 2
  var col = 1
  var total = 0
  var tdeaths = 0
  var thosp = 0
  var sheet = SpreadsheetApp.getActiveSheet()
  var keys = Object.keys(tally)
  keys.sort(function (a, b) { return new Date(a) < new Date(b) ? -1 : 1 })
  
  sheet.getRange(1, 1).setValue("Date")
  sheet.getRange(1, 2).setValue("Total Cases")
  sheet.getRange(1, 3).setValue("Daily New")
  sheet.getRange(1, 4).setValue("Deaths")
  sheet.getRange(1, 5).setValue("Hospitalized")
  
  for (var idx in keys) {
    var dt = keys[idx]
    var pkg = tally[dt]
    
    sheet.getRange(row, 1).setValue(dt)
    sheet.getRange(row, 2).setValue(total)
    sheet.getRange(row, 3).setValue(pkg.cases)
    
    total += pkg.cases
    tdeaths += pkg.deaths
    thosp += pkg.hospitals
    
    //sheet.getRange(row, 4).setValue(Math.log(total, 10))
    sheet.getRange(row, 4).setValue(tdeaths)    
    sheet.getRange(row, 5).setValue(thosp)
       
    row++
  }
  
}
                 
function downloadCsvData() {
  //https://coronavirus.ohio.gov/static/dashboards/COVIDSummaryData.csv
  var csvUrl = "https://coronavirus.ohio.gov/static/dashboards/COVIDDeathData_CountyOfResidence.csv";
  var csvContent = UrlFetchApp.fetch(csvUrl).getContentText();
  
  return Utilities.parseCsv(csvContent);
}

function dataPack() {
  return {
    "date": "invalid",
    "cases": 0,
    "hospitals": 0,
    "deaths": 0
  }
}

function isValidRow(row) {
  if (row[0] === "County" || row[0] === "Grand Total")
    return false
    
  return true
}

// County,Sex,Age Range,Onset Date,Date Of Death,Admission Date,Case Count,Death Count,Hospitalized Count
function tryParseRow(row) {
  var ret = dataPack()
  if (isValidRow(row)) {
    ret.date = row[3]
    ret.cases = parseInt(row[6], 10)
    ret.hospitals = parseInt(row[8], 10)
    ret.deaths = parseInt(row[7], 10)
  }
  
  return ret
}
