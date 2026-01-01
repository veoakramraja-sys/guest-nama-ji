
/**
 * GuestNama Professional Backend - Google Sheets Edition
 * 
 * FEATURES:
 * - Automatic Sheet Creation & Styling
 * - Custom Spreadsheet Menu for Admin Control
 * - Multi-user Concurrency Locking (LockService)
 * - Automatic Demo Data Seeding
 */

const CONFIG = {
  DB_NAME: "GuestNama Master Database",
  PROPS_KEY: "GUESTNAMA_SS_ID",
  TABS: {
    USERS: "Users",
    GUESTS: "Guests",
    FINANCE: "Finance",
    TASKS: "Tasks"
  },
  HEADERS: {
    Users: ["id", "phone", "name", "role", "createdAt", "passwordHash"],
    Guests: ["id", "userId", "name", "phone", "rsvpStatus", "checkedIn", "eventDate", "group", "vipStatus", "city", "men", "women", "children", "totalPersons", "relationship", "ownCar", "invitedBy", "invitationSent", "notes"],
    Finance: ["id", "userId", "description", "amount", "type", "category", "date"],
    Tasks: ["id", "userId", "title", "description", "isCompleted", "dueDate", "priority"]
  },
  // Default Admin Credentials (SHA-256 for 'admin123')
  SEED_ADMIN: {
    id: "admin-001",
    phone: "03001234567",
    name: "System Administrator",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
    passwordHash: "240be518fabd2724ddb6f0403f30bc2e25231735a0ad13a0967db80e227038c1"
  }
};

/**
 * TRIGGER: Runs when the Spreadsheet is opened.
 * Adds the GuestNama menu to the toolbar next to Gemini/Help.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 GuestNama Admin')
    .addItem('Initialize / Repair System', 'runSetup')
    .addSeparator()
    .addItem('Check Backend Health', 'checkHealth')
    .addSeparator()
    .addItem('⚠️ Factory Reset (Wipe All)', 'showResetWarning')
    .addToUi();
}

/**
 * Manual setup trigger from the menu.
 * Ensures sheets exist, headers are set, and demo data is injected.
 */
function runSetup() {
  const ui = SpreadsheetApp.getUi();
  try {
    const ss = getOrCreateDatabase();
    seedDemoData(ss);
    ui.alert('✅ System Initialized', 'Database tabs created, styled, and seeded with demo data. Users now register via Phone Number.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Setup Failed', e.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Health Check Utility
 */
function checkHealth() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().map(s => s.getName()).join(', ');
  const msg = `Database ID: ${ss.getId()}\n\n` +
              `Active Tabs: ${sheets}\n\n` +
              `Current Status: Operational\n\n` +
              `Web App Deployment: Ensure you have deployed this script as a Web App (Anyone access) and updated constants.ts.`;
  ui.alert('System Health Report', msg, ui.ButtonSet.OK);
}

/**
 * Reset Warning Dialog
 */
function showResetWarning() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ CRITICAL: Factory Reset',
    'This will delete all tabs and reset the system. ALL DATA WILL BE LOST. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response == ui.Button.YES) {
    DEV_RESET_DATABASE();
    ui.alert('System Wiped', 'Properties cleared and tabs deleted. Run "Initialize" to start fresh.', ui.ButtonSet.OK);
  }
}

/**
 * Diagnostics API (GET)
 */
function doGet(e) {
  try {
    const ss = getOrCreateDatabase();
    return createResponse(true, {
      status: "Operational",
      databaseId: ss.getId(),
      sheets: ss.getSheets().map(s => s.getName()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createResponse(false, null, err.toString());
  }
}

/**
 * Main API Endpoint (POST)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = getOrCreateDatabase();
    const request = JSON.parse(e.postData.contents);
    const { action, payload } = request;
    let responseData = null;

    switch (action) {
      case 'signup':
        addRow(ss, CONFIG.TABS.USERS, payload);
        responseData = { message: "Registration successful" };
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
        responseData = { message: "Guest added" };
        break;
      case 'deleteGuest':
        deleteRow(ss, CONFIG.TABS.GUESTS, payload.guestId);
        responseData = { message: "Guest removed" };
        break;
      case 'updateGuestStatus':
        updateRow(ss, CONFIG.TABS.GUESTS, payload.guestId, { rsvpStatus: payload.status });
        responseData = { message: "Status updated" };
        break;
      case 'getFinance':
        responseData = getTable(ss, CONFIG.TABS.FINANCE).filter(f => f.userId === payload.userId);
        break;
      case 'addFinance':
        addRow(ss, CONFIG.TABS.FINANCE, payload);
        responseData = { message: "Transaction saved" };
        break;
      case 'deleteFinance':
        deleteRow(ss, CONFIG.TABS.FINANCE, payload.financeId);
        responseData = { message: "Transaction removed" };
        break;
      case 'getTasks':
        responseData = getTable(ss, CONFIG.TABS.TASKS).filter(t => t.userId === payload.userId);
        break;
      case 'addTask':
        addRow(ss, CONFIG.TABS.TASKS, payload);
        responseData = { message: "Task created" };
        break;
      case 'updateTask':
        updateRow(ss, CONFIG.TABS.TASKS, payload.taskId, payload);
        responseData = { message: "Task updated" };
        break;
      case 'deleteTask':
        deleteRow(ss, CONFIG.TABS.TASKS, payload.taskId);
        responseData = { message: "Task removed" };
        break;
      default:
        throw new Error("Invalid action: " + action);
    }
    return createResponse(true, responseData);
  } catch (err) {
    return createResponse(false, null, err.toString());
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ensures Database exists and is properly structured
 */
function getOrCreateDatabase() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  
  if (!props.getProperty(CONFIG.PROPS_KEY)) {
    props.setProperty(CONFIG.PROPS_KEY, ss.getId());
  }
    
  Object.keys(CONFIG.HEADERS).forEach((tabName, idx) => {
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }
    
    // Check if headers exist
    const currentHeaders = sheet.getRange(1, 1, 1, CONFIG.HEADERS[tabName].length).getValues()[0];
    const isCorrect = currentHeaders.every((h, i) => h === CONFIG.HEADERS[tabName][i]);
    
    if (!isCorrect) {
      sheet.getRange(1, 1, 1, CONFIG.HEADERS[tabName].length).setValues([CONFIG.HEADERS[tabName]]);
      
      // Styling
      sheet.getRange(1, 1, 1, CONFIG.HEADERS[tabName].length)
           .setBackground("#0f172a")
           .setFontColor("#ffffff")
           .setFontWeight("bold")
           .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Always seed Admin if Users table is empty
    if (tabName === CONFIG.TABS.USERS && sheet.getLastRow() === 1) {
      const adminRow = CONFIG.HEADERS.Users.map(h => CONFIG.SEED_ADMIN[h]);
      sheet.appendRow(adminRow);
    }
  });

  return ss;
}

/**
 * Seeds Demo Data for a rich initial experience
 */
function seedDemoData(ss) {
  // Demo Guests
  const guestSheet = ss.getSheetByName(CONFIG.TABS.GUESTS);
  if (guestSheet.getLastRow() === 1) {
    const demos = [
      ["g-001", "admin-001", "Imran Khan", "0300-1234567", "Confirmed", "false", "2024-12-25", "Family", "true", "Lahore", "2", "2", "1", "5", "Relative", "Yes (Has Own Car)", "Self", "Delivered", "VIP Guest"],
      ["g-002", "admin-001", "Fatima Jinnah", "0311-7654321", "Pending", "false", "2024-12-25", "Friends", "false", "Karachi", "1", "1", "0", "2", "Friend", "No (Need Transport)", "Admin", "Sent", "Awaiting reply"]
    ];
    demos.forEach(row => guestSheet.appendRow(row));
  }

  // Demo Finance
  const financeSheet = ss.getSheetByName(CONFIG.TABS.FINANCE);
  if (financeSheet.getLastRow() === 1) {
    const demos = [
      ["f-001", "admin-001", "Venue Advance Payment", "50000", "Expense", "Catering", "2024-10-01"],
      ["f-002", "admin-001", "Gift from Elder", "10000", "Income", "Other", "2024-10-05"]
    ];
    demos.forEach(row => financeSheet.appendRow(row));
  }

  // Demo Tasks
  const taskSheet = ss.getSheetByName(CONFIG.TABS.TASKS);
  if (taskSheet.getLastRow() === 1) {
    const demos = [
      ["t-001", "admin-001", "Book Catering Service", "Finalize menu and pay advance", "true", "2024-11-01", "High"],
      ["t-002", "admin-001", "Send Digital Invitations", "WhatsApp links to all guests", "false", "2024-11-15", "Medium"]
    ];
    demos.forEach(row => taskSheet.appendRow(row));
  }
}

/**
 * Database Helpers (CRUD)
 */
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
    const val = payload[h];
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
          sheet.getRange(i + 1, colIdx + 1).setValue(updates[key]);
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

function DEV_RESET_DATABASE() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty(CONFIG.PROPS_KEY);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(CONFIG.TABS).forEach(key => {
    const sheet = ss.getSheetByName(CONFIG.TABS[key]);
    if (sheet) ss.deleteSheet(sheet);
  });
  getOrCreateDatabase();
}
