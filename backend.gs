
/**
 * GuestNama Professional Backend - Google Sheets Edition
 * 
 * FEATURES:
 * - Automatic Sheet Creation & Tab Setup
 * - Multi-user Concurrency Locking (LockService)
 * - Automatic Admin Account Seeding
 * - Diagnostic GET endpoint for health checks
 * - Flexible CRUD operations for Guests, Finance, and Tasks
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
    Users: ["id", "email", "name", "role", "createdAt", "passwordHash"],
    Guests: ["id", "userId", "name", "phone", "rsvpStatus", "checkedIn", "eventDate", "group", "vipStatus", "city", "men", "women", "children", "totalPersons", "relationship", "ownCar", "invitedBy", "invitationSent", "notes"],
    Finance: ["id", "userId", "description", "amount", "type", "category", "date"],
    Tasks: ["id", "userId", "title", "description", "isCompleted", "dueDate", "priority"]
  },
  // Default Admin Credentials (SHA-256 for 'admin123')
  SEED_ADMIN: {
    id: "admin-001",
    email: "admin@guestnama.com",
    name: "System Administrator",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
    passwordHash: "240be518fabd2724ddb6f0403f30bc2e25231735a0ad13a0967db80e227038c1"
  }
};

/**
 * Diagnostics & Health Check
 */
function doGet(e) {
  try {
    const ss = getOrCreateDatabase();
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      status: "Operational",
      databaseId: ss.getId(),
      sheets: ss.getSheets().map(s => s.getName()),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main API Endpoint
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait for up to 30 seconds for a lock before failing
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
        responseData = (payload.role === 'ADMIN') 
          ? allGuests 
          : allGuests.filter(g => g.userId === payload.userId);
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
        const { taskId, ...updates } = payload;
        updateRow(ss, CONFIG.TABS.TASKS, taskId, updates);
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
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty(CONFIG.PROPS_KEY);
  let ss = null;

  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch (e) {
      ssId = null; // Reset if invalid
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.create(CONFIG.DB_NAME);
    props.setProperty(CONFIG.PROPS_KEY, ss.getId());
    
    // Create Sheets and seed initial data
    Object.keys(CONFIG.HEADERS).forEach((tabName, idx) => {
      let sheet = ss.getSheetByName(tabName);
      if (!sheet) {
        sheet = (idx === 0) ? ss.getSheets()[0].setName(tabName) : ss.insertSheet(tabName);
      }
      sheet.clear();
      sheet.appendRow(CONFIG.HEADERS[tabName]);
      
      // Styling
      sheet.getRange(1, 1, 1, CONFIG.HEADERS[tabName].length)
           .setBackground("#0f172a")
           .setFontColor("#ffffff")
           .setFontWeight("bold")
           .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);

      // Seed Admin if it's the Users table
      if (tabName === CONFIG.TABS.USERS) {
        const adminRow = CONFIG.HEADERS.Users.map(h => CONFIG.SEED_ADMIN[h]);
        sheet.appendRow(adminRow);
      }
    });
  }

  return ss;
}

/**
 * Reads Sheet data and maps to JSON objects
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
      // Basic type normalization
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

/**
 * Creates a new record
 */
function addRow(ss, sheetName, payload) {
  const sheet = ss.getSheetByName(sheetName);
  const headers = CONFIG.HEADERS[sheetName];
  const row = headers.map(h => {
    const val = payload[h];
    return (val !== undefined && val !== null) ? val : "";
  });
  sheet.appendRow(row);
}

/**
 * Updates an existing record by ID
 */
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

/**
 * Deletes a record by ID
 */
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

/**
 * Formats JSON response
 */
function createResponse(success, data, error = null) {
  const result = { success, data, error };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Utility: Manually reset the entire database (Development only)
 */
function DEV_RESET_DATABASE() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty(CONFIG.PROPS_KEY);
  getOrCreateDatabase();
}
