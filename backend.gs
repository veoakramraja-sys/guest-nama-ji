
/**
 * GuestNama Enterprise Backend - Professional Edition v2.5
 * Loophole Resolution: Ownership Validation, Seed Cleanup & Headcount Integrity
 */

const CONFIG = {
  DB_NAME: "GuestNama Master Database",
  PROPS_KEY: "GUESTNAMA_SS_ID",
  TABS: {
    USERS: "Users",
    GUESTS: "Guests",
    FINANCE: "Finance",
    TASKS: "Tasks",
    VENDORS: "Vendors",
    TIMELINE: "Timeline",
    LOGS: "Logs"
  },
  HEADERS: {
    Users: ["id", "phone", "name", "role", "createdAt", "passwordHash"],
    Guests: ["id", "userId", "name", "phone", "rsvpStatus", "checkedIn", "eventDate", "group", "vipStatus", "invitationRequired", "city", "men", "women", "children", "totalPersons", "relationship", "ownCar", "invitedBy", "invitationSent", "notes"],
    Finance: ["id", "userId", "description", "amount", "type", "category", "date"],
    Tasks: ["id", "userId", "title", "description", "isCompleted", "dueDate", "priority"],
    Vendors: ["id", "userId", "name", "category", "phone", "status", "budget", "paid"],
    Timeline: ["id", "userId", "title", "time", "location", "description"],
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
    .addItem('Seed Wedding Demo Data', 'seedWeddingDemo')
    .addSeparator()
    .addItem('Clear Audit Logs', 'clearLogs')
    .addToUi();
}

function seedWeddingDemo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Seed Demo Data?', 'This will RESET and add wedding-related sample finance, tasks, vendors and timeline entries for the Admin. Continue?', ui.ButtonSet.YES_NO);
  
  if (response == ui.Button.YES) {
    const systemUserId = CONFIG.SEED_ADMIN.id;
    generateDemoContent(ss, systemUserId);
    ui.alert('Demo content seeded successfully.');
  }
}

function generateDemoContent(ss, userId) {
  // Clear existing demo data for this specific user to prevent duplication
  [CONFIG.TABS.FINANCE, CONFIG.TABS.TASKS, CONFIG.TABS.VENDORS, CONFIG.TABS.TIMELINE].forEach(tab => {
    deleteRowsByUser(ss, tab, userId);
  });

  const financeData = [
    { id: "f-1", userId, description: "Venue Booking Advance", amount: 150000, type: "Expense", category: "Venue", date: "2024-05-01" },
    { id: "f-4", userId, description: "Cash Gift from Uncle", amount: 50000, type: "Income", category: "Gift", date: "2024-06-12" }
  ];

  const taskData = [
    { id: "t-1", userId, title: "Book Wedding Hall & Decorator", description: "Finalize theme", isCompleted: true, dueDate: "2024-04-15", priority: "High" }
  ];

  const vendorData = [
    { id: "v-1", userId, name: "Regency Caterers", category: "Catering", phone: "03211234567", status: "Paid", budget: 350000, paid: 350000 },
    { id: "v-2", userId, name: "Lumina Studios", category: "Photography", phone: "03459876543", status: "Hired", budget: 120000, paid: 20000 }
  ];

  const timelineData = [
    { id: "tl-1", userId, title: "Nikah Ceremony", time: "18:00", location: "Grand Mosque", description: "Family arrival at 17:30" },
    { id: "tl-2", userId, title: "Dinner / Barat Arrival", time: "20:30", location: "Royal Hall", description: "Cousins to lead the entry" }
  ];

  financeData.forEach(item => addRow(ss, CONFIG.TABS.FINANCE, item));
  taskData.forEach(item => addRow(ss, CONFIG.TABS.TASKS, item));
  vendorData.forEach(item => addRow(ss, CONFIG.TABS.VENDORS, item));
  timelineData.forEach(item => addRow(ss, CONFIG.TABS.TIMELINE, item));
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
    
    // Security: Fetch requester's role to verify admin status
    const users = getTable(ss, CONFIG.TABS.USERS);
    const requester = users.find(u => u.id === actingUser);
    const isAdmin = requester && requester.role === 'ADMIN';

    switch (action) {
      case 'signup':
        addRow(ss, CONFIG.TABS.USERS, payload);
        responseData = { message: "Account Created" };
        break;
      case 'getUsers':
        responseData = users;
        break;
      case 'verifySession':
        responseData = users.some(u => u.id === payload.userId);
        break;
      case 'getGuests':
        const allGuests = getTable(ss, CONFIG.TABS.GUESTS);
        responseData = (isAdmin) ? allGuests : allGuests.filter(g => g.userId === actingUser);
        break;
      case 'addGuest':
        addRow(ss, CONFIG.TABS.GUESTS, payload);
        responseData = { message: "Guest Registered" };
        break;
      case 'deleteGuest':
        deleteRowSecure(ss, CONFIG.TABS.GUESTS, payload.guestId, actingUser, isAdmin);
        responseData = { message: "Guest Removed" };
        break;
      case 'updateGuestStatus':
        updateRowSecure(ss, CONFIG.TABS.GUESTS, payload.guestId, { rsvpStatus: payload.status }, actingUser, isAdmin);
        responseData = { message: "RSVP Updated" };
        break;
      case 'getFinance':
        responseData = getTable(ss, CONFIG.TABS.FINANCE).filter(f => f.userId === actingUser);
        break;
      case 'addFinance':
        addRow(ss, CONFIG.TABS.FINANCE, payload);
        responseData = { message: "Finance Entry Saved" };
        break;
      case 'deleteFinance':
        deleteRowSecure(ss, CONFIG.TABS.FINANCE, payload.financeId, actingUser, isAdmin);
        responseData = { message: "Entry Deleted" };
        break;
      case 'getTasks':
        responseData = getTable(ss, CONFIG.TABS.TASKS).filter(t => t.userId === actingUser);
        break;
      case 'addTask':
        addRow(ss, CONFIG.TABS.TASKS, payload);
        responseData = { message: "Task Added" };
        break;
      case 'updateTask':
        updateRowSecure(ss, CONFIG.TABS.TASKS, payload.taskId, payload, actingUser, isAdmin);
        responseData = { message: "Task Synchronized" };
        break;
      case 'deleteTask':
        deleteRowSecure(ss, CONFIG.TABS.TASKS, payload.taskId, actingUser, isAdmin);
        responseData = { message: "Task Purged" };
        break;
      case 'getVendors':
        responseData = getTable(ss, CONFIG.TABS.VENDORS).filter(v => v.userId === actingUser);
        break;
      case 'addVendor':
        addRow(ss, CONFIG.TABS.VENDORS, payload);
        responseData = { message: "Vendor Saved" };
        break;
      case 'deleteVendor':
        deleteRowSecure(ss, CONFIG.TABS.VENDORS, payload.vendorId, actingUser, isAdmin);
        responseData = { message: "Vendor Removed" };
        break;
      case 'getTimeline':
        responseData = getTable(ss, CONFIG.TABS.TIMELINE).filter(t => t.userId === actingUser);
        break;
      case 'addTimeline':
        addRow(ss, CONFIG.TABS.TIMELINE, payload);
        responseData = { message: "Event Added" };
        break;
      case 'deleteTimeline':
        deleteRowSecure(ss, CONFIG.TABS.TIMELINE, payload.timelineId, actingUser, isAdmin);
        responseData = { message: "Event Removed" };
        break;
      case 'seedDemo':
        generateDemoContent(ss, actingUser);
        responseData = { message: "Demo content generated" };
        break;
      case 'healthCheck':
        responseData = { status: "online", version: "2.5.0", serverTime: new Date().toISOString() };
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
  
  // Logic Fix: Recalculate totalPersons on backend to ensure integrity
  if (sheetName === CONFIG.TABS.GUESTS) {
    payload.totalPersons = (Number(payload.men) || 0) + (Number(payload.women) || 0) + (Number(payload.children) || 0);
  }

  const row = headers.map(h => {
    let val = payload[h];
    if (h === 'phone' || h === 'userId' || h === 'id') return "'" + String(val || '');
    return (val !== undefined && val !== null) ? val : "";
  });
  sheet.appendRow(row);
}

// Security Fix: Loophole resolution for IDOR (Insecure Direct Object Reference)
function updateRowSecure(ss, sheetName, id, updates, actingUser, isAdmin) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdIdx = headers.indexOf('userId');

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // Security Check: Verify ownership
      if (!isAdmin && userIdIdx !== -1 && data[i][userIdIdx] !== actingUser) {
        throw new Error("Security Violation: Unauthorized update request");
      }

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

// Security Fix: Loophole resolution for IDOR
function deleteRowSecure(ss, sheetName, id, actingUser, isAdmin) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdIdx = headers.indexOf('userId');

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // Security Check: Verify ownership
      if (!isAdmin && userIdIdx !== -1 && data[i][userIdIdx] !== actingUser) {
        throw new Error("Security Violation: Unauthorized deletion request");
      }
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function deleteRowsByUser(ss, sheetName, userId) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdIdx = headers.indexOf('userId');
  if (userIdIdx === -1) return;

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][userIdIdx] === userId) {
      sheet.deleteRow(i + 1);
    }
  }
}

function createResponse(success, data, error = null) {
  return ContentService.createTextOutput(JSON.stringify({ success, data, error }))
    .setMimeType(ContentService.MimeType.JSON);
}
