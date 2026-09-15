import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const form =
    document.getElementById("lecturerSetupForm");

const message =
    document.getElementById("message");


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("lecturerEmail")
        .value
        .trim()
        .toLowerCase();

    const password =
        document.getElementById("lecturerPassword")
        .value;

    const confirmPassword =
        document.getElementById("confirmPassword")
        .value;


    // Check passwords
    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        message.style.color = "red";

        return;
    }


    if (password.length < 6) {

        message.textContent =
            "Password must be at least 6 characters.";

        message.style.color = "red";

        return;
    }


    try {

        console.log("Checking lecturer access...");


        // Find approved lecturer
        const lecturerQuery = query(
            collection(db, "lecturerAccess"),
            where("email", "==", email),
            where("status", "==", "approved")
        );


        const lecturerSnapshot =
            await getDocs(lecturerQuery);


        if (lecturerSnapshot.empty) {

            message.textContent =
                "You have not been approved by the Admin.";

            message.style.color = "red";

            return;
        }


        // Get lecturer information
        const lecturerDoc =
            lecturerSnapshot.docs[0];

        const lecturerData =
            lecturerDoc.data();


        console.log(
            "Approved lecturer found:",
            lecturerData
        );


        // Create Firebase Authentication account
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "Firebase account created:",
            user.uid
        );


        // Create lecturer profile
        await setDoc(
            doc(db, "lecturers", user.uid),
            {
                fullName: lecturerData.fullName,
                staffId: lecturerData.staffId,
                department: lecturerData.department,
                email: lecturerData.email,
          role: "lecturer",
        status: "active",
        createdAt: new Date()
            }
        );


        // Update access record
        await setDoc(
            doc(db, "lecturerAccess", lecturerDoc.id),
            {
                status: "registered"
            },
            {
                merge: true
            }
        );


        message.textContent =
            "Account created successfully. You can now login.";

        message.style.color = "green";


        form.reset();


        console.log(
            "Lecturer setup completed successfully"
        );


    } catch (error) {

        console.error(
            "Lecturer setup error:",
            error
        );


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message.textContent =
                "An account already exists with this email.";

        } else {

            message.textContent =
                error.message;

        }


        message.style.color = "red";

    }

});