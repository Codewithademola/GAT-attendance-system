import { auth, db } from "./firebase-config.js";

import { 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




async function checkLecturerAccess(user){

   const userRef = doc(db, "lecturers", user.uid);

    const userSnap = await getDoc(userRef);

    console.log("Logged in UID:", user.uid);
console.log("User document exists:", userSnap.exists());


    if(userSnap.exists()){

        const userData = userSnap.data();


        if(userData.role !== "lecturer"){

            alert("Access denied");

            window.location.href = "login.html";

        }

    }else{

        alert("User record not found");

        window.location.href = "login.html";

    }

}





const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.querySelector(".lecturer-sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (sidebarToggle) {

    sidebarToggle.addEventListener("click", () => {

        sidebar.classList.toggle("mobile-open");
        sidebarOverlay.classList.toggle("active");

    });

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener("click", () => {

        sidebar.classList.remove("mobile-open");
        sidebarOverlay.classList.remove("active");

    });

}

// ===============================
// DASHBOARD / HISTORY NAVIGATION
// ===============================

const dashboardNav = document.getElementById("dashboardNav");
const historyNav = document.getElementById("historyNav");

const dashboardPage = document.getElementById("dashboardPage");
const historyPage = document.getElementById("historyPage");

if (dashboardNav && historyNav) {

    dashboardNav.addEventListener("click", () => {

        // Show Dashboard
        dashboardPage.classList.remove("hidden");
        historyPage.classList.add("hidden");

        // Update active menu
        dashboardNav.classList.add("active");
        historyNav.classList.remove("active");

        // Close mobile sidebar
        if (sidebar) {
            sidebar.classList.remove("mobile-open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active");
        }
    });


    historyNav.addEventListener("click", () => {

        // Show History
        dashboardPage.classList.add("hidden");
        historyPage.classList.remove("hidden");

        // Update active menu
        historyNav.classList.add("active");
        dashboardNav.classList.remove("active");

        // Close mobile sidebar
        if (sidebar) {
            sidebar.classList.remove("mobile-open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active");
        }
    });

}





// HTML Elements
const lecturerAttendanceTable = document.getElementById("lecturerAttendanceTable");
let student = null;

const courseSelect = document.getElementById("courseSelect");
const historyCourseSelect = document.getElementById("historyCourseSelect");
const attendanceDuration = document.getElementById("duration");
const attendanceRadius = document.getElementById("radius");
const activateAttendanceBtn = document.getElementById("activateAttendanceBtn");
const attendanceMessage = document.getElementById("attendanceMessage");

let attendanceChart = null;
let selectedAttendanceSession = null;
const expectedStudents =
    document.getElementById("expectedStudents");

const presentStudents =
    document.getElementById("presentStudents");

const absentStudents =
    document.getElementById("absentStudents");

const attendanceRate =
    document.getElementById("attendanceRate");

const selectedCourseAttendance =
    document.getElementById("selectedCourseAttendance");

const courseSessionsContainer =
    document.getElementById("courseSessionsContainer");

const courseSessionsTable =
    document.getElementById("courseSessionsTable");

const courseAttendanceRecordsContainer =
    document.getElementById("courseAttendanceRecordsContainer");

const closeCourseRecordsBtn =
    document.getElementById("closeCourseRecordsBtn");

const lecturerName = document.getElementById("lecturerName");

const courseName = document.getElementById("courseName");
const courseCode = document.getElementById("courseCode");
const departmentCheckboxes = document.querySelectorAll(
    'input[name="department"]'
);

const levelCheckboxes = document.querySelectorAll(
    'input[name="level"]'
);

const createCourseBtn = document.getElementById("createCourseBtn");

const courseList = document.getElementById("courseList");

const courseMessage = document.getElementById("courseMessage");

const activateText = document.getElementById("activateText");

const activateLoader = document.getElementById("activateLoader");

// Store lecturer ID
let lecturerId = null;
let lecturerCourses = [];



// Check logged-in lecturer
// ===============================
// Check Logged-in Lecturer
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    try {

        const lecturerRef =
            doc(db, "lecturers", user.uid);

        const lecturerSnap =
            await getDoc(lecturerRef);


        if (!lecturerSnap.exists()) {

            alert("Lecturer record not found.");

            window.location.href = "login.html";

            return;
        }


        const lecturerData =
            lecturerSnap.data();


        // Check role
        if (lecturerData.role !== "lecturer") {

            alert("Access denied.");

            window.location.href = "login.html";

            return;
        }


        // Store lecturer ID
        lecturerId = user.uid;


        // Display lecturer information
        lecturerName.textContent =
            `Welcome, ${lecturerData.fullName}`;


        const lecturerDepartment =
            document.getElementById("lecturerDepartment");


        if (lecturerDepartment) {

            lecturerDepartment.textContent =
                lecturerData.department;

        }


        console.log(
            "Logged in lecturer:",
            lecturerData.fullName
        );

        console.log(
            "Department:",
            lecturerData.department
        );

        console.log(
            "Lecturer UID:",
            user.uid
        );


        // Load lecturer's data
        await loadCourses();



    } catch (error) {

        console.error(
            "Error loading lecturer:",
            error
        );

    }

});

// Create Course

createCourseBtn.addEventListener("click", async () => {

    const name = courseName.value.trim();
    const code = courseCode.value.trim();

        const selectedDepartments = Array.from(departmentCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const selectedLevels = Array.from(levelCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);


    // Check only course name and course code
    if (!name || !code) {

        courseMessage.textContent =
            "Please enter course name and course code";

        courseMessage.className =
            "error-message";

        return;
    }

   



    try {

      await addDoc(
    collection(db, "courses"),
    {

        courseName: name,

        courseCode: code,

        lecturerId: lecturerId,
        
        createdAt: serverTimestamp()

    }
);


        courseMessage.textContent =
            "Course created successfully";

        courseMessage.className =
            "success-message";


        // Clear the form
       courseName.value = "";
courseCode.value = "";

departmentCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
});

levelCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
});


        // Reload courses
        loadCourses();


    } catch (error) {

        console.log(error);

        courseMessage.textContent =
            error.message;

        courseMessage.className =
            "error-message";

    }

});




// Load Lecturer Courses

async function loadCourses() {

    courseList.innerHTML = "Loading courses...";
    lecturerCourses = [];

    courseSelect.innerHTML = '<option value="">Select Course</option>';

if (historyCourseSelect) {
    historyCourseSelect.innerHTML = '<option value="">Select Course</option>';
}

    try {

        const q = query(
            collection(db, "courses"),
            where("lecturerId", "==", lecturerId)
        );

        const snapshot = await getDocs(q);

        courseList.innerHTML = "";

        if (snapshot.empty) {

            courseList.innerHTML =
                "<p>No courses created yet</p>";

            return;
        }


        snapshot.forEach((doc) => {

            
            const course = doc.data();


            // Store course
            lecturerCourses.push({
                id: doc.id,
                ...course
            });





            // Add to course dropdown
            courseSelect.innerHTML += `
                <option value="${doc.id}">
                    ${course.courseCode} - ${course.courseName}
                </option>
            `;

            // Add to History course dropdown
if (historyCourseSelect) {

    historyCourseSelect.innerHTML += `
        <option value="${doc.id}">
            ${course.courseCode} - ${course.courseName}
        </option>
    `;

}

            // Display course
            // Display course
courseList.innerHTML += `

    <div class="course-item">

        <h3>
            ${course.courseCode}
        </h3>

        <p>
            ${course.courseName}
        </p>



`;


        });




    } catch (error) {

        console.error(
            "Error loading courses:",
            error
        );

        courseList.innerHTML =
            "Error loading courses";

    }

}

async function loadAttendanceRecords(){

    try{

        const q = query(
            collection(db, "attendanceRecords"),
            where("lecturerId", "==", lecturerId)
        );


        const snapshot = await getDocs(q);


        lecturerAttendanceTable.innerHTML = "";


        if(snapshot.empty){

            lecturerAttendanceTable.innerHTML = `
            <tr>
                <td colspan="6">
                    No attendance records found
                </td>
            </tr>
            `;

            return;
        }


        snapshot.forEach((doc)=>{

            const data = doc.data();


            lecturerAttendanceTable.innerHTML += `

            <tr>

                <td>${data.studentName}</td>

                <td>${data.matricNumber}</td>

                <td>${data.courseName}</td>

                <td>${data.date}</td>

                <td>${data.time}</td>

                <td>${data.status}</td>

            </tr>

            `;

        });


    }catch(error){

        console.log(
            "Error loading attendance records:",
            error
        );

    }

}

activateAttendanceBtn.addEventListener("click", async () => {

    const selectedCourseId = courseSelect.value;

    const attendanceDuration =
        duration.value.trim();

    const attendanceRadius =
        radius.value.trim();


    // Get selected departments
    const selectedDepartments =
        Array.from(
            document.querySelectorAll(
                'input[name="attendanceDepartment"]:checked'
            )
        ).map(checkbox => checkbox.value);


    // Get selected levels
    const selectedLevels =
        Array.from(
            document.querySelectorAll(
                'input[name="attendanceLevel"]:checked'
            )
        ).map(checkbox => checkbox.value);


    // Check course
    if (!selectedCourseId) {

        attendanceMessage.textContent =
            "Please select a course";

        attendanceMessage.className =
            "error-message";

        return;
    }


    // Check departments
    if (selectedDepartments.length === 0) {

        attendanceMessage.textContent =
            "Please select at least one department";

        attendanceMessage.className =
            "error-message";

        return;
    }


    // Check levels
    if (selectedLevels.length === 0) {

        attendanceMessage.textContent =
            "Please select at least one level";

        attendanceMessage.className =
            "error-message";

        return;
    }


    // Check duration and radius
    if (!attendanceDuration || !attendanceRadius) {

        attendanceMessage.textContent =
            "Please enter duration and radius";

        attendanceMessage.className =
            "error-message";

        return;
    }


    activateAttendanceBtn.disabled = true;

    activateText.textContent =
        "Activating";

    activateLoader.classList.remove("hidden");


    // Find selected course
    const selectedCourse =
        lecturerCourses.find(
            course => course.id === selectedCourseId
        );


    if (!selectedCourse) {

        attendanceMessage.textContent =
            "Course not found";

        activateAttendanceBtn.disabled = false;

        activateText.textContent =
            "Activate Attendance";

        activateLoader.classList.add("hidden");

        return;
    }


    // Get lecturer's current location
    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


                console.log("LECTURER GPS LATITUDE:", latitude);
console.log("LECTURER GPS LONGITUDE:", longitude);
console.log(
    "LECTURER GPS ACCURACY:",
    position.coords.accuracy,
    "meters"
);


            const startTime =
                new Date();


            const endTime =
                new Date(
                    startTime.getTime() +
                    Number(attendanceDuration) * 60000
                );


            try {

                await addDoc(
                    collection(
                        db,
                        "attendanceSessions"
                    ),
                    {

                        courseId:
                            selectedCourse.id,

                        courseName:
                            selectedCourse.courseName,

                        courseCode:
                            selectedCourse.courseCode,


                        lecturerId:
                            lecturerId,

                        // Departments allowed
                        departments:
                            selectedDepartments,

                        // Levels allowed
                        levels:
                            selectedLevels,

                        status:
                            "active",

                        startTime:
                            startTime,

                        endTime:
                            endTime,

                        latitude:
                            latitude,

                        longitude:
                            longitude,

                        radius:
                            Number(attendanceRadius),

                        createdAt:
                            serverTimestamp()

                    }
                );


                attendanceMessage.textContent =
                    "Attendance activated successfully";

                attendanceMessage.className =
                    "success-message";


                activateText.textContent =
                    "Attendance Activated";

                activateLoader.classList.add("hidden");


            } catch (error) {

                console.error(
                    "Error activating attendance:",
                    error
                );

                attendanceMessage.textContent =
                    error.message;

                attendanceMessage.className =
                    "error-message";


                activateAttendanceBtn.disabled =
                    false;

                activateText.textContent =
                    "Activate Attendance";

                activateLoader.classList.add("hidden");

            }

        },


        (error) => {

            console.error(
                "Location error:",
                error
            );

            attendanceMessage.textContent =
                "Location permission required";

            attendanceMessage.className =
                "error-message";

            activateAttendanceBtn.disabled =
                false;

            activateText.textContent =
                "Activate Attendance";

            activateLoader.classList.add("hidden");

        }

    );

});

// ==========================================
// VIEW COURSE ATTENDANCE
// ==========================================

async function showCourseSessions(courseId, courseCode, courseName) {

    selectedCourseAttendance.textContent =
        `${courseCode} - ${courseName}`;

    courseSessionsContainer.classList.remove("hidden");

    courseAttendanceRecordsContainer.classList.add("hidden");

    courseSessionsTable.innerHTML = `
        <tr>
            <td colspan="5">
                Loading attendance sessions...
            </td>
        </tr>
    `;

    try {

        const q = query(
            collection(db, "attendanceSessions"),
            where("courseId", "==", courseId),
            where("lecturerId", "==", lecturerId)
        );

        const snapshot = await getDocs(q);

        courseSessionsTable.innerHTML = "";

        if (snapshot.empty) {

            courseSessionsTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        No attendance sessions found.
                    </td>
                </tr>
            `;

            return;
        }


        snapshot.forEach((sessionDoc) => {

            const session = sessionDoc.data();

            const startTime =
                session.startTime.toDate();

            const endTime =
                session.endTime.toDate();


            const date =
                startTime.toLocaleDateString();

            const start =
                startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

            const end =
                endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });


            const now = new Date();

            let status = session.status;

         if (
    session.status === "active" &&
    now > endTime
) {

    status = "Ended";

}


            courseSessionsTable.innerHTML += `

                <tr>

                    <td>${date}</td>

                    <td>${start}</td>

                    <td>${end}</td>

                    <td>${status}</td>

                    <td>

                        <button
                            class="view-session-attendance-btn"
                            data-session-id="${sessionDoc.id}"
                        >
                            View Attendance
                        </button>

                    </td>

                </tr>

            `;

        });


        // Add click events to View Attendance buttons

        document
            .querySelectorAll(".view-session-attendance-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const sessionId =
                            button.dataset.sessionId;

                        viewSessionAttendance(
                            sessionId
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Error loading attendance sessions:",
            error
        );

        courseSessionsTable.innerHTML = `
            <tr>
                <td colspan="5">
                    Error loading attendance sessions.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// VIEW STUDENT ATTENDANCE FOR SESSION
// ==========================================

async function viewSessionAttendance(sessionId) {

    courseAttendanceRecordsContainer.classList.remove(
        "hidden"
    );

    lecturerAttendanceTable.innerHTML = `
        <tr>
            <td colspan="7">
                Loading attendance records...
            </td>
        </tr>
    `;

    try {

        // ================================
        // Get attendance session
        // ================================

        const sessionRef = doc(
            db,
            "attendanceSessions",
            sessionId
        );

        const sessionSnap =
            await getDoc(sessionRef);

        if (!sessionSnap.exists()) {

            console.log(
                "Attendance session not found"
            );

            return;
        }

        const session =
            sessionSnap.data();

            selectedAttendanceSession = {
    id: sessionId,
    ...session
};

        // ================================
        // Get students
        // ================================

        const studentsSnapshot =
            await getDocs(
                collection(db, "students")
            );


        // ================================
        // Find eligible students
        // ================================

        const eligibleStudents =
            studentsSnapshot.docs.filter(
                (studentDoc) => {

                    const student =
                        studentDoc.data();


                    // Only active students
                    if (
                        student.status &&
                        student.status !== "active"
                    ) {

                        return false;

                    }


                    const departmentMatch =
                        (session.departments || []).some(
                            department =>
                                department
                                    .trim()
                                    .toLowerCase() ===
                                String(
                                    student.department
                                )
                                    .trim()
                                    .toLowerCase()
                        );


                    const levelMatch =
                        (session.levels || []).some(
                            level =>
                                String(level).trim() ===
                                String(student.level).trim()
                        );


                    return (
                        departmentMatch &&
                        levelMatch
                    );

                }
            );


        // ================================
        // Get attendance records
        // ================================

        const attendanceQuery = query(
            collection(db, "attendanceRecords"),
            where("sessionId", "==", sessionId),
            where("lecturerId", "==", lecturerId)
        );


        const attendanceSnapshot =
            await getDocs(attendanceQuery);


        // ================================
        // Create attendance lookup
        // ================================

        const attendanceMap = new Map();


        attendanceSnapshot.forEach(
            (attendanceDoc) => {

                const data =
                    attendanceDoc.data();

               attendanceMap.set(
                 data.matricNumber,
                    data
                );

            }
        );


        // ================================
        // Calculate summary
        // ================================

        const expectedCount =
            eligibleStudents.length;


        const presentCount =
            attendanceMap.size;


        const absentCount =
            Math.max(
                0,
                expectedCount - presentCount
            );


        const percentage =
            expectedCount > 0
                ? (
                    presentCount /
                    expectedCount
                ) * 100
                : 0;


        // ================================
        // Update summary
        // ================================

        expectedStudents.textContent =
            expectedCount;

        presentStudents.textContent =
            presentCount;

        absentStudents.textContent =
            absentCount;

        attendanceRate.textContent =
            `${percentage.toFixed(1)}%`;


        // ================================
        // Update chart
        // ================================

        const chartCanvas =
            document.getElementById(
                "attendanceChart"
            );


        if (chartCanvas) {

            if (attendanceChart) {

                attendanceChart.destroy();

            }


            attendanceChart =
                new Chart(
                    chartCanvas,
                    {
                        type: "pie",

                        data: {

                            labels: [
                                "Present",
                                "Absent"
                            ],

                            datasets: [
                                {
                                    data: [
                                        presentCount,
                                        absentCount
                                    ]
                                }
                            ]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio: false,

                            plugins: {

                                legend: {
                                    position: "bottom"
                                }

                            }

                        }

                    }
                );

        }


        // ================================
        // Clear table
        // ================================

        lecturerAttendanceTable.innerHTML = "";


        // ================================
        // Display students
        // ================================

        if (eligibleStudents.length === 0) {

            lecturerAttendanceTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        No eligible students found
                        for this session.
                    </td>
                </tr>
            `;

            return;
        }


        eligibleStudents.forEach(
            (studentDoc) => {

                const student =
                    studentDoc.data();


             

                    console.log("Student document ID:", studentDoc.id);

console.log(
    "Attendance Map IDs:",
    Array.from(attendanceMap.keys())
);

                const attendance =
                    attendanceMap.get(
                        student.matricNumber
                    );


                    

                // Student attended
                if (attendance) {

                    lecturerAttendanceTable.innerHTML += `

                        <tr>

                            <td>
                                ${student.fullName || "-"}
                            </td>

                            <td>
                                ${student.matricNumber || "-"}
                            </td>

                            <td>
                                ${student.department || "-"}
                            </td>

                            <td>
                                ${student.level || "-"}
                            </td>

                            <td>
                                ${attendance.date || "-"}
                            </td>

                            <td>
                                ${attendance.time || "-"}
                            </td>

                            <td>
                                ${attendance.status || "Present"}
                            </td>

                        </tr>

                    `;

                }


                // Student did not attend
                else {

                    lecturerAttendanceTable.innerHTML += `

                        <tr>

                            <td>
                                ${student.fullName || "-"}
                            </td>

                            <td>
                                ${student.matricNumber || "-"}
                            </td>

                            <td>
                                ${student.department || "-"}
                            </td>

                            <td>
                                ${student.level || "-"}
                            </td>

                            <td>
                                -
                            </td>

                            <td>
                                -
                            </td>

                            <td>
                                Absent
                            </td>

                        </tr>

                    `;

                }

            }
        );


    } catch (error) {

        console.error(
            "Error loading session attendance:",
            error
        );

        lecturerAttendanceTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Error loading attendance records.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// CLOSE ATTENDANCE RECORDS
// ==========================================

closeCourseRecordsBtn.addEventListener(
    "click",
    () => {

        courseAttendanceRecordsContainer.classList.add(
            "hidden"
        );

    }
);


// ==========================================
// HISTORY COURSE SELECTION
// ==========================================

if (historyCourseSelect) {

    historyCourseSelect.addEventListener("change", async () => {

        const selectedCourseId = historyCourseSelect.value;

        // Nothing selected
        if (!selectedCourseId) {

            courseSessionsContainer.classList.add("hidden");

            courseAttendanceRecordsContainer.classList.add("hidden");

            selectedCourseAttendance.textContent =
                "Select a course to view its attendance history.";

            return;
        }

        // Find selected course
        const selectedCourse = lecturerCourses.find(
            course => course.id === selectedCourseId
        );

        if (!selectedCourse) {
            return;
        }

        // Load attendance sessions
        await showCourseSessions(
            selectedCourse.id,
            selectedCourse.courseCode,
            selectedCourse.courseName
        );

    });

}
// ==========================================
// LOGOUT
// ==========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout error:", error);

            alert("Unable to logout. Please try again.");

        }

    });

}
// ==========================================
// EXPORT ATTENDANCE TO PDF
// ==========================================

const exportAttendancePdfBtn = document.getElementById("exportAttendancePdfBtn");

if (exportAttendancePdfBtn) {

    exportAttendancePdfBtn.addEventListener("click", () => {

        try {

            // Make sure attendance records are currently displayed
            if (courseAttendanceRecordsContainer.classList.contains("hidden")) {
                alert("Please select an attendance session first.");
                return;
            }

            const { jsPDF } = window.jspdf;

            const pdf = new jsPDF("landscape");

            // ------------------------------------------
            // COURSE INFORMATION
            // ------------------------------------------

            const selectedCourseId = historyCourseSelect.value;

            const selectedCourse = lecturerCourses.find(
                course => course.id === selectedCourseId
            );

            if (!selectedCourse) {
                alert("Please select a course first.");
                return;
            }

            // ------------------------------------------
            // TITLE
            // ------------------------------------------

            pdf.setFontSize(18);
            pdf.setFont(undefined, "bold");

            pdf.text(
                "Attendance Report",
                148,
                18,
                { align: "center" }
            );

            // ------------------------------------------
            // COURSE DETAILS
            // ------------------------------------------

            pdf.setFontSize(11);
            pdf.setFont(undefined, "normal");
// ------------------------------------------
// SESSION INFORMATION
// ------------------------------------------

pdf.text(
    `Course: ${selectedCourse.courseCode} - ${selectedCourse.courseName}`,
    14,
    30
);

if (selectedAttendanceSession) {

    let sessionDate = "-";
    let startTime = "-";
    let endTime = "-";

    if (selectedAttendanceSession.startTime) {

        const start = selectedAttendanceSession.startTime.toDate();

        sessionDate = start.toLocaleDateString();
        startTime = start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    }

    if (selectedAttendanceSession.endTime) {

        const end = selectedAttendanceSession.endTime.toDate();

        endTime = end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    }

    pdf.text(
        `Date: ${sessionDate}`,
        14,
        38
    );

    pdf.text(
        `Start Time: ${startTime}`,
        75,
        38
    );

    pdf.text(
        `End Time: ${endTime}`,
        140,
        38
    );
}

pdf.text(
    `Expected Students: ${expectedStudents.textContent}`,
    14,
    46
);

pdf.text(
    `Present: ${presentStudents.textContent}`,
    80,
    46
);

pdf.text(
    `Absent: ${absentStudents.textContent}`,
    125,
    46
);

pdf.text(
    `Attendance Rate: ${attendanceRate.textContent}`,
    175,
    46
);

            // ------------------------------------------
            // GET TABLE DATA
            // ------------------------------------------

            const tableRows = [];

            const rows = lecturerAttendanceTable.querySelectorAll("tr");

            rows.forEach(row => {

                const cells = row.querySelectorAll("td");

                if (cells.length === 7) {

                    tableRows.push([
                        cells[0].textContent.trim(),
                        cells[1].textContent.trim(),
                        cells[2].textContent.trim(),
                        cells[3].textContent.trim(),
                        cells[4].textContent.trim(),
                        cells[5].textContent.trim(),
                        cells[6].textContent.trim()
                    ]);

                }

            });

            // ------------------------------------------
            // GENERATE TABLE
            // ------------------------------------------

            pdf.autoTable({

                startY: 56,

                head: [[
                    "Student Name",
                    "Matric Number",
                    "Department",
                    "Level",
                    "Date",
                    "Time",
                    "Status"
                ]],

                body: tableRows,

                theme: "grid",

                styles: {
                    fontSize: 8,
                    cellPadding: 3
                },

                headStyles: {
                    fontStyle: "bold"
                },

                columnStyles: {
                    0: { cellWidth: 45 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 45 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 30 },
                    5: { cellWidth: 30 },
                    6: { cellWidth: 25 }
                }

            });

            // ------------------------------------------
            // FOOTER
            // ------------------------------------------

            const pageCount = pdf.internal.getNumberOfPages();

            for (let i = 1; i <= pageCount; i++) {

                pdf.setPage(i);

                pdf.setFontSize(8);

                pdf.text(
                    `Generated by Attendance Management System`,
                    148,
                    200,
                    { align: "center" }
                );

            }

            // ------------------------------------------
            // SAVE PDF
            // ------------------------------------------

            const fileName =
                `${selectedCourse.courseCode}_Attendance_Report.pdf`;

            pdf.save(fileName);

        } catch (error) {

            console.error("PDF export error:", error);

            alert("Unable to export attendance report.");

        }

    });

}