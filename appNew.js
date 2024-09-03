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
        this.total = this.calcTotalInTimeLogArray(this.timeIn, this.timeOut);
        this.overtime = this.calcOvertimeInArray(this.timeIn, this.timeOut);
    }

    //calcTotalInTimeLogArray
    // Calculate total hours worked using Moment.js
    calcTotalInTimeLogArray(timeIn, timeOut) {
        // Parse the input times as Moment.js objects
        const format = 'h:mm A';
        const timeInDate = moment(timeIn, format);
        const timeOutDate = moment(timeOut, format);

        // Calculate the duration between timeIn and timeOut
        const durationWithoutLunchbreak = moment.duration(timeOutDate.diff(timeInDate));
        const duration = durationWithoutLunchbreak.subtract(1, 'hour');

        // Calculate total hours and minutes
        const totalHours = duration.asHours();
        const hoursPart = Math.floor(totalHours);
        const minutesPart = duration.minutes();

        if (duration.asMilliseconds() < 0) {
            return '';
        }
        // Return total time in hours or minutes
        if (totalHours < 1) {
            // Less than 1 hour, return minutes

            return `${minutesPart}min`;
        } else {
            // 1 hour or more, return hours and minutes
            return `${hoursPart}hrs ${minutesPart}min`;
        }

    }

    // Calculate overtime hours worked 
    calcOvertimeInArray(timeIn, timeOut) {
        const format = 'h:mm A';
        const timeInDate = moment(timeIn, format);
        const timeOutDate = moment(timeOut, format);
        const totalTime = moment.duration(timeOutDate.diff(timeInDate));
        const workHours = 8;
        const overtimeInHours = (totalTime.asHours() - 1) - workHours; //"-1 to account for lunch break"    

        const overtime = () => {
            if (overtimeInHours >= 2) {
                return `${Math.floor(overtimeInHours)}hrs 
             ${(overtimeInHours % 1) * 60}min`;
            } else if (overtimeInHours >= 1) {
                return `${Math.floor(overtimeInHours)}hr 
             ${(overtimeInHours % 1) * 60}min`;
            } else if (overtimeInHours > 0) {
                const minutesPart = (overtimeInHours % 1) * 60
                return `${minutesPart}min`;
            } else {
                return '';
            }
        }

        console.log('calcOTinArray overtime: ', overtime());
        return overtime();
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

    editTimeLog(employeeId, prevDate, newDate, newTimeLogIn, newTimeLogOut) {
        const timeLog = this.timeLogs.find(log =>
            log.employeeId === parseInt(employeeId) && log.date === prevDate
        );

        if (timeLog) {
            timeLog.Date = newDate;
            timeLog.timeIn = newTimeLogIn;
            timeLog.timeOut = newTimeLogOut;
            timeLog.total = timeLog.calcTotalInTimeLogArray(timeLog.timeIn, timeLog.timeOut);
            timeLog.overtime = timeLog.calcOvertimeInArray(timeLog.timeIn, timeLog.timeOut);
            console.log(`Edited time log for employee ID: ${employeeId} on date ${prevDate}`);
        } else {
            alert(`Time log not found for employee ID ${employeeId} on date ${prevDate}. Editing canceled.`);
        }
        return timeLog;

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
        minDate: new Date(),
        maxDate: '+1Y',
        beforeShowDay: (date) => {
            const day = date.getDay();
            return [(day !== 0 && day !== 6)];
        }
    });

    //init timepicker
    // filter inputs timeInTimeLog and timeOutTimeLog to use only HH:MM AM/PM format
    $('#timeInTimeLog, #timeOutTimeLog').timepicker({
        timeFormat: 'h:i A',
        interval: 15,
        minTime: '8:00 AM',
        maxTime: '10:00 PM',
        startTime: '8:00 AM',
        dynamic: true,
        dropdown: true,
        scrollbar: true,
        forceRoundTime: true,
        step: 15
    }).on('keydown keypress', function (e) {
        const allowedKeys = [8, 37, 38, 39, 40, 46, 9, 16, 17, 18, 65, 97, 80, 112];
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

});

// MODAL HANDLERS!!
$(document).on("click", function (event) {


    // // EMPLOYEE MODAL HANDLERS

    // Add employee modal handler
    if ($(event.target).is('#addEmployeeBtn')) {
        disableMainButtons();
        $('#addEmployeeModal').removeClass('hidden');
        $('#pushNewEmployeeBtn').removeClass('hidden');
        $('#pushEditEmployeeBtn').addClass('hidden');
        console.log("add employee modal handler opening");
        clearEmpModal();
        return;
    }



    // edit employee modal handler (switch buttons)
    if ($(event.target).is('.editEmployeeBtn')) {
        disableMainButtons();
        $('#addEmployeeModal').removeClass('hidden');
        $('#pushEditEmployeeBtn').removeClass('hidden');
        $('#pushNewEmployeeBtn').addClass('hidden');
        console.log("editEmployeeBtn clicked!");
        return;
    }

    // close employee modal handler
    if (!$(event.target).closest("#addEmployeeModal").length && //check if click is not inside of modal
        !$(event.target).is("#addEmployeeBtn") && //check if click is not the button
        !$('#addEmployeeModal').hasClass('hidden')) { //check if modal is not hidden
        $("#addEmployeeModal").addClass("hidden");  //close modal
        enableMainButtons();
        console.log("add employee modal handler closing");
        return;
    }

    // TIME LOG MODAL HANDLERS

    // Add timeLog modal handler
    if ($(event.target).is('#addTimeLogBtn')) {


        if (noEmpDetected()) {
            return console.log("no employee detected");
        }
        if ($('#employeeSelect').val()) {
            disableMainButtons();
            showEmpInModal();
            $('#timeLogModal').removeClass('hidden');
            console.log("timeLog modal handler opening");
            return;
        }
    }

    // close timeLog modal handler (datepicler/timepicker variant)
    if (!$(event.target).closest("#timeLogModal").length &&
        !$(event.target).is("#addTimeLogBtn") &&
        !$('.ui-datepicker').is(':visible') &&
        !$(event.target).closest('.ui-timepicker-wrapper').length &&
        !$('#timeLogModal').hasClass('hidden')) {

        if (isDropdownVisible()) {
            return;
        }
        if (!isDropdownVisible()) {
            $('#addTimeLogBtn').prop('disabled', true);
            $("#timeLogModal").addClass("hidden");
            resetTimeLogInputs();
            clearTimeLogModal();
            enableMainButtons();
            console.log("timeLog modal closing (datepicler/timepicker variant)");
            return;
        }
    }

    // close timeLog modal handler (default)
    if ($(event.target).is('#pushTimeLogBtn')) {
        enableMainButtons();
        $('#timeLogModal').addClass('hidden');
        console.log("timeLog modal handler closing (default)");
        return;
    }

    // edit timeLog modal handler
    if ($(event.target).is('.editTimeLogBtn')) {
        disableMainButtons();
        $('#timeLogModal').removeClass('hidden');
        $('#pushTimeLogEdit').removeClass('hidden');
        $('#dateTimelog').addClass('hidden');
        $('#pushTimeLogBtn').addClass('hidden');
        console.log("edit timelog modal handler opening");
        return;
    }
    // close edit timeLog modal handler
    if ($(event.target).is('#pushTimeLogEdit')) {
        enableMainButtons();
        $('#dateTimelog').removeClass('hidden');
        $('#pushTimeLogBtn').removeClass('hidden');
        $('#timeLogModal').addClass('hidden');
        $('#pushTimeLogEdit').addClass('hidden');
        console.log("edit timelog modal handler closing");
        return;
    }


    // DELETE HANDLERS

    // delete employee modal handler
    if ($(event.target).is('#deleteSelectedBtn')) {


        if (noEmpDetected()) {
            return console.log("no employee detected");
        }
        if (checkboxesEmpty()) {
            return console.log("no checkbox selected");
        }
        if ($('#employeeSelect').val()) {
            disableMainButtons();
            $('#confirmDeleteModal').removeClass('hidden');
            console.log("delete employee modal handler opening");
            return;
        }
    }

    // delete timeLog modal handler
    if ($(event.target).is('.deleteTimeLogBtn')) {
        disableMainButtons();
        $('#confirmDeleteModal').removeClass('hidden');
        $('#pushDeleteTimeLogBtn').removeClass('hidden');
        $('#pushDeleteEmployeeBtn').addClass('hidden');
        console.log("delete timeLog modal handler opening");
    }


    // close delete modal handler
    if (!$(event.target).closest('#confirmDeleteModal').length &&
        !$(event.target).is('#deleteSelectedBtn') &&
        !$('#confirmDeleteModal').hasClass('hidden') &&
        !$(event.target).is('.deleteTimeLogBtn')) {
        enableMainButtons();
        $('#confirmDeleteModal').addClass('hidden');
        console.log("delete employee modal handler closing: delete confirmed");
        checkboxEnabler();
    }
    // close delete modal handler
    if ($(event.target).is('#pushDeleteTimeLogBtn')) {
        enableMainButtons();
        $('#pushDeleteTimeLogBtn').addClass('hidden');
        $('#pushDeleteEmployeeBtn').removeClass('hidden');
        $('#confirmDeleteModal').addClass('hidden');
        console.log("delete timeLog modal handler closing: delete confirmed");
    }
    // close delete modal handler
    if ($(event.target).is('#cancelDeleteBtn')) {
        enableMainButtons();
        $('#confirmDeleteModal').addClass('hidden');
        console.log("delete employee/timeLog modal handler closing: delete cancelled");
    }





});
// Functions to handle adding and deleting employees and time logs


//ADD NEW EMPLOYEE!!! (NOT EDIT!!)
$(document).on('click', '#pushNewEmployeeBtn', () => {
    const name = $('#addEmployeeInput').val().trim();
    const email = $('#addEmailInput').val().trim();
    const nameIsRedundant = redundancyNameChecker(name, database.employees);
    const emailIsRedundant = redundancyEmailChecker(email, database.employees);
    const nameIsBlank = blankInputChecker(name);
    const emailIsBlank = blankInputChecker(email);

    if (nameIsRedundant) {
        alert('Name is already taken. Please choose another name.');
    }
    else if (emailIsRedundant) {
        alert('Email is already taken. Please choose another email.');
    }
    else if (nameIsBlank) {
        alert('Name cannot be blank');
    }
    else if (emailIsBlank) {
        alert('Email cannot be blank');
    }
    else if (isValidEmail(email) === false) {
        alert('Please enter a valid email');
    }
    else {
        enableMainButtons();
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
    populateEmployeeFieldsOnEdit(empIdForEdit);
    console.log('empIdForEdit =', empIdForEdit);
})

$(document).on('click', '#pushEditEmployeeBtn', () => {

    const excludeId = parseInt(empIdForEdit);
    const name = $('#addEmployeeInput').val();
    const email = $('#addEmailInput').val();
    const nameIsRedundant = redundancyEditNameChecker(name, database.employees, excludeId);
    const emailIsRedundant = redundancyEditEmailChecker(email, database.employees, excludeId);
    const nameIsBlank = blankInputChecker(name);
    const emailIsBlank = blankInputChecker(email);


    empId = parseInt(empIdForEdit); //global variable value(employee id) fetched
    empIdForEdit = null; //global variable reset

    if (nameIsRedundant) {
        alert('Name is already taken. Please choose another name.');
    }
    else if (emailIsRedundant) {
        alert('Email is already taken. Please choose another email.');
    }
    else if (nameIsBlank) {
        alert('Name cannot be empty');
    }
    else if (emailIsBlank) {
        alert('Email cannot be empty');
    }
    else if (isValidEmail(email) === false) {
        alert('Please enter a valid email');
    }
    else {
        enableMainButtons();
        console.log('empId =', empId);
        database.editEmployee(empId, name, email);
        populateEmployeeTable();
        resetEmployeeInputs();
        $('#addEmployeeModal').addClass('hidden');
        console.log(`Edited employee = ${empId.name} (${empId.email}`)
    }
});

$(document).on('click', '#pushDeleteEmployeeBtn', function () {
    const checkedCheckboxes = $('#tableEmployees tbody').find('input[type="checkbox"]:checked');
    if (checkedCheckboxes.length > 0) {
        checkedCheckboxes.each(function () {
            const employeeId = $(this).closest('tr').attr('id');
            database.deleteEmployee(employeeId);
            $(this).closest('tr').remove();
        });
        $("#confirmDeleteModal").addClass("hidden");
        $("#checkAll").prop("checked", false);

    } else {
        alert('Please select at least one employee to delete.');
        return

    }
    populateTimeLogTable();

});

//populate select
$(document).on('change', '#employeeSelect', () => {
    populateTimeLogTable();
    console.log('employees =', database.employees);
    console.log('timeLogs =', database.timeLogs);
});



//TIMELOG HANDLERS!!! 
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
    const dateEmpty = blankInputChecker(date);
    const timeInEmpty = blankInputChecker(timeIn);
    const timeOutEmpty = blankInputChecker(timeOut);

    if (dateEmpty) {
        alert('Date cannot be empty!');
        return
    }
    if (timeInEmpty) {
        alert('Time In cannot be empty!');
        return
    }
    if (timeOutEmpty) {
        alert('Time Out cannot be empty!');
        return
    }

    if (timeInvalid(timeIn, timeOut)) {
        alert('Time In should not be earlier than Time Out!');
        return
    }
    if (date && timeIn && timeOut) {
        enableMainButtons();
        database.addTimeLog(employeeId, date, timeIn, timeOut);
        populateTimeLogTable();
        resetTimeLogInputs();
        checkboxEnabler();
        return
    }
});



//handle edit row / employee timelogs
let rowToBeEdited = null; //stores the row id to be edited, acts as reference for timelog edit
let catchEmployeeSelect = null; //stores employee select value (since select determines timelog reference)
//edit button in row stores parent row id 
$(document).on('click', '.editTimeLogBtn', function () {
    rowToBeEdited = $(this).closest('tr').data('time-log-id');
    catchEmployeeSelect = parseInt($('#employeeSelect').val(), 10);
    populateTimeLogFieldsOnEdit(rowToBeEdited);
    console.log('rowToBeEdited =', rowToBeEdited);
    console.log('employeeSelect =', catchEmployeeSelect);

})


$(document).on('click', '#pushTimeLogEdit', () => {
    const empId = catchEmployeeSelect;
    const date = rowToBeEdited;
    const newDate = $('#dateTimeLog').val();
    const newTimeIn = $('#timeInTimeLog').val();
    const newTimeOut = $('#timeOutTimeLog').val();
    const dateEmpty = blankInputChecker(newDate);
    const timeInEmpty = blankInputChecker(newTimeIn);
    const timeOutEmpty = blankInputChecker(newTimeOut);

    if (dateEmpty) {
        alert('Date cannot be empty!');
        return
    }
    if (timeInEmpty) {
        alert('Time In cannot be empty!');
        return
    }
    if (timeOutEmpty) {
        alert('Time Out cannot be empty!');
        return
    }

    if (timeInvalid(newTimeIn, newTimeOut)) {
        alert('Time In should not be earlier than Time Out!');
        return
    }
    if (empId && date && newDate && newTimeIn && newTimeOut) {
        enableMainButtons();
        database.editTimeLog(empId, date, newDate, newTimeIn, newTimeOut);
        populateTimeLogTable();

        rowToBeEdited = null;
        catchEmployeeSelect = null;

        console.log("edit timelog successful");
        $('#timeLogModal').addClass('hidden');
        resetTimeLogInputs();
        return
    }
});

//check all checkboxes
$(document).on('click', '#checkAll', () => {
    checkAllBoxes();
});

$(document).on('blur', '#timeInTimeLog, #timeOutTimeLog', function () {
    fillTimeLogModal();
});

$(document).on('focus',
    '#addEmployeeInput, #addEmailInput,#dateTimeLog, #timeInTimeLog, #timeOutTimeLog',
    function (event) {
        checkAndRemoveGray(event);
    })






// END of DOM EVENT LISTENERS


//FUNCTIONS section:



function populateEmployeeTable() {
    $('#tableEmployees tbody').empty();
    const allEmployees = database.employees;
    allEmployees.forEach(employee => {
        $('#tableEmployees tbody').append(`
            <tr id="${employee.id}" class="bg-white">
                <td class="p-2"><input type="checkbox" class="employeesCheckbox"></td>
                <td class="employeeName">${employee.name}</td>
                <td class="employeeEmail">${employee.email}</td>
                <td class="employeeEdit whitespace-nowrap">
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
            <tr data-time-log-id="${log.date}" class="text-xs font-thin sm:text-base sm:font-semibold leading-tight">
                <td class="whitespace-nowrap">${log.date}</td>
                <td class="timeInTimeLog whitespace-nowrap">${timeIn}</td>
                <td class="timeOutTimeLog whitespace-nowrap">${timeOut}</td>
                <td class="whitespace-nowrap">${(totalTime)}</td>
                <td class="whitespace-nowrap">${(overtime)}</td>
                <td class="whitespace-nowrap">
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

function convertTo12HourFormat(time24h) {
    let [hours, minutes] = time24h.split(':').map(Number);
    const modifier = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert 0:00 and 12:00 to 12, keeping other hours within 1-11
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${modifier}`;
}
function checkboxEnabler() {
    if ($('#tableEmployees tbody').children().length > 0) {
        $('#checkAll').removeClass('hidden');
    } else {
        $('#checkAll').addClass('hidden');
    }
}
function checkAllBoxes() {
    if ($('#checkAll').prop('checked')) {
        $('.employeesCheckbox').prop('checked', true);
    } else {
        $('.employeesCheckbox').prop('checked', false);
    }
}
function formatHoursToTime(hours) {
    // Convert the hours to a moment duration object
    const duration = moment.duration(hours, 'hours');

    // Get the hours and minutes from the duration
    const hoursPart = Math.floor(duration.asHours());
    const minutesPart = duration.minutes();

    // Format the output as "Xhrs Ymin"
    const formattedTime = `${hoursPart}hrs ${minutesPart}min`;

    return formattedTime;
}
function populateTimeLogFieldsOnEdit(rowId) {
    const row = $(`#tableTimeLog tr[data-time-log-id='${rowId}']`);
    const timeIn = row.find('td').eq(1).text();
    const timeOut = row.find('td').eq(2).text();

    $('#dateTimeLog').val(rowId);
    $('#timeInTimeLog').val(timeIn);
    $('#timeOutTimeLog').val(timeOut);

    greyifyEditTimeLogFields();
}
function populateEmployeeFieldsOnEdit(rowId) {
    console.log('populateEmployeeFieldsOnEdit passed; rowId =', rowId);
    const row = $(`#tableEmployees tr[id='${rowId}']`);
    const name = row.find('td').eq(1).text();
    const email = row.find('td').eq(2).text();
    console.log('populateEmployeeFieldsOnEdit: name = ', name, 'email = ', email);
    $('#addEmployeeInput').val(name);
    $('#addEmailInput').val(email);

    greyifyEditEmployeeFields();
}
function isGray(event) {
    const target = $(event.target);
    return target.hasClass('text-slate-400');
}
function checkAndRemoveGray(event) {
    // Check if the target element has the class 'text-slate-400'
    if (isGray(event)) {
        // Remove the class 'text-slate-400' if it exists
        $(event.target).removeClass('text-slate-400');
    }
}
function greyifyEditTimeLogFields() {
    $('#dateTimeLog, #timeInTimeLog, #timeOutTimeLog').addClass('text-slate-400');
}
function greyifyEditEmployeeFields() {
    $('#addEmployeeInput, #addEmailInput').addClass('text-slate-400');
}
function populateTimeLogName(rowId) {
    const emp = database.employees.find(emp => emp.id === parseInt(rowId));
    $('#employeeNameTimeLog').val(emp.name);
}
function clearTimeLogName() {
    $('#employeeNameTimeLog').val('');
}
function fillTimeLogModal() {

    const timeIn = $('#timeInTimeLog').val();
    const timeOut = $('#timeOutTimeLog').val();
    const showTotal = calculateTotaHrsWorked(timeIn, timeOut);
    const showOT = calculateOvertime(timeIn, timeOut);


    if (showTotal === "NaNhrs NaNmin") {
        $('#totalTimeLog').text('');
        $('#overtimeTimeLog').text('');
        console.log('fillTimeLogModal failed; showTotal =', showTotal);
    } else {
        $('#totalTimeLog').text(showTotal);
        $('#overtimeTimeLog').text(showOT);
        console.log('fillTimeLogModal successful')

    }
    console.log(`time in: ${timeIn}, time out: ${timeOut}, total: (${showTotal})`);
}
function clearTimeLogModal() {
    $('#totalTimeLog').text('');
    $('#overtimeTimeLog').text('');
    console.log('cleared time log modal');
}
function clearEmpModal() {
    $('#addEmployeeInput').val('');
    $('#addEmailInput').val('');
    console.log('cleared employee modal');
}
// Calculate total hours worked using Moment.js
function calculateTotaHrsWorked(timeIn, timeOut) {

    const format = 'h:mm A';
    const timeInDate = moment(timeIn, format);
    const timeOutDate = moment(timeOut, format);

    // Calculate the duration between timeIn and timeOut
    const durationWithoutLunchbreak = moment.duration(timeOutDate.diff(timeInDate));
    const duration = durationWithoutLunchbreak.subtract(1, 'hour');


    // Calculate total hours and minutes
    const totalHours = duration.asHours();
    const hoursPart = Math.floor(totalHours);
    const minutesPart = duration.minutes();

    if (duration.asMilliseconds() < 0) {
        return '';
    }
    // Return total time in hours or minutes
    if (totalHours < 1) {
        // Less than 1 hour, return minutes
        return `${minutesPart}min`;
    } else {
        // 1 hour or more, return hours and minutes
        return `${hoursPart}hrs ${minutesPart}min`;
    }

}
// Calculate overtime hours worked 
const calculateOvertime = (timeIn, timeOut) => {
    const format = 'h:mm A';
    const timeInDate = moment(timeIn, format);
    const timeOutDate = moment(timeOut, format);
    const totalTime = moment.duration(timeOutDate.diff(timeInDate));
    const workHours = 8;
    const overtimeInHours = (totalTime.asHours() - 1) - workHours; //"-1 to account for lunch break"    

    const overtime = () => {
        if (overtimeInHours >= 2) {
            return `${Math.floor(overtimeInHours)}hrs 
             ${(overtimeInHours % 1) * 60}min`;
        } else if (overtimeInHours >= 1) {
            return `${Math.floor(overtimeInHours)}hr 
             ${(overtimeInHours % 1) * 60}min`;
        } else if (overtimeInHours > 0) {
            const minutesPart = (overtimeInHours % 1) * 60
            return `${minutesPart}min`;
        } else {
            return '';
        }
    }

    return overtime;
};


function showEmpInModal() {
    const emp = $('#employeeSelect').find('option:selected').text();
    console.log(emp);
    $('#employeeNameTimeLog').text(emp);

}

function timeInvalid(inputTimeIn, inputTimeOut) {
    //parse time
    const format = 'h:mm A';
    const timeIn = moment(inputTimeIn, format);
    const timeOut = moment(inputTimeOut, format);

    // Check if timeIn is later than or equal to timeOut
    return timeIn.isSameOrAfter(timeOut);
}


function redundancyNameChecker(name, array) {
    return array.some(item => item.name === name)
}

function redundancyEmailChecker(email, array) {
    return array.some(item => item.email === email)
}

function blankInputChecker(input) {
    return input === '';
}

function isValidEmail(email) {
    return validator.isEmail(email);
}

function redundancyEditNameChecker(name, employees, excludeId) {
    return employees.some(item => item.name === name && item.id !== excludeId);
}

function redundancyEditEmailChecker(email, employees, excludeId) {
    return employees.some(item => item.email === email && item.id !== excludeId);
}

function noEmpDetected() {
    if (database.employees.length === 0) {
        alert('No employee detected');
        return true;
    }
    return false;
}

function checkboxesEmpty() {
    if ($('.employeesCheckbox:checked').length === 0) {
        alert('Select an employee first!');
        return true;
    }
    return false;
}

function isDropdownVisible() {
    return $('.ui-timepicker-wrapper').is(':visible') || $('.ui-datepicker').is(':visible');
}

function disableMainButtons() {
    $('#addEmployeeBtn').prop('disabled', true);
    $('#deleteSelectedBtn').prop('disabled', true);
    $('#addTimeLogBtn').prop('disabled', true);
    $('.editEmployeeBtn').prop('disabled', true);
    $('.editTimeLogBtn').prop('disabled', true);
    $('.deleteTimeLogBtn').prop('disabled', true);
}

function enableMainButtons() {
    $('#addEmployeeBtn').prop('disabled', false);
    $('#deleteSelectedBtn').prop('disabled', false);
    $('#addTimeLogBtn').prop('disabled', false);
    $('.editEmployeeBtn').prop('disabled', false);
    $('.editTimeLogBtn').prop('disabled', false);
    $('.deleteTimeLogBtn').prop('disabled', false);
}



// delete employee modal handler opening


// function timelogFieldChecker() {
//     const date = $('#dateTimeLog').val();
//     const timeIn = $('#timeInTimeLog').val();
//     const timeOut = $('#timeOutTimeLog').val();

//     if (date.val() === '') {
//         alert('Please enter a date');
//         return false;
//     }
//     if (timeIn.val() === '') {
//         alert('Please enter time in');
//         return false;
//     }
//     if (timeOut.val() === '') {
//         alert('Please enter time out');
//         return false;
//     }
//     if (timeInvalid(timeIn, timeOut)) {
//         alert('Time in must be before time out');
//         return false;
//     }

//     return true;
// }


//END OF CODE

// pushTimeLogEdit