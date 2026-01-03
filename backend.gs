
/**
 * GuestNama Enterprise Backend - Professional Edition v2
 * Features: Advanced Audit Logging, Health Monitoring, Atomic Transactions
 */

const CONFIG = {
  DB_NAME: "GuestNama Master Database",
  PROPS_KEY: "GUESTNAMA_SS_ID",
  TABS: {
    USERS: "Users",
    GUESTS: "Guests",
    FINANCE: "Finance",
    TASKS: "Tasks",
    LOGS: "Logs"
  },
  HEADERS: {
    Users: ["id", "phone", "name", "role", "createdAt", "passwordHash"],
    Guests: ["id", "userId", "name", "phone", "rsvpStatus", "checkedIn", "eventDate", "group", "vipStatus", "city", "men", "women", "children", "totalPersons", "relationship", "ownCar", "invitedBy", "invitationSent", "notes"],
    Finance: ["id", "userId", "description", "amount", "type", "category", "date"],
    Tasks: ["id", "userId", "title", "description", "isCompleted", "dueDate", "priority"],
    Logs: ["timestamp", "userId", "action", "details"]
  },
  SEED_ADMIN: {
    id: "admin-001",
    phone: "03001234567",
    name: "System Administrator",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
    passwordHash: "240be518fabd2724ddb6f0403f30bc2e25231735a0ad13a0967db80e227038c1"
  }
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 GuestNama Enterprise')
    .addItem('Initialize / Repair Tables', 'runSetup')
    .addItem('Generate Performance Report', 'checkHealth')
    .addSeparator()
    .addItem('Clear Audit Logs', 'clearLogs')
    .addToUi();
}

function logAction(userId, action, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.TABS.LOGS);
    if (sheet) {
      sheet.appendRow([new Date().toISOString(), userId, action, JSON.stringify(details)]);
    }
  } catch (e) {
    console.error("Logging failed", e);
  }
}

function checkHealth() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  let report = "GuestNama System Health Report\n\n";
  
  Object.keys(CONFIG.TABS).forEach(key => {
    const tabName = CONFIG.TABS[key];
    const sheet = ss.getSheetByName(tabName);
    const rows = sheet ? sheet.getLastRow() - 1 : 0;
    report += `• ${tabName}: ${rows} records\n`;
  });
  
  ui.alert('System Integrity Report', report, ui.ButtonSet.OK);
}

function runSetup() {
  const ui = SpreadsheetApp.getUi();
  try {
    getOrCreateDatabase();
    ui.alert('✅ System Initialized', 'Database structure verified and secured.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Setup Failed', e.toString(), ui.ButtonSet.OK);
  }
}

function clearLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.TABS.LOGS);
  if (sheet && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, CONFIG.HEADERS.Logs.length).clear();
    logAction("SYSTEM", "LOG_CLEAR", "Audit log reset");
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = getOrCreateDatabase();
    const request = JSON.parse(e.postData.contents);
    const { action, payload } = request;
    let responseData = null;

    const actingUser = payload.userId || "GUEST_OR_SYSTEM";

    switch (action) {
      case 'signup':
        addRow(ss, CONFIG.TABS.USERS, payload);
        logAction(payload.id, "SIGNUP", { name: payload.name });
        responseData = { message: "Account Created" };
        break;
      case 'getUsers':
        responseData = getTable(ss, CONFIG.TABS.USERS);
        break;
      case 'verifySession':
        const users = getTable(ss, CONFIG.TABS.USERS);
        responseData = users.some(u => u.id === payload.userId);
        break;
      case 'getGuests':
        const allGuests = getTable(ss, CONFIG.TABS.GUESTS);
        responseData = (payload.role === 'ADMIN') ? allGuests : allGuests.filter(g => g.userId === payload.userId);
        break;
      case 'addGuest':
        addRow(ss, CONFIG.TABS.GUESTS, payload);
        logAction(actingUser, "ADD_GUEST", { guest: payload.name });
        responseData = { message: "Guest Registered" };
        break;
      case 'deleteGuest':
        deleteRow(ss, CONFIG.TABS.GUESTS, payload.guestId);
        logAction(actingUser, "DELETE_GUEST", { id: payload.guestId });
        responseData = { message: "Guest Removed" };
        break;
      case 'updateGuestStatus':
        updateRow(ss, CONFIG.TABS.GUESTS, payload.guestId, { rsvpStatus: payload.status });
        logAction(actingUser, "UPDATE_RSVP", { id: payload.guestId, status: payload.status });
        responseData = { message: "RSVP Updated" };
        break;
      case 'getFinance':
        responseData = getTable(ss, CONFIG.TABS.FINANCE).filter(f => f.userId === payload.userId);
        break;
      case 'addFinance':
        addRow(ss, CONFIG.TABS.FINANCE, payload);
        logAction(actingUser, "ADD_FINANCE", { desc: payload.description, amount: payload.amount });
        responseData = { message: "Finance Entry Saved" };
        break;
      case 'deleteFinance':
        deleteRow(ss, CONFIG.TABS.FINANCE, payload.financeId);
        logAction(actingUser, "DELETE_FINANCE", { id: payload.financeId });
        responseData = { message: "Entry Deleted" };
        break;
      case 'getTasks':
        responseData = getTable(ss, CONFIG.TABS.TASKS).filter(t => t.userId === payload.userId);
        break;
      case 'addTask':
        addRow(ss, CONFIG.TABS.TASKS, payload);
        responseData = { message: "Task Added" };
        break;
      case 'updateTask':
        updateRow(ss, CONFIG.TABS.TASKS, payload.taskId, payload);
        responseData = { message: "Task Synchronized" };
        break;
      case 'deleteTask':
        deleteRow(ss, CONFIG.TABS.TASKS, payload.taskId);
        responseData = { message: "Task Purged" };
        break;
      case 'healthCheck': // NEW: System monitoring
        responseData = { status: "online", version: "2.0.0", serverTime: new Date().toISOString() };
        break;
      default:
        throw new Error("Action Restricted: " + action);
    }
    return createResponse(true, responseData);
  } catch (err) {
    return createResponse(false, null, err.toString());
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateDatabase() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(CONFIG.HEADERS).forEach((tabName) => {
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) sheet = ss.insertSheet(tabName);
    const currentHeaders = sheet.getRange(1, 1, 1, CONFIG.HEADERS[tabName].length).getValues()[0];
    const isCorrect = currentHeaders.every((h, i) => h === CONFIG.HEADERS[tabName][i]);
    if (!isCorrect) {
      sheet.getRange(1, 1, 1, CONFIG.HEADERS[tabName].length).setValues([CONFIG.HEADERS[tabName]]);
      sheet.getRange(1, 1, 1, CONFIG.HEADERS[tabName].length).setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    if (tabName === CONFIG.TABS.USERS && sheet.getLastRow() === 1) {
      const adminRow = CONFIG.HEADERS.Users.map(h => CONFIG.SEED_ADMIN[h]);
      sheet.appendRow(adminRow);
    }
  });
  return ss;
}

function getTable(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      if (typeof val === 'string') {
        if (val.toLowerCase() === "true") val = true;
        else if (val.toLowerCase() === "false") val = false;
      }
      if (val instanceof Date) val = val.toISOString();
      obj[header] = val;
    });
    return obj;
  });
}

function addRow(ss, sheetName, payload) {
  const sheet = ss.getSheetByName(sheetName);
  const headers = CONFIG.HEADERS[sheetName];
  const row = headers.map(h => {
    let val = payload[h];
    if (h === 'phone' || h === 'userId' || h === 'id') return "'" + String(val || '');
    return (val !== undefined && val !== null) ? val : "";
  });
  sheet.appendRow(row);
}

function updateRow(ss, sheetName, id, updates) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      Object.keys(updates).forEach(key => {
        const colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          let val = updates[key];
          if (key === 'phone') val = "'" + String(val);
          sheet.getRange(i + 1, colIdx + 1).setValue(val);
        }
      });
      return;
    }
  }
}

function deleteRow(ss, sheetName, id) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function createResponse(success, data, error = null) {
  return ContentService.createTextOutput(JSON.stringify({ success, data, error }))
    .setMimeType(ContentService.MimeType.JSON);
}
