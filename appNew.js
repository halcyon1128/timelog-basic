console.log('app.js loaded');

// Define classes for Employee and TimeLog
class Employee {
    constructor(id, name, email) {
        this.id = parseInt(id);
        this.name = name;
        this.email = email;
    }
}

class TimeLog {
    constructor(employeeId, date, timeIn, timeOut) {
        this.employeeId = parseInt(employeeId);
        this.date = date;
        this.timeIn = timeIn;
        this.timeOut = timeOut;
        this.total = this.calculateTotalHours(this.timeIn, this.timeOut);
        this.overtime = this.calculateOvertimeHours(this.total);
    }

    // Calculate total hours worked using Moment.js
    calculateTotalHours(timeIn, timeOut) {
        const timeInDate = moment(`${timeIn}`, 'HH:mm A');
        const timeOutDate = moment(`${timeOut}`, 'HH:mm A');
        const hoursWorked = (timeOutDate.diff(timeInDate, 'hours', true));
        return parseFloat((hoursWorked) - 1).toFixed(2); // Subtract 1 hour for lunch break
    }

    // Calculate overtime hours worked
    calculateOvertimeHours() {
        const workHours = 8;
        return this.total > workHours ? (parseFloat((this.total - workHours)).toFixed(2)) : 0;
    }
}

// DATABASE PSEUDO-CLASS
const database = {
    employees: [],
    timeLogs: [],
    employeeNum: 0,

    //EMPLOYEES
    // Function to add a new employee
    addEmployee(name, email) {
        this.employeeNum++;
        const employee = new Employee(this.employeeNum, name, email);
        this.employees.push(employee);
        this.updateEmployeeSelect();
        console.log(`Added employee: ${name}, ID: ${this.employeeNum}`);
    },

    editEmployee(employeeId, newName, newEmail) {
        // Find the employee in the array by matching the employeeId
        const employee = this.employees.find(emp => emp.id === employeeId);

        if (employee) {
            // Update the employee's name and email with the new values
            employee.name = newName;
            employee.email = newEmail;
            this.updateEmployeeSelect();
            return true; // Indicate that the employee was found and updated
        } else {
            return false; // Indicate that the employee was not found
        }
    },

    deleteEmployee(employeeId) {
        const index = this.employees.findIndex(emp => emp.id === parseInt(employeeId));
        if (index !== -1) {
            this.employees.splice(index, 1);
            this.updateEmployeeSelect();
            console.log(`Deleted employee with ID: ${employeeId}`);
        } else {
            alert(`Employee with ID ${employeeId} not found.`);
        }
    },


    //TIMELOGS 
    addTimeLog(employeeId, date, timeIn, timeOut) {
        const timeLog = new TimeLog(employeeId, date, timeIn, timeOut);
        this.timeLogs.push(timeLog);
        console.log(`Added time log for employee ID: ${employeeId}`);
    },

    editTimeLog(employeeId, date, newTimeLogIn, newTimeLogOut) {
        const logIndex = this.timeLogs.findIndex(log =>
            log.employeeId === parseInt(employeeId) && log.date === date
        );

        if (logIndex !== -1) {
            // Update the existing time log with new values
            const timeLog = this.timeLogs[logIndex];
            timeLog.timeIn = timeLog.convertTo24HourFormat(newTimeLogIn);
            timeLog.timeOut = timeLog.convertTo24HourFormat(newTimeLogOut);
            timeLog.total = timeLog.calculateTotalHours(timeLog.timeIn, timeLog.timeOut);

            console.log(`Edited time log for employee ID: ${employeeId} on date ${date}`);
        } else {
            console.error(`Time log not found for employee ID ${employeeId} on date ${date}`);
        }
    },

    deleteTimeLog(employeeId, date) {
        const logIndex = this.timeLogs.findIndex(log =>
            log.employeeId === parseInt(employeeId) && log.date === date
        );
        if (logIndex !== -1) {
            this.timeLogs.splice(logIndex, 1);
            console.log(`Deleted time log for employee ID: ${employeeId}`);
        } else {
            alert(`Time log not found for employee ID ${employeeId} on date ${date}`);
        }
    },

    updateEmployeeSelect() {
        const select = $('#employeeSelect');
        select.empty();
        this.employees.forEach(emp => {
            select.append(`<option value="${emp.id}">${emp.name}</option>`);
        });
    }
};



// INITIALIZE REQUIRED ELEMENTS
$(document).ready(() => {

    //populate data on load (FOR FUTURE DATABASE)
    // database.populateEmployeeTable();
    // database.updateEmployeeSelect();
    // database.populateTimeLogTable();


    //init datepickers
    $('#dateTimeLog').datepicker({
        dateFormat: 'mm-dd-yy',
        minDate: new Date(2000, 1, 1),
        maxDate: '+1Y'
    });

    //init timepicker
    // filter inputs timeInTimeLog and timeOutTimeLog to use only HH:MM AM/PM format
    $('#timeInTimeLog, #timeOutTimeLog').timepicker({
        timeFormat: 'h:i A',
        interval: 1,
        minTime: '12:00 AM',
        maxTime: '11:59 PM',
        startTime: '5:00 AM',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        forceRoundTime: true,
        step: 1
    }).on('keydown keypress', function (e) {
        const allowedKeys = [8, 37, 38, 39, 40, 46, 9, 16, 17, 18];
        if (!allowedKeys.includes(e.which) && (e.which < 48 || e.which > 57) && e.which !== 58) {
            e.preventDefault();
        }
    }).on('input', function () {
        let value = $(this).val().replace(/[^0-9:]/g, '');
        $(this).val(value.slice(0, 5));
    }).on('keydown', function (e) {
        if (e.which === 65 || e.which === 97) {
            e.preventDefault();
            let currentValue = $(this).val();
            if (!currentValue.endsWith('AM')) {
                $(this).val(currentValue + ' AM');
            }
        } else if (e.which === 80 || e.which === 112) {
            e.preventDefault();
            let currentValue = $(this).val();
            if (!currentValue.endsWith('PM')) {
                $(this).val(currentValue + ' PM');
            }
        }
    });

    //init check-all-checkboxes checkbox
    checkboxEnabler();

});

// MODAL HANDLERS!!
$(document).on("click", function (event) {
    // Time log modal handler


    if ($(event.target).is('#addTimeLogBtn') &&
        $('#employeeSelect').val()) {
        $('#timeLogModal').removeClass('hidden');
        console.log("timeLog modal handler opening");
    }
    if (!$(event.target).closest("#timeLogModal").length &&
        !$(event.target).is("#addTimeLogBtn") &&
        !$('.ui-datepicker').is(':visible') &&
        !$(event.target).closest('.ui-timepicker-wrapper').length &&
        !$('#timeLogModal').hasClass('hidden')) {
        $("#timeLogModal").addClass("hidden");
        resetTimeLogInputs();
        console.log("timeLog modal closing (datepicler/timepicker variant)");
    }
    if ($(event.target).is('#pushTimeLogBtn')) {
        $('#timeLogModal').addClass('hidden');
        console.log("timeLog modal handler closing (default)");
    }
    // Add employee modal handler
    if ($(event.target).is('#addEmployeeBtn')) {
        $('#addEmployeeModal').removeClass('hidden');
        console.log("add employee modal handler opening");
    }
    if (!$(event.target).closest("#addEmployeeModal").length &&
        !$(event.target).is("#addEmployeeBtn") &&
        !$('#addEmployeeModal').hasClass('hidden')) {
        $("#addEmployeeModal").addClass("hidden");
        console.log("add employee modal handler closing");
    }

    // Delete employee/timelog modal handler
    if ($(event.target).is('#deleteSelectedBtn')) {
        $('#confirmDeleteModal').removeClass('hidden');
        console.log("delete employee modal handler opening");
    }
    if ($(event.target).is('.deleteTimeLogBtn')) {
        $('#confirmDeleteModal').removeClass('hidden');
        $('#pushDeleteTimeLogBtn').removeClass('hidden');
        $('#pushDeleteEmployeeBtn').addClass('hidden');
        console.log("delete timeLog modal handler opening");
    }
    if (!$(event.target).closest('#confirmDeleteModal').length &&
        !$(event.target).is('#deleteSelectedBtn') &&
        !$('#confirmDeleteModal').hasClass('hidden') &&
        !$(event.target).is('.deleteTimeLogBtn')) {
        $('#confirmDeleteModal').addClass('hidden');
        console.log("delete employee modal handler closing: delete confirmed");
        checkboxEnabler();
    }
    if ($(event.target).is('#pushDeleteTimeLogBtn')) {
        $('#pushDeleteTimeLogBtn').addClass('hidden');
        $('#pushDeleteEmployeeBtn').removeClass('hidden');
        $('#confirmDeleteModal').addClass('hidden');
        console.log("delete timeLog modal handler closing: delete confirmed");
    }
    if ($(event.target).is('#cancelDeleteBtn')) {
        $('#confirmDeleteModal').addClass('hidden');
        console.log("delete employee/timeLog modal handler closing: delete cancelled");
    }

    // edit employee modal handler (switch buttons)
    if ($(event.target).is('.editEmployeeBtn')) {
        $('#addEmployeeModal').removeClass('hidden');
        $('#pushEditEmployeeBtn').removeClass('hidden');
        $('#pushNewEmployeeBtn').addClass('hidden');
        console.log("edit employee modal handler opening");
    }
    if ($(event.target).is('#pushEditEmployeeBtn')) {
        $('#pushEditEmployeeBtn').addClass('hidden');
        $('#pushNewEmployeeBtn').removeClass('hidden');
        $('#addEmployeeModal').addClass('hidden');
        resetEmployeeInputs();
        console.log("edit employee modal handler closing");
        checkboxEnabler();
    }

    // edit timeLog modal handler 
    if ($(event.target).is('.editTimeLogBtn')) {
        $('#timeLogModal').removeClass('hidden');
        $('#pushTimeLogEdit').removeClass('hidden');
        $('#dateTimelog').addClass('hidden');
        $('#pushTimeLogBtn').addClass('hidden');
        console.log("edit timelog modal handler opening");
    }
    if ($(event.target).is('#pushTimeLogEdit')) {
        $('#dateTimelog').removeClass('hidden');
        $('#pushTimeLogBtn').removeClass('hidden');
        $('#timeLogModal').addClass('hidden');
        $('#pushTimeLogEdit').addClass('hidden');
        console.log("edit timelog modal handler closing");
    }

});
// Functions to handle adding and deleting employees and time logs



//ADD NEW EMPLOYEE!!! (NOT EDIT!!)
$(document).on('click', '#pushNewEmployeeBtn', () => {
    const name = $('#addEmployeeInput').val();
    const email = $('#addEmailInput').val();
    const isRedundant = redundancyChecker(name, email, database.employees);

    if (isRedundant) {
        alert('Name/Email already taken');
    } else {
        database.addEmployee(name, email);
        populateEmployeeTable();
        resetEmployeeInputs();
        $('#addEmployeeModal').addClass('hidden');
    }
});


// EDIT EMPLOYEE WITH HANDLERS AND FETCHERS
let empIdForEdit = null; //stores rowId(employee id) as global
$(document).on('click', '.editEmployeeBtn', function () {
    const rowId = $(this).closest('tr').attr('id');
    empIdForEdit = rowId; // rowId stored in global --used as reference for editing employee name/email
    console.log('empIdForEdit =', empIdForEdit);
})
$(document).on('click', '#pushEditEmployeeBtn', () => {
    const name = $('#addEmployeeInput').val();
    const email = $('#addEmailInput').val();
    const isRedundant = redundancyEditChecker(name, email, database.employees);

    empId = parseInt(empIdForEdit); //global variable value(employee id) fetched
    empIdForEdit = null; //global variable reset

    if (isRedundant) {
        alert('Name/Email already taken');
    } else {
        console.log('empId =', empId);
        database.editEmployee(empId, name, email);
        populateEmployeeTable();
        resetEmployeeInputs();
        $('#addEmployeeModal').addClass('hidden');
        console.log(`Edited employee = ${empId.name} (${empId.email}`)
    }
});

$(document).on('click', '#pushDeleteEmployeeBtn', function () {
    const checkedCheckboxes = $('#tableEmployees').find('input[type="checkbox"]:checked');
    if (checkedCheckboxes.length > 0) {
        checkedCheckboxes.each(function () {
            const employeeId = $(this).closest('tr').attr('id');
            database.deleteEmployee(employeeId);
            $(this).closest('tr').remove();
        });
        $("#confirmDeleteModal").addClass("hidden");
    } else {
        alert('Please select at least one employee to delete.');
    }
});

let rowToBeRemoved = null
$(document).on('click', '.deleteTimeLogBtn', function () {
    rowToBeRemoved = $(this).closest('tr').attr('data-time-log-id');
    console.log('timeLogRowToBeRemoved =', rowToBeRemoved);
});
$(document).on('click', '#pushDeleteTimeLogBtn', function () {
    const empSelect = parseInt($('#employeeSelect').val());
    database.deleteTimeLog(empSelect, rowToBeRemoved);
    populateTimeLogTable();
    $("#confirmDeleteModal").addClass("hidden");
    rowToBeRemoved = null
})

// add to timeLog array + populate timeLog tbody
$(document).on('click', '#pushTimeLogBtn', () => {
    const employeeId = parseInt($('#employeeSelect').val(), 10);
    const date = $('#dateTimeLog').val();
    const timeIn = $('#timeInTimeLog').val();
    const timeOut = $('#timeOutTimeLog').val();
    console.log('timeIn =', timeIn);
    console.log('timeOut =', timeOut);
    database.addTimeLog(employeeId, date, timeIn, timeOut);
    populateTimeLogTable();
    resetTimeLogInputs();
    checkboxEnabler();
});
//populate select
$(document).on('change', '#employeeSelect', () => {
    populateTimeLogTable();
    console.log('employees =', database.employees);
    console.log('timeLogs =', database.timeLogs);
});

//handle edit row / employee timelogs
let rowToBeEdited = null; //stores the row id to be edited, acts as reference for timelog edit
let catchEmployeeSelect = null; //stores employee select value (since select determines timelog reference)
//edit button in row stores parent row id 
$(document).on('click', '.editTimeLogBtn', function () {
    rowToBeEdited = $(this).closest('tr').data('time-log-id');
    catchEmployeeSelect = parseInt($('#employeeSelect').val(), 10);
    console.log('rowToBeEdited =', rowToBeEdited);
    console.log('employeeSelect =', catchEmployeeSelect);

})


$(document).on('click', '#pushTimeLogEdit', () => {
    // Get values from form
    const newTimeIn = $('#timeInTimeLog').val();
    const newTimeOut = $('#timeOutTimeLog').val();
    // use fetched id and date from editTimeLogBtn
    const employeeId = catchEmployeeSelect;
    catchEmployeeSelect = null;

    const date = rowToBeEdited;
    // Find the time log in the database
    const timeLog = database.timeLogs.find(log => log.id === rowToBeEdited);

    if (employeeId && date) {
        //modify array
        editTimeLog(employeeId, date, newTimeIn, newTimeOut); //modify employee array's timelogs

        // change table rows
        if (timeLog) {
            // Update the row in the table
            const row = $(`#timeLogTable tr[data-time-log-id='${rowToBeEdited}']`);
            row.find('td').eq(1).text(newTimeIn); // Update timeIn cell
            row.find('td').eq(2).text(newTimeOut); // Update timeOut cell
            console.log(`Updated time log for row ID: ${rowToBeEdited}`);

        } else {
            console.error(`Time log not found for row ID ${rowToBeEdited}`);

        }
    } else {
        console.error("No row selected for editing.");

    }
});

//check all checkboxes
$(document).on('click', '#checkAll', () => {
    if ($('#checkAll').prop('checked')
    ) {
        ion
        $('.employeesCheckbox').prop('checked', true);
    } else {
        $('.employeesCheckbox').prop('checked', false);
    }
});


//FUNCTIONS section:
function populateEmployeeTable() {
    $('#tableEmployees tbody').empty();
    const allEmployees = database.employees;
    allEmployees.forEach(employee => {
        $('#tableEmployees tbody').append(`
            <tr id="${employee.id}" class="bg-white">
                <td class="p-2"><input type="checkbox" class="employeesCheckbox"></td>
                <td class="employeeName p-2 text-base md:text-sm leading-tight break-words">${employee.name}</td>
                <td class="employeeEmail p-2 text-base md:text-sm leading-tight break-words">${employee.email}</td>
                <td class="employeeEdit p-2 whitespace-nowrap">
                    <button class="editEmployeeBtn text-zinc-400 hover:text-teal-500 hover:font-bold">edit</button>
                </td>
            </tr>
        `);
    });

    checkboxEnabler();
}

function populateTimeLogTable() {
    $('#tableTimeLog tbody').empty();
    const employeeSelectValue = parseInt($('#employeeSelect').val(), 10);
    const filteredTimeLogs = database.timeLogs.filter(log => log.employeeId === employeeSelectValue);
    console.log('filteredTimeLogs =', filteredTimeLogs);

    filteredTimeLogs.forEach(log => {
        const timeIn = (log.timeIn);
        const timeOut = (log.timeOut);
        const totalTime = (log.total);
        const overtime = (log.overtime);


        $('#tableTimeLog tbody').append(`
            <tr data-time-log-id="${log.date}">
                <td class="whitespace-nowrap p-2 text-base md:text-sm leading-tight break-words">${log.date}</td>
                <td class="timeInTimeLog whitespace-nowrap p-2 text-base md:text-sm leading-tight break-words">${timeIn}</td>
                <td class="timeOutTimeLog whitespace-nowrap p-2 text-base md:text-sm leading-tight break-words">${timeOut}</td>
                <td class="whitespace-nowrap p-2 text-base md:text-sm leading-tight break-words">${totalTime} hrs</td>
                <td class="whitespace-nowrap p-2 text-base md:text-sm leading-tight break-words">${overtime} hrs</td>
                <td class="whitespace-nowrap p-2">
                    <button class="editTimeLogBtn text-zinc-400 hover:text-teal-500 hover:font-bold">edit</button>
                    <button class="deleteTimeLogBtn text-zinc-400 hover:text-red-500 hover:font-bold">delete</button>
                </td> 
            </tr>   
        `);
    });
}

function removeTimeLog(timeLogId) {
    const index = database.timeLogs.findIndex(log => log.date === timeLogId);
    database.timeLogs.splice(index, 1);
    console.log(`Deleted time log for employee ID: ${timeLogId}`);
    populateTimeLogTable();
}
function resetEmployeeInputs() {
    $('#addEmployeeInput').val('');
    $('#addEmailInput').val('');
}
function resetTimeLogInputs() {
    $('#dateTimeLog').val('');
    $('#timeInTimeLog').val('');
    $('#timeOutTimeLog').val('');
}
function redundancyChecker(name, email, array) {
    return array.some(item => item.name === name || item.email === email);
}
function redundancyEditChecker(name, email, array) {
    return array.some(item => item.name === name && item.email === email);
}

function convertTo12HourFormat(time24h) {
    let [hours, minutes] = time24h.split(':').map(Number);
    const modifier = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert 0:00 and 12:00 to 12, keeping other hours within 1-11
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${modifier}`;
}

function checkboxEnabler() {
    if ($('#tableEmployees tbody').children().length > 0) {
        $('#checkAll').addClass('hidden');
    } else {
        $('#checkAll').removeClass('hidden');
    }
}


//#confirmDeleteModal


//#pushDeleteEmployeeBtn
//#cancelDeleteBtn

//