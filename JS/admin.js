import { auth, db } from "./firebase-config.js";
import {
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// Navigation
// ===============================

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");


const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");


// Create mobile overlay
const menuOverlay = document.createElement("div");

menuOverlay.className = "menu-overlay";

document.body.appendChild(menuOverlay);


// Open / close sidebar
menuToggle.addEventListener("click", () => {

    sidebar.classList.toggle("open");

    menuOverlay.classList.toggle("show");

});


// Close when overlay is clicked
menuOverlay.addEventListener("click", () => {

    sidebar.classList.remove("open");

    menuOverlay.classList.remove("show");

});


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sectionId = button.dataset.section;

        navButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        sections.forEach(section => {
            section.classList.remove("active");
        });

        const selectedSection = document.getElementById(sectionId);

        if (selectedSection) {
            selectedSection.classList.add("active");
        }

        sidebar.classList.remove("open");
menuOverlay.classList.remove("show");

    });

});




// ===============================
// Logout
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            console.log("Admin logged out successfully.");

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout error:", error);

            alert("Failed to logout. Please try again.");

        }

    });

}




// ===============================
// Lecturer Form
// ===============================

const showLecturerFormBtn =
    document.getElementById("showLecturerFormBtn");

const cancelLecturerBtn =
    document.getElementById("cancelLecturerBtn");

const lecturerFormContainer =
    document.getElementById("lecturerFormContainer");

const lecturerForm =
    document.getElementById("lecturerForm");


showLecturerFormBtn.addEventListener("click", () => {

    lecturerFormContainer.classList.remove("hidden");

});


cancelLecturerBtn.addEventListener("click", () => {

    lecturerForm.reset();

    lecturerFormContainer.classList.add("hidden");

});

lecturerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const fullName =
        document.getElementById("lecturerName").value.trim();

    const staffId =
        document.getElementById("staffId").value.trim();

    const department =
        document.getElementById("department").value.trim();

    const email =
        document.getElementById("lecturerEmail")
        .value
        .trim()
        .toLowerCase();


    try {

        // Check if this email already has access
        const existingQuery = query(
            collection(db, "lecturerAccess"),
            where("email", "==", email)
        );

        const existingSnapshot =
            await getDocs(existingQuery);


        if (!existingSnapshot.empty) {

            alert(
                "This lecturer already has an access record."
            );

            return;
        }


        // Give lecturer access
        await addDoc(
            collection(db, "lecturerAccess"),
            {
                fullName: fullName,
                staffId: staffId,
                department: department,
                email: email,
                status: "approved",
                createdAt: new Date()
            }
        );


        console.log(
            "Lecturer access created successfully"
        );


        alert(
            "Lecturer access granted successfully."
        );


        lecturerForm.reset();

        lecturerFormContainer.classList.add("hidden");


        await loadLecturers();


    } catch (error) {

        console.error(
            "Error giving lecturer access:",
            error
        );

        alert(
            "Failed to give lecturer access."
        );

    }

});

// ===============================
// Load Lecturer List
// ===============================

async function loadLecturers() {

    const lecturerTableBody =
        document.getElementById("lecturerTableBody");

    lecturerTableBody.innerHTML = `
        <tr>
            <td colspan="6">Loading lecturers...</td>
        </tr>
    `;

    try {
const lecturerSnapshot = await getDocs(
   collection(db, "lecturers")
);
        lecturerTableBody.innerHTML = "";

        if (lecturerSnapshot.empty) {

            lecturerTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No lecturers have been added yet.
                    </td>
                </tr>
            `;

            return;
        }


      lecturerSnapshot.forEach((docSnapshot) => {

    const lecturer = docSnapshot.data();

    const lecturerId = docSnapshot.id;

    // Existing lecturers without a status are considered active
    const status = lecturer.status || "active";

    console.log("Lecturer:", lecturer.fullName);
console.log("Lecturer status:", lecturer.status);
console.log("Status being used:", status);

  const row = document.createElement("tr");

row.innerHTML = `

    <td>
        ${lecturer.fullName || "-"}
    </td>

    <td>
        ${lecturer.staffId || "-"}
    </td>

    <td>
        ${lecturer.department || "-"}
    </td>

    <td>
        ${lecturer.email || "-"}
    </td>

    <td>
        <span class="status ${status}">
            ${status}
        </span>
    </td>

    <td>

        <button
            class="status-btn"
            data-id="${lecturerId}"
            data-status="${status}"
        >
            ${
                status === "active"
                    ? "Deactivate"
                    : "Activate"
            }
        </button>

    </td>

`;

    lecturerTableBody.appendChild(row);

});


const statusButtons =
    lecturerTableBody.querySelectorAll(".status-btn");


statusButtons.forEach(button => {

    button.addEventListener("click", async () => {

        const lecturerId =
            button.dataset.id;

        const currentStatus =
            button.dataset.status;

        const newStatus =
            currentStatus === "active"
                ? "inactive"
                : "active";


        try {

            button.disabled = true;

            button.textContent =
                "Updating...";


            const lecturerRef =
                doc(
                    db,
                    "lecturers",
                    lecturerId
                );


            await updateDoc(
                lecturerRef,
                {
                    status: newStatus
                }
            );


            console.log(
                "Lecturer status updated:",
                newStatus
            );


            // Reload lecturer list
            loadLecturers();


        } catch (error) {

            console.error(
                "Error updating lecturer status:",
                error
            );


            alert(
                "Failed to update lecturer status."
            );


            button.disabled = false;

            button.textContent =
                currentStatus === "active"
                    ? "Deactivate"
                    : "Activate";

        }

    });

});


    } catch (error) {

        console.error("Error loading lecturers:", error);

        lecturerTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Failed to load lecturers.
                </td>
            </tr>
        `;

    }

}


// ===============================
// Load Courses
// ===============================

async function loadCourses() {

    const courseTableBody =
        document.getElementById("courseTableBody");

    courseTableBody.innerHTML = `
        <tr>
            <td colspan="3">
                Loading courses...
            </td>
        </tr>
    `;

    try {

        // Get all courses
        const courseSnapshot =
            await getDocs(
                collection(db, "courses")
            );

        // Get lecturers so we can display names
        const lecturerSnapshot =
            await getDocs(
                collection(db, "lecturers")
            );


        // Create lecturer ID → name map
        const lecturerMap = {};

        lecturerSnapshot.forEach((docSnapshot) => {

            const lecturer =
                docSnapshot.data();

            lecturerMap[docSnapshot.id] =
                lecturer.fullName || "Unknown";

        });


        courseTableBody.innerHTML = "";


        if (courseSnapshot.empty) {

            courseTableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No courses have been created yet.
                    </td>
                </tr>
            `;

            return;

        }


        courseSnapshot.forEach((docSnapshot) => {

            const course =
                docSnapshot.data();


            // Get lecturer name using lecturerId
            const lecturerName =
                lecturerMap[course.lecturerId] ||
                "Unknown";


            // Departments and levels
   const row = document.createElement("tr");

row.innerHTML = `

    <td>
        ${course.courseCode || "-"}
    </td>

    <td>
        ${course.courseName || "-"}
    </td>

    <td>
        ${lecturerName}
    </td>

`;


          courseTableBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Error loading courses:",
            error
        );


        courseTableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    Failed to load courses.
                </td>
            </tr>
        `;

    }

}

// ===============================
// Load Attendance By Lecturer
// ===============================

async function loadAttendanceSessions() {

    const lecturerTableBody =
        document.getElementById(
            "attendanceLecturerTableBody"
        );

    lecturerTableBody.innerHTML = `
        <tr>
            <td colspan="3">
                Loading lecturers...
            </td>
        </tr>
    `;

    try {

        // Get all lecturers
        const lecturerSnapshot =
            await getDocs(
                collection(db, "lecturers")
            );

        lecturerTableBody.innerHTML = "";

        if (lecturerSnapshot.empty) {

            lecturerTableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No lecturers found.
                    </td>
                </tr>
            `;

            return;
        }


        lecturerSnapshot.forEach((docSnapshot) => {

            const lecturer =
                docSnapshot.data();

            const lecturerId =
                docSnapshot.id;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${lecturer.fullName || "-"}
                </td>

                <td>
                    ${lecturer.department || "-"}
                </td>

                <td>

                    <button
                        class="view-lecturer-attendance-btn"
                        data-id="${lecturerId}"
                    >
                        View Attendance
                    </button>

                </td>

            `;


            lecturerTableBody.appendChild(row);


            const viewButton =
                row.querySelector(
                    ".view-lecturer-attendance-btn"
                );


            viewButton.addEventListener(
                "click",
                async () => {

                    await showLecturerDates(
                        lecturerId,
                        lecturer.fullName || "Lecturer"
                    );

                }
            );

        });


    } catch (error) {

        console.error(
            "Error loading attendance lecturers:",
            error
        );

        lecturerTableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    Failed to load lecturers.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// SHOW DATES FOR SELECTED LECTURER
// ==========================================

async function showLecturerDates(
    lecturerId,
    lecturerName
) {

    const datesContainer =
        document.getElementById(
            "attendanceDatesContainer"
        );

    const datesTableBody =
        document.getElementById(
            "attendanceDatesTableBody"
        );

    const selectedLecturerName =
        document.getElementById(
            "selectedLecturerName"
        );


    // Show dates
    datesContainer.classList.remove(
        "hidden"
    );


    // Hide sessions and records
    document
        .getElementById(
            "attendanceSessionsContainer"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "attendanceRecordsContainer"
        )
        .classList.add("hidden");


    selectedLecturerName.textContent =
        `${lecturerName} - Attendance`;


    datesTableBody.innerHTML = `
        <tr>
            <td colspan="3">
                Loading dates...
            </td>
        </tr>
    `;


    try {

        // Get ONLY sessions for this lecturer
        const sessionsQuery =
            query(
                collection(
                    db,
                    "attendanceSessions"
                ),
                where(
                    "lecturerId",
                    "==",
                    lecturerId
                )
            );


        const sessionsSnapshot =
            await getDocs(
                sessionsQuery
            );


        if (sessionsSnapshot.empty) {

            datesTableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No attendance sessions found
                        for this lecturer.
                    </td>
                </tr>
            `;

            return;
        }


        // Group sessions by date
        const dateGroups = {};


        sessionsSnapshot.forEach(
            (sessionDoc) => {

                const session =
                    sessionDoc.data();


                let date = "-";


                if (
                    session.startTime &&
                    session.startTime.toDate
                ) {

                    date =
                        session.startTime
                            .toDate()
                            .toLocaleDateString();

                }


                if (!dateGroups[date]) {

                    dateGroups[date] = [];

                }


                dateGroups[date].push({

                    id: sessionDoc.id,

                    ...session

                });

            }
        );


        // Sort dates newest first
        const sortedDates =
            Object.keys(dateGroups)
                .sort(
                    (a, b) => {

                        const dateA =
                            new Date(a);

                        const dateB =
                            new Date(b);

                        return dateB - dateA;

                    }
                );


        datesTableBody.innerHTML = "";


        sortedDates.forEach(
            (date) => {

                const sessions =
                    dateGroups[date];


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${date}
                    </td>

                    <td>
                        ${sessions.length}
                        session${sessions.length !== 1 ? "s" : ""}
                    </td>

                    <td>

                        <button
                            class="view-date-sessions-btn"
                        >
                            View Sessions
                        </button>

                    </td>

                `;


                datesTableBody.appendChild(row);


                const viewButton =
                    row.querySelector(
                        ".view-date-sessions-btn"
                    );


                viewButton.addEventListener(
                    "click",
                    async () => {

                        await showDateSessions(
                            sessions,
                            date,
                            lecturerName
                        );

                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading lecturer dates:",
            error
        );


        datesTableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    Failed to load attendance dates.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// SHOW SESSIONS FOR SELECTED DATE
// ==========================================

async function showDateSessions(
    sessions,
    selectedDate,
    lecturerName
) {

    const sessionsContainer =
        document.getElementById(
            "attendanceSessionsContainer"
        );

    const sessionsTableBody =
        document.getElementById(
            "attendanceSessionsTableBody"
        );

    const selectedAttendanceDate =
        document.getElementById(
            "selectedAttendanceDate"
        );

    const selectedAttendanceLecturer =
        document.getElementById(
            "selectedAttendanceLecturer"
        );


    // Show sessions
    sessionsContainer.classList.remove(
        "hidden"
    );


    // Hide records
    document
        .getElementById(
            "attendanceRecordsContainer"
        )
        .classList.add("hidden");


    selectedAttendanceDate.textContent =
        `Attendance Sessions - ${selectedDate}`;


    selectedAttendanceLecturer.textContent =
        `Sessions for ${lecturerName}`;


    sessionsTableBody.innerHTML = "";


    // Sort sessions by start time
    sessions.sort(
        (a, b) => {

            const dateA =
                a.startTime?.toDate
                    ? a.startTime.toDate()
                    : new Date(0);

            const dateB =
                b.startTime?.toDate
                    ? b.startTime.toDate()
                    : new Date(0);

            return dateB - dateA;

        }
    );


    sessions.forEach(
        (session) => {

            const startDate =
                session.startTime?.toDate
                    ? session.startTime.toDate()
                    : null;


            const endDate =
                session.endTime?.toDate
                    ? session.endTime.toDate()
                    : null;


            const startTime =
                startDate
                    ? startDate.toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                    : "-";


            const endTime =
                endDate
                    ? endDate.toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                    : "-";


            let status =
                session.status || "unknown";


            // Automatically mark expired sessions as ended
            if (
                status === "active" &&
                endDate &&
                new Date() > endDate
            ) {

                status = "ended";

            }


            const departments =
                session.departments &&
                session.departments.length > 0
                    ? session.departments.join(", ")
                    : "-";


            const levels =
                session.levels &&
                session.levels.length > 0
                    ? session.levels.join(", ")
                    : "-";


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${session.courseCode || "-"}
                </td>

                <td>
                    ${session.courseName || "-"}
                </td>

                <td>
                    ${departments}
                </td>

                <td>
                    ${levels}
                </td>

                <td>
                    ${startTime}
                </td>

                <td>
                    ${endTime}
                </td>

                <td>

                    <span class="status ${status}">
                        ${status}
                    </span>

                </td>

                <td>

                    <button
                        class="view-session-records-btn"
                    >
                        View Records
                    </button>

                </td>

            `;


            sessionsTableBody.appendChild(row);


            const viewRecordsButton =
                row.querySelector(
                    ".view-session-records-btn"
                );


            viewRecordsButton.addEventListener(
                "click",
                async () => {

                    await viewAdminSessionRecords(
                        session.id,
                        session
                    );

                }
            );

        }
    );

}


// ==========================================
// VIEW RECORDS FOR ONE SESSION
// ==========================================

async function viewAdminSessionRecords(
    sessionId,
    session
) {

    const recordsContainer =
        document.getElementById(
            "attendanceRecordsContainer"
        );

    const recordsTableBody =
        document.getElementById(
            "attendanceRecordsTableBody"
        );

    const selectedSessionInfo =
        document.getElementById(
            "selectedSessionInfo"
        );


    recordsContainer.classList.remove(
        "hidden"
    );


    recordsTableBody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading attendance records...
            </td>
        </tr>
    `;


    const sessionDate =
        session.startTime?.toDate
            ? session.startTime
                .toDate()
                .toLocaleDateString()
            : "-";


    selectedSessionInfo.textContent =
        `${session.courseCode || "-"} - ${
            session.courseName || "-"
        } | ${sessionDate}`;


    try {

        // IMPORTANT:
        // Only records for THIS exact session
        const recordsQuery =
            query(
                collection(
                    db,
                    "attendanceRecords"
                ),
                where(
                    "sessionId",
                    "==",
                    sessionId
                )
            );


        const recordsSnapshot =
            await getDocs(
                recordsQuery
            );


        recordsTableBody.innerHTML = "";


        if (recordsSnapshot.empty) {

            recordsTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No students attended this session.
                    </td>
                </tr>
            `;

            return;
        }


        recordsSnapshot.forEach(
            (recordDoc) => {

                const record =
                    recordDoc.data();


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${record.studentName || "-"}
                    </td>

                    <td>
                        ${record.matricNumber || "-"}
                    </td>

                    <td>
                        ${record.department || "-"}
                    </td>

                    <td>
                        ${record.level || "-"}
                    </td>

                    <td>
                        ${record.date || "-"}
                    </td>

                    <td>
                        ${record.time || "-"}
                    </td>

                    <td>

                        <span class="status ${
                            record.status || "unknown"
                        }">
                            ${record.status || "-"}
                        </span>

                    </td>

                `;


                recordsTableBody.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Error loading attendance records:",
            error
        );


        recordsTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load attendance records.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// CLOSE LECTURER DATES
// ==========================================
// ==========================================
// CLOSE LECTURER DATES
// ==========================================

const closeAttendanceDatesBtn =
    document.getElementById(
        "closeAttendanceDatesBtn"
    );

if (closeAttendanceDatesBtn) {

    closeAttendanceDatesBtn.addEventListener(
        "click",
        () => {

            const datesContainer =
                document.getElementById(
                    "attendanceDatesContainer"
                );

            const sessionsContainer =
                document.getElementById(
                    "attendanceSessionsContainer"
                );

            const recordsContainer =
                document.getElementById(
                    "attendanceRecordsContainer"
                );

            if (datesContainer) {
                datesContainer.classList.add("hidden");
            }

            if (sessionsContainer) {
                sessionsContainer.classList.add("hidden");
            }

            if (recordsContainer) {
                recordsContainer.classList.add("hidden");
            }

        }
    );

}


// ==========================================
// CLOSE ATTENDANCE SESSIONS
// ==========================================

const closeAttendanceSessionsBtn =
    document.getElementById(
        "closeAttendanceSessionsBtn"
    );

if (closeAttendanceSessionsBtn) {

    closeAttendanceSessionsBtn.addEventListener(
        "click",
        () => {

            const sessionsContainer =
                document.getElementById(
                    "attendanceSessionsContainer"
                );

            const recordsContainer =
                document.getElementById(
                    "attendanceRecordsContainer"
                );

            if (sessionsContainer) {
                sessionsContainer.classList.add("hidden");
            }

            if (recordsContainer) {
                recordsContainer.classList.add("hidden");
            }

        }
    );

}


// ==========================================
// CLOSE ATTENDANCE RECORDS
// ==========================================

const closeAttendanceRecordsBtn =
    document.getElementById(
        "closeAttendanceRecordsBtn"
    );

if (closeAttendanceRecordsBtn) {

    closeAttendanceRecordsBtn.addEventListener(
        "click",
        () => {

            const recordsContainer =
                document.getElementById(
                    "attendanceRecordsContainer"
                );

            if (recordsContainer) {
                recordsContainer.classList.add("hidden");
            }

        }
    );

}




loadDashboardStats();
loadLecturers();
loadCourses();
loadAttendanceSessions();
loadAttendanceFilters();
loadAttendanceChart();





// ==========================================
// LOAD ATTENDANCE FILTERS
// ==========================================

async function loadAttendanceFilters() {

    const lecturerFilter =
        document.getElementById("attendanceLecturerFilter");

    const courseFilter =
        document.getElementById("attendanceCourseFilter");


    if (!lecturerFilter || !courseFilter) {
        console.error("Attendance filter elements not found.");
        return;
    }


    try {

        // ===============================
        // LOAD LECTURERS
        // ===============================

        const lecturerSnapshot =
            await getDocs(
                collection(db, "lecturers")
            );


        lecturerSnapshot.forEach((docSnapshot) => {

            const lecturer =
                docSnapshot.data();

            const option =
                document.createElement("option");

            option.value =
                docSnapshot.id;

            option.textContent =
                lecturer.fullName || "Unknown Lecturer";

            lecturerFilter.appendChild(option);

        });


        // ===============================
        // LOAD COURSES
        // ===============================

        const courseSnapshot =
            await getDocs(
                collection(db, "courses")
            );


        courseSnapshot.forEach((docSnapshot) => {

            const course =
                docSnapshot.data();

            const option =
                document.createElement("option");

            option.value =
                docSnapshot.id;

            option.textContent =
                `${course.courseCode || "-"} - ${
                    course.courseName || "-"
                }`;

            courseFilter.appendChild(option);

        });


        console.log(
            "Attendance filters loaded successfully."
        );


    } catch (error) {

        console.error(
            "Error loading attendance filters:",
            error
        );

    }

}


// ===============================
// Dashboard Statistics
// ===============================

async function loadDashboardStats() {


try {

    // ===============================
    // Count Students
    // ===============================

    const studentSnapshot =
        await getDocs(
            collection(db, "students")
        );

    document.getElementById("studentCount").textContent =
        studentSnapshot.size;


    // ===============================
    // Count Lecturers
    // ===============================

    const lecturerSnapshot =
        await getDocs(
            collection(db, "lecturers")
        );

    document.getElementById("lecturerCount").textContent =
        lecturerSnapshot.size;


    // ===============================
    // Count Courses
    // ===============================

    const courseSnapshot =
        await getDocs(
            collection(db, "courses")
        );

    document.getElementById("courseCount").textContent =
        courseSnapshot.size;


    // ===============================
    // Get Attendance Sessions
    // ===============================

    const sessionSnapshot =
        await getDocs(
            collection(db, "attendanceSessions")
        );

    document.getElementById("sessionCount").textContent =
        sessionSnapshot.size;


    // ===============================
    // Get Attendance Records
    // ===============================

    const recordsSnapshot =
        await getDocs(
            collection(db, "attendanceRecords")
        );


    // ===============================
    // Present Today
    // ===============================

    const today =
        new Date().toLocaleDateString();


    let presentToday = 0;


    recordsSnapshot.forEach((recordDoc) => {

        const record =
            recordDoc.data();


        if (
            record.status === "present" &&
            record.date === today
        ) {

            presentToday++;

        }

    });


    document.getElementById(
        "presentTodayCount"
    ).textContent = presentToday;


    // ===============================
    // Attendance Rate
    // ===============================

   // ===============================
// Attendance Rate
// ===============================

let totalExpected = 0;
let totalPresent = 0;


// Store valid session IDs
const validSessionIds = new Set();


// Go through every attendance session
sessionSnapshot.forEach((sessionDoc) => {

    const session =
        sessionDoc.data();

    const sessionLevels =
        session.levels || [];

    const sessionDepartments =
        session.departments || [];


    // Count students expected for this session
    studentSnapshot.forEach((studentDoc) => {

        const student =
            studentDoc.data();


        const levelMatches =
            sessionLevels.length === 0 ||
            sessionLevels.includes(
                student.level
            );


        const departmentMatches =
            sessionDepartments.length === 0 ||
            sessionDepartments.includes(
                student.department
            );


        if (
            levelMatches &&
            departmentMatches
        ) {

            totalExpected++;

        }

    });


    // Remember this session
    validSessionIds.add(
        sessionDoc.id
    );

});


// ==========================================
// Count PRESENT students for those sessions
// ==========================================

recordsSnapshot.forEach((recordDoc) => {

    const record =
        recordDoc.data();


    if (
        record.status &&
        record.status.toLowerCase() === "present" &&
        record.sessionId &&
        validSessionIds.has(record.sessionId)
    ) {

        totalPresent++;

    }

});


// ==========================================
// Calculate Attendance Rate
// ==========================================

const attendanceRate =
    totalExpected > 0
        ? Math.round(
            (totalPresent / totalExpected) * 100
        )
        : 0;


document.getElementById(
    "attendanceRate"
).textContent =
    `${attendanceRate}%`;


// ===============================
// Console Check
// ===============================

console.log(
    "Dashboard attendance calculation:",
    {
        totalExpected: totalExpected,
        totalPresent: totalPresent,
        attendanceRate: attendanceRate
    }
);


} catch (error) {

    console.error(
        "Error loading dashboard statistics:",
        error
    );

}


}



// ===============================
// Attendance Trend Graph
// ===============================

// ==========================================
// LOAD ATTENDANCE CHART
// ==========================================

async function loadAttendanceChart() {

    try {

        const lecturerFilter =
            document.getElementById("attendanceLecturerFilter");

        const courseFilter =
            document.getElementById("attendanceCourseFilter");

        const selectedLecturer =
            lecturerFilter ? lecturerFilter.value : "all";

        const selectedCourse =
            courseFilter ? courseFilter.value : "all";


        // Get students, sessions and attendance records
        const studentSnapshot =
            await getDocs(collection(db, "students"));

        const sessionSnapshot =
            await getDocs(collection(db, "attendanceSessions"));

        const recordsSnapshot =
            await getDocs(collection(db, "attendanceRecords"));


        // Filter sessions according to selected lecturer/course
        const filteredSessions =
            sessionSnapshot.docs.filter((sessionDoc) => {

                const session = sessionDoc.data();


                if (
                    selectedLecturer !== "all" &&
                    session.lecturerId !== selectedLecturer
                ) {
                    return false;
                }


                if (
                    selectedCourse !== "all" &&
                    session.courseId !== selectedCourse
                ) {
                    return false;
                }


                return true;

            });


        // Store attendance information by date
        const attendanceByDate = {};


        // Store filtered sessions for quick lookup
        const filteredSessionMap =
            new Map(
                filteredSessions.map(
                    sessionDoc => [sessionDoc.id, sessionDoc]
                )
            );


        // ---------------------------------------
        // CALCULATE EXPECTED STUDENTS
        // ---------------------------------------

        filteredSessions.forEach((sessionDoc) => {

            const session = sessionDoc.data();


            if (
                !session.startTime ||
                !session.startTime.toDate
            ) {
                return;
            }


            const startDate =
                session.startTime.toDate();


            // Create a reliable date key
            const dateKey =
                `${startDate.getFullYear()}-` +
                `${String(startDate.getMonth() + 1).padStart(2, "0")}-` +
                `${String(startDate.getDate()).padStart(2, "0")}`;


            const dateLabel =
                startDate.toLocaleDateString();


            if (!attendanceByDate[dateKey]) {

                attendanceByDate[dateKey] = {

                    label: dateLabel,

                    sortTime: startDate.getTime(),

                    expected: 0,

                    present: 0

                };

            }


            const sessionLevels =
                Array.isArray(session.levels)
                    ? session.levels
                    : [];


            const sessionDepartments =
                Array.isArray(session.departments)
                    ? session.departments
                    : [];


            let expectedForSession = 0;


            // Check which students belong to this session
            studentSnapshot.forEach((studentDoc) => {

                const student =
                    studentDoc.data();


                const levelMatches =
                    sessionLevels.length === 0 ||
                    sessionLevels.includes(student.level);


                const departmentMatches =
                    sessionDepartments.length === 0 ||
                    sessionDepartments.includes(
                        student.department
                    );


                if (
                    levelMatches &&
                    departmentMatches
                ) {

                    expectedForSession++;

                }

            });


            attendanceByDate[dateKey].expected +=
                expectedForSession;

        });


        // ---------------------------------------
        // CALCULATE PRESENT STUDENTS
        // ---------------------------------------

        recordsSnapshot.forEach((recordDoc) => {

            const record =
                recordDoc.data();


            // Only count Present records
            if (
                !record.status ||
                record.status.toLowerCase() !== "present"
            ) {
                return;
            }


            if (!record.sessionId) {
                return;
            }


            // Make sure the session belongs
            // to the selected lecturer/course
            const sessionDoc =
                filteredSessionMap.get(record.sessionId);


            if (!sessionDoc) {
                return;
            }


            const session =
                sessionDoc.data();


            if (
                !session.startTime ||
                !session.startTime.toDate
            ) {
                return;
            }


            const startDate =
                session.startTime.toDate();


            const dateKey =
                `${startDate.getFullYear()}-` +
                `${String(startDate.getMonth() + 1).padStart(2, "0")}-` +
                `${String(startDate.getDate()).padStart(2, "0")}`;


            if (!attendanceByDate[dateKey]) {

                attendanceByDate[dateKey] = {

                    label:
                        startDate.toLocaleDateString(),

                    sortTime:
                        startDate.getTime(),

                    expected: 0,

                    present: 0

                };

            }


            attendanceByDate[dateKey].present++;

        });


        // ---------------------------------------
        // SORT DATES
        // ---------------------------------------

        const dates =
            Object.keys(attendanceByDate).sort(
                (a, b) =>
                    attendanceByDate[a].sortTime -
                    attendanceByDate[b].sortTime
            );


        const labels =
            dates.map(
                date =>
                    attendanceByDate[date].label
            );


        // ---------------------------------------
        // CALCULATE REAL ATTENDANCE RATE
        // ---------------------------------------

        const attendancePercentages =
            dates.map((date) => {

                const data =
                    attendanceByDate[date];


                if (data.expected === 0) {
                    return 0;
                }


                return (
                    data.present /
                    data.expected
                );

            });


        console.log(
            "Attendance chart calculation:",
            attendanceByDate
        );


        // ---------------------------------------
        // HANDLE NO DATA
        // ---------------------------------------

        const chartContainer =
            document.querySelector(
                ".chart-container"
            );


        if (dates.length === 0) {

            if (
                window.attendanceChart instanceof Chart
            ) {

                window.attendanceChart.destroy();

            }


            window.attendanceChart = null;


            if (chartContainer) {

                chartContainer.innerHTML = `

                    <div class="no-attendance-data">

                        <p>No attendance data available.</p>

                        <span>
                            Try selecting another lecturer or course.
                        </span>

                    </div>

                `;

            }


            return;

        }


        if (!chartContainer) {

            console.error(
                "Attendance chart container not found."
            );

            return;

        }


        // ---------------------------------------
        // GET / CREATE CANVAS
        // ---------------------------------------

        let canvas =
            document.getElementById(
                "attendanceChart"
            );


        if (!canvas) {

            chartContainer.innerHTML =
                `<canvas id="attendanceChart"></canvas>`;

            canvas =
                document.getElementById(
                    "attendanceChart"
                );

        }


        // Destroy previous chart
        if (
            window.attendanceChart instanceof Chart
        ) {

            window.attendanceChart.destroy();

        }


        window.attendanceChart = null;


        // ---------------------------------------
        // CREATE CHART
        // ---------------------------------------

        window.attendanceChart =
            new Chart(canvas, {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label: "Attendance",

                        data: attendancePercentages,

                        tension: 0.3,

                        fill: false,

                        pointRadius: 5

                    }]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    scales: {

                        y: {

                            min: 0,

                            max: 1,


                            ticks: {

                                callback:
                                    function(value) {

                                        return (
                                            value * 100
                                        ) + "%";

                                    }

                            }

                        }

                    },


                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            "Attendance: " +
                                            (
                                                context.raw *
                                                100
                                            ).toFixed(1) +
                                            "%"
                                        );

                                    }

                            }

                        }

                    }

                }

            });


    } catch (error) {

        console.error(
            "Error loading attendance chart:",
            error
        );

    }

}

// ==========================================
// ATTENDANCE FILTER EVENTS
// ==========================================

const attendanceLecturerFilter =
    document.getElementById(
        "attendanceLecturerFilter"
    );

const attendanceCourseFilter =
    document.getElementById(
        "attendanceCourseFilter"
    );


if (attendanceLecturerFilter) {

    attendanceLecturerFilter.addEventListener(
        "change",
        () => {

            loadAttendanceChart();

        }
    );

}


if (attendanceCourseFilter) {

    attendanceCourseFilter.addEventListener(
        "change",
        () => {

            loadAttendanceChart();

        }
    );

}