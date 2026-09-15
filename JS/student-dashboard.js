console.log("student-dashboard.js loaded");
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    doc,
    getDoc,
    addDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// ATTENDANCE POPUP
// ===============================

const attendancePopup =
    document.getElementById("attendancePopup");

const popupIcon =
    document.getElementById("popupIcon");

const popupTitle =
    document.getElementById("popupTitle");

const popupMessage =
    document.getElementById("popupMessage");

const popupCloseBtn =
    document.getElementById("popupCloseBtn");


function showAttendancePopup(title, message, type = "success") {

    popupTitle.textContent = title;
    popupMessage.textContent = message;

    if (type === "success") {

        popupIcon.textContent = "✓";
        popupIcon.style.background = "#22c55e";

    } else if (type === "error") {

        popupIcon.textContent = "!";
        popupIcon.style.background = "#ef4444";

    } else if (type === "warning") {

        popupIcon.textContent = "!";
        popupIcon.style.background = "#f59e0b";

    }

    attendancePopup.style.display = "flex";
}


popupCloseBtn.addEventListener("click", () => {

    attendancePopup.style.display = "none";

});




async function loadFaceModels() {

    try {

        console.log("Loading face recognition models...");

        await faceapi.nets.tinyFaceDetector.loadFromUri("./models");

        console.log("Tiny Face Detector loaded");

        await faceapi.nets.faceLandmark68Net.loadFromUri("./models");

        console.log("Face Landmark model loaded");

        await faceapi.nets.faceRecognitionNet.loadFromUri("./models");

        console.log("Face Recognition model loaded");

        console.log("All face recognition models loaded successfully.");

    } catch (error) {

        console.error(
            "Error loading face recognition models:",
            error
        );

    }

}


// Face Registration Elements
const faceVideo = document.getElementById("faceVideo");
const startCameraBtn = document.getElementById("startCameraBtn");
const captureFaceBtn = document.getElementById("captureFaceBtn");
// const faceMessage = document.getElementById("faceMessage");
// const faceRegistrationSection =
//     document.getElementById("faceRegistrationSection");

const faceRegistrationSection =
    document.querySelector(".face-registration");

const verificationMessage =
    document.getElementById("faceMessage");

let faceStream = null;

async function startFaceCamera() {

    try {

        faceMessage.textContent =
            "Requesting camera access...";

        faceStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        faceVideo.srcObject = faceStream;

        faceMessage.textContent =
            "Camera ready. Position your face in the center.";

        captureFaceBtn.style.display = "inline-block";

        startCameraBtn.style.display = "none";

    } catch (error) {

        console.error("Camera error:", error);

        faceMessage.textContent =
            "Camera access is required for face registration.";
    }
}




captureFaceBtn.addEventListener(
    "click",
    async () => {

        try {

            faceMessage.textContent =
                "Detecting face...";


            const detection =
                await faceapi
                    .detectSingleFace(
                        faceVideo,
                        new faceapi.TinyFaceDetectorOptions()
                    )
                    .withFaceLandmarks()
                    .withFaceDescriptor();


    if (!detection) {

    console.log("No face detected.");

    // Stop camera
    if (faceStream) {
        faceStream.getTracks().forEach(track => track.stop());
        faceStream = null;
    }

    faceVideo.srcObject = null;

    // Keep registration section visible
    faceRegistrationSection.style.display = "block";

    // Reset buttons so the student can try again
    startCameraBtn.style.display = "inline-block";
    startCameraBtn.textContent = "Start Camera";
    startCameraBtn.disabled = false;

    captureFaceBtn.style.display = "none";

    faceMessage.textContent =
        "No face detected. Please start the camera and try again.";

    return false;
}


            console.log(
                "Face detected:",
                detection
            );


            // Convert Float32Array to normal JavaScript array
            const faceDescriptor =
                Array.from(
                    detection.descriptor
                );


            console.log(
                "Face descriptor:",
                faceDescriptor
            );


            // Get logged-in user
            const user =
                auth.currentUser;


            if (!user) {

                faceMessage.textContent =
                    "User is not logged in.";

                return;

            }


            // Save face to student's Firestore document
            const studentRef =
                doc(
                    db,
                    "students",
                    user.uid
                );


            await setDoc(
                studentRef,
                {
                    faceDescriptor:
                        faceDescriptor,

                    faceRegistered:
                        true,

                    faceRegisteredAt:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );


            faceMessage.textContent =
                "Face registered successfully!";


            console.log(
                "Face saved successfully to Firestore."
            );


            // Stop camera
            if (faceStream) {

                faceStream
                    .getTracks()
                    .forEach(
                        track => track.stop()
                    );

                faceStream = null;

            }


            faceVideo.srcObject = null;


            // Hide capture button
            captureFaceBtn.style.display =
                "none";


            // Change register button
            startCameraBtn.textContent =
                "Face Registered";

            startCameraBtn.disabled =
                true;


        }  catch (error) {

    console.error(
        "Face registration error:",
        error
    );

    // Stop camera if it is still running
    if (faceStream) {
        faceStream.getTracks().forEach(track => track.stop());
        faceStream = null;
    }

    faceVideo.srcObject = null;

    // Keep registration section visible
    faceRegistrationSection.style.display = "block";

    // Reset buttons
    startCameraBtn.style.display = "inline-block";
    startCameraBtn.textContent = "Start Camera";
    startCameraBtn.disabled = false;

    captureFaceBtn.style.display = "none";

    faceMessage.textContent =
        "Face registration failed. Please try again.";

}

    }
);













// Student Information
const activeAttendanceList = document.getElementById("activeAttendanceList");
const welcomeName = document.getElementById("welcomeName");
const studentName = document.getElementById("studentName");
const studentMatric = document.getElementById("studentMatric");
const studentDepartment = document.getElementById("studentDepartment")
const studentLevel = document.getElementById("studentLevel")
const attendanceTableBody = document.getElementById("attendanceTableBody");

// Logout Button
const logoutBtn = document.getElementById("logoutBtn");



// Check if student is logged in
onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Get student data from localStorage
    const student = JSON.parse(localStorage.getItem("student"));
    console.log("=================================");
console.log("IDENTITY CHECK BEFORE ATTENDANCE");
console.log("Firebase UID:", auth.currentUser?.uid);
console.log("Firebase Email:", auth.currentUser?.email);
console.log("LocalStorage student:", student);
console.log("LocalStorage name:", student?.fullName);
console.log("LocalStorage matric:", student?.matricNumber);
console.log("=================================");

    if (!student) {
        window.location.href = "login.html";
        return;
    }

    loadFaceModels();
    checkFaceRegistration(user.uid);
async function checkFaceRegistration(userId) {

    try {

        console.log("=================================");
        console.log("CHECKING FACE REGISTRATION");
        console.log("Authenticated UID:", userId);

        const studentRef =
            doc(db, "students", userId);

        console.log(
            "Student document path:",
            studentRef.path
        );

        const studentSnap =
            await getDoc(studentRef);

        console.log(
            "Student document exists:",
            studentSnap.exists()
        );

        if (!studentSnap.exists()) {

            console.log(
                "NO STUDENT DOCUMENT FOR THIS UID"
            );

            faceRegistrationSection.style.display =
                "block";

            return;

        }

        const studentData =
            studentSnap.data();

        console.log(
            "Student document data:",
            studentData
        );

        console.log(
            "Student name:",
            studentData.fullName
        );

        console.log(
            "Student matric:",
            studentData.matricNumber
        );

        console.log(
            "Face registered:",
            studentData.faceRegistered
        );

        console.log(
            "Face descriptor exists:",
            !!studentData.faceDescriptor
        );

        console.log(
            "Face descriptor length:",
            studentData.faceDescriptor
                ? studentData.faceDescriptor.length
                : 0
        );

        console.log("=================================");


        if (
            studentData.faceRegistered === true &&
            Array.isArray(studentData.faceDescriptor) &&
            studentData.faceDescriptor.length === 128
        ) {

            faceRegistrationSection.style.display =
                "none";

            console.log(
                "FACE IS REGISTERED FOR THIS STUDENT."
            );

        } else {

            faceRegistrationSection.style.display =
                "block";

            console.log(
                "FACE IS NOT REGISTERED FOR THIS STUDENT."
            );

        }

    } catch (error) {

        console.error(
            "Error checking face registration:",
            error
        );

    }

}

    // Display student details
   const firstName = student.fullName.split(" ")[0];
    welcomeName.textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    studentName.textContent = student.fullName;
    studentMatric.textContent = student.matricNumber;
    studentDepartment.textContent = student.department;
    studentLevel.textContent = student.level;

    loadRecentAttendance(user.uid);
    loadActiveAttendance();

});


async function loadRecentAttendance(studentId) {

    try {

        const attendanceRef = collection(db, "attendanceRecords");


        const q = query(
            attendanceRef,
            where("studentId", "==", studentId),
            orderBy("date", "desc"),
            limit(5)
        );


        const snapshot = await getDocs(q);
        console.log("=================================");
console.log("ATTENDANCE CHECK");
console.log("Current student UID:", studentId);
console.log("Number of records found:", snapshot.size);

snapshot.forEach((attendanceDoc) => {

    const data = attendanceDoc.data();

    console.log("Attendance ID:", attendanceDoc.id);
    console.log("Stored studentId:", data.studentId);
    console.log("Stored studentName:", data.studentName);
    console.log("Stored matricNumber:", data.matricNumber);
    console.log("Course:", data.courseCode);

});

console.log("=================================");


        attendanceTableBody.innerHTML = "";


        if (snapshot.empty) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;

        }


        snapshot.forEach((doc) => {

            const data = doc.data();


            const row = `
                <tr>

                    <td>${data.courseName}</td>

                    <td>${data.date}</td>

                    <td>${data.time}</td>

                    <td class="${data.status.toLowerCase()}">
                        ${data.status}
                    </td>

                </tr>
            `;


            attendanceTableBody.innerHTML += row;


        });


    } catch(error) {

        console.error(
            "Error loading attendance:",
            error
        );

    }

}


async function loadActiveAttendance() {

    try {

        // Get logged-in student's information
        const student = JSON.parse(
            localStorage.getItem("student")
        );

        if (!student) {

            console.log(
                "Student information not found"
            );

            return;
        }


        const studentDepartment =
            student.department.trim();

        const studentLevel =
            String(student.level).trim();


        // Get active attendance sessions
        const attendanceRef =
            collection(db, "attendanceSessions");


        const q = query(
            attendanceRef,
            where("status", "==", "active")
        );


        const snapshot = await getDocs(q);


        activeAttendanceList.innerHTML = "";


        if (snapshot.empty) {

            activeAttendanceList.innerHTML = `
                <p>No active attendance available</p>
            `;

            return;
        }


        let eligibleAttendanceFound = false;


        // Check every active session
        for (const sessionDoc of snapshot.docs) {

            const session =
                sessionDoc.data();


            // Check whether attendance has expired
            const now = new Date();

            const endTime =
                session.endTime.toDate();


            if (now > endTime) {

                continue;

            }


            // Get departments directly
            // from the attendance session
            const sessionDepartments =
                session.departments || [];


            // Get levels directly
            // from the attendance session
            const sessionLevels =
                session.levels || [];


            // Check department
            const departmentMatch =
                sessionDepartments.some(
                    department =>
                        department.trim().toLowerCase() ===
                        studentDepartment.toLowerCase()
                );


            // Check level
            const levelMatch =
                sessionLevels.some(
                    level =>
                        String(level).trim() ===
                        studentLevel
                );


            // Student is not eligible
            if (!departmentMatch || !levelMatch) {

                console.log(
                    "Student not eligible for:",
                    session.courseCode
                );

                continue;

            }


            // Student is eligible
            // Check if this student has already marked attendance
const attendanceQuery = query(
    collection(db, "attendanceRecords"),
    where("studentId", "==", auth.currentUser.uid),
    where("sessionId", "==", sessionDoc.id)
);

const attendanceSnapshot =
    await getDocs(attendanceQuery);


// Student already marked attendance
if (!attendanceSnapshot.empty) {

    console.log(
        "Attendance already marked for:",
        session.courseCode
    );

    continue;

}


// Student is eligible and has not marked attendance
eligibleAttendanceFound = true;


activeAttendanceList.innerHTML += `

    <div class="attendance-card" id="attendance-${sessionDoc.id}">

        <h3>
            ${session.courseCode}
        </h3>

        <p>
            ${session.courseName}
        </p>

        <p>
            Radius:
            ${session.radius} meters
        </p>

        <button
            onclick="markAttendance('${sessionDoc.id}')"
        >
            Mark Present
        </button>

    </div>

`;

        }


        // No attendance matched the student's
        // department and level
        if (!eligibleAttendanceFound) {

            activeAttendanceList.innerHTML = `
                <p>
                    No active attendance available
                    for your department and level.
                </p>
            `;

        }


    } catch (error) {

        console.error(
            "Error loading active attendance:",
            error
        );

    }

}


window.markAttendance = async function(sessionId) {

    console.log("Selected session:", sessionId);

    const sessionRef = doc(db, "attendanceSessions", sessionId);

    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {

       showAttendancePopup(
    "Session Not Found",
    "The attendance session could not be found.",
    "error"
);

        return;

    }

    const session = sessionSnap.data();

    console.log(session);


    // Check if attendance time has expired
// const now = new Date();

// const endTime = session.endTime.toDate();

// console.log("Current time:", now);
// console.log("Session end time:", endTime);


// Check if attendance session is active
if (session.status !== "active") {

    console.log("Attendance session is not active.");

    showAttendancePopup(
    "Session Closed",
    "This attendance session is no longer active.",
    "error"
);

    return;
}


// Check if attendance time has expired
const now = new Date();

const endTime = session.endTime.toDate();

console.log("Current time:", now);
console.log("Session end time:", endTime);


if (now > endTime) {

    console.log("Attendance session expired.");

    showAttendancePopup(
    "Attendance Expired",
    "The attendance session has expired. You can no longer mark attendance.",
    "error"
);

    return;
}


   navigator.geolocation.getCurrentPosition(

    async (position) => {

        const studentLat = position.coords.latitude;
        const studentLng = position.coords.longitude;


        console.log("Student latitude:", studentLat);
        console.log("Student longitude:", studentLng);

        console.log("Session latitude:", session.latitude);
        console.log("Session longitude:", session.longitude);

        console.log("Session radius:", session.radius);




        const distance = calculateDistance(
            studentLat,
            studentLng,
            session.latitude,
            session.longitude
        );


        console.log("Distance:", distance, "meters");


      if(distance <= session.radius){

    console.log("You are within attendance area");

    // Face verification
    const faceVerified =
        await verifyStudentFace();

    if (!faceVerified) {

        console.log(
            "Attendance rejected: face verification failed."
        );

        return;

    }

    console.log(
        "Face verified. Continuing attendance..."
    );


const user = auth.currentUser;

if (!user) {

    showAttendancePopup(
        "Login Required",
        "Your session has expired. Please log in again.",
        "error"
    );

    return;
}

const studentRef = doc(
    db,
    "students",
    user.uid
);

const studentSnap = await getDoc(studentRef);

if (!studentSnap.exists()) {

    showAttendancePopup(
        "Student Record Not Found",
        "Your student account record could not be found.",
        "error"
    );

    return;
}

const studentData = studentSnap.data();


// Check if attendance already exists

const attendanceQuery = query(
    collection(db, "attendanceRecords"),
    where("studentId", "==", auth.currentUser.uid),
    where("sessionId", "==", sessionId)
);


const attendanceSnapshot = await getDocs(attendanceQuery);


if (!attendanceSnapshot.empty) {

    console.log("Attendance already submitted");

    showAttendancePopup(
        "Already Marked",
        "You have already marked attendance for this session.",
        "warning"
    );

    return;

}


// Save attendance

await addDoc(
    collection(db, "attendanceRecords"),
    {
        studentId: user.uid,

        studentName: studentData.fullName,

        matricNumber: studentData.matricNumber,

        department: studentData.department,

        level: studentData.level,

        courseName: session.courseName,

        courseCode: session.courseCode,

        sessionId: sessionId,

        lecturerId: session.lecturerId,

        status: "Present",

        date: new Date().toLocaleDateString(),

        time: new Date().toLocaleTimeString(),

        createdAt: serverTimestamp()
    }
);


console.log("Attendance saved successfully");
await loadRecentAttendance(user.uid);

// Remove the attendance card
const attendanceCard =
    document.getElementById(
        `attendance-${sessionId}`
    );

if (attendanceCard) {

    attendanceCard.remove();

}


// Show success popup
showAttendancePopup(
    "Attendance Successful",
    "Your attendance has been marked successfully.",
    "success"
);



// showAttendancePopup(
//     "Attendance Successful",
//     "Your attendance has been marked successfully.",
//     "success"
// );


}else{

    console.log("You are outside attendance area");

     showAttendancePopup(
        "Outside Attendance Area",
        `You are outside the allowed attendance area. Your distance is ${Math.round(distance)} meters, while the allowed radius is ${session.radius} meters.`,
        "error"
    );


}

    },

    // (error) => {

    //     alert("Please allow location access.");

    // }

    (error) => {

    console.error("Location error:", error);

    showAttendancePopup(
        "Location Access Required",
        "Please allow location access so we can verify that you are within the attendance area.",
        "warning"
    );

}

);

};


async function verifyStudentFace() {

    const faceVideo = document.getElementById("faceVideo");

const faceRegistrationSection =
    document.querySelector(".face-registration");

const faceMessage =
    document.getElementById("faceMessage");

if (!faceVideo || !faceRegistrationSection || !faceMessage) {

    console.error(
        "Face verification elements not found:",
        {
            faceVideo,
            faceRegistrationSection,
            faceMessage
        }
    );

    return false;
}

    try {

        // Get student's registered face
        const user = auth.currentUser;
        console.log("Face verification UID:", user?.uid);

        if (!user) {

            console.error("No authenticated student.");

            return false;

        }

        const studentRef = doc(
            db,
            "students",
            user.uid
        );

        console.log("Firebase project:", db.app.options.projectId);
console.log("Looking for:", studentRef.path);

   let studentSnap;

try {

    studentSnap = await getDoc(studentRef);

} catch (error) {

    console.error(
        "STUDENT FIRESTORE READ ERROR:",
        error
    );

    return false;

}

console.log(
    "Student document exists:",
    studentSnap.exists()
);

console.log(
    "Student document data:",
    studentSnap.exists()
        ? studentSnap.data()
        : "NO DATA"
);

if (!studentSnap.exists()) {

    console.error(
        "Student document not found:",
        studentRef.path
    );

    return false;



        }

        const studentData = studentSnap.data();

        if (
            !studentData.faceDescriptor ||
            !studentData.faceRegistered
        ) {

            console.log("Student has not registered a face.");

                showAttendancePopup(
                "Face Registration Required",
                "Please register your face before marking attendance.",
                "warning"
            );

            return false;

        }

        console.log(
            "Registered face descriptor found:",
            studentData.faceDescriptor.length
        );

        // Start camera           


        // Show the face box again for verification
// Show the face box for verification
faceRegistrationSection.style.display = "block";

faceMessage.textContent =
    "Position your face in the camera for verification...";

// Hide registration buttons during face verification
startCameraBtn.style.display = "none";
captureFaceBtn.style.display = "none";

// Start camera
const stream =
    await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });

// Put the real MediaStream into the video
faceVideo.srcObject = stream;

console.log("Camera started.");

        // Give camera a moment to start

  // Give the camera time to fully start
await new Promise(resolve => setTimeout(resolve, 2000));

faceMessage.textContent =
    "Looking for your face... Please look at the camera.";

// Keep checking for a face for up to 10 seconds
let detection = null;

const startTime = Date.now();

while (!detection && Date.now() - startTime < 10000) {

    detection =
        await faceapi
            .detectSingleFace(
                faceVideo,
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

    // Wait a little before trying again
 if (!detection) {

    console.log("Face not detected yet. Trying again...");

    await new Promise(
        resolve => setTimeout(resolve, 500)
    );

}

}


if (!detection) {

    console.log("No face detected after 10 seconds.");

    stream.getTracks().forEach(
        track => track.stop()
    );

    faceVideo.srcObject = null;

    faceRegistrationSection.style.display = "none";

    showAttendancePopup(
    "Face Not Detected",
    "No face was detected. Please position your face in front of the camera and try again.",
    "error"
);

    return false;
}


        console.log(
            "Face detected successfully."
        );

        // New 128-value descriptor
        const currentDescriptor =
            detection.descriptor;

        console.log(
            "New face descriptor:",
            currentDescriptor.length
        );

        // Convert stored descriptor to Float32Array
        const registeredDescriptor =
            new Float32Array(
                studentData.faceDescriptor
            );

        // Compare faces
        const distance =
            faceapi.euclideanDistance(
                currentDescriptor,
                registeredDescriptor
            );

        console.log(
            "Face distance:",
            distance
        );

        // Stop camera
        stream.getTracks().forEach(
            track => track.stop()
        );

        faceVideo.srcObject = null;

        // Face match threshold
        if (distance < 0.6) {

    console.log(
        "Face verification successful."
    );

    faceMessage.textContent =
        "Face verified successfully!";

    // Give the student a moment to see the result
    await new Promise(resolve => setTimeout(resolve, 1000));

    faceRegistrationSection.style.display = "none";
    

    return true;

} else {

    console.log(
        "Face verification failed."
    );

    faceMessage.textContent =
        "Face does not match. Please try again.";

    await new Promise(resolve =>
        setTimeout(resolve, 1500)
    );

    faceRegistrationSection.style.display = "none";

   showAttendancePopup(
    "Face Verification Failed",
    "Your face does not match the registered student.",
    "error"
);

    return false;

}

    } catch (error) {

        console.error(
            "Face verification error:",
            error
        );

       showAttendancePopup(
    "Verification Error",
    "Unable to verify your face. Please try again.",
    "error"
);

        return false;

    }

}



function calculateDistance(lat1, lon1, lat2, lon2){

    const R = 6371000; // Earth radius in meters

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;


    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) *
        Math.sin(dLon/2);


    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1-a)
    );


    return R * c;

}

// Logout
logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        localStorage.removeItem("student");

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

});

startCameraBtn.addEventListener(
    "click",
    async () => {

        try {

            faceMessage.textContent =
                "Requesting camera access...";

            faceStream =
                await navigator.mediaDevices.getUserMedia({
                    video: true
                });


            faceVideo.srcObject =
                faceStream;


            faceMessage.textContent =
                "Camera ready. Position your face in the camera.";

            startCameraBtn.style.display =
                "none";

            captureFaceBtn.style.display =
                "inline-block";


        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

            faceMessage.textContent =
                "Camera permission is required.";

        }

    }
);

